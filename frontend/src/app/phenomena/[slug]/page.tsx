import PhenomenonView from '@/components/phenomenon/organisms/PhenomenonView';
import PhenomenonCard from '@/components/phenomenon/organisms/PhenomenonCard';
import {
  RenderablePhenomenon,
  Manifest,
  RenderableBlock,
} from '@/types/phenomenon';
import path from 'path';
import { promises as fs } from 'fs';
import { Container, Title } from '@mantine/core';
import Layout from '@/components/shared/organisms/Layout';

// Helper to construct the correct path to the public directory
const getPublicDirPath = () => {
  // The npm script `dev:ssg` is run from the `app/` directory,
  // and the Next.js project root is `apps/ssg-frontend`.
  return path.join(process.cwd(), 'apps/ssg-frontend/public');
};

type PhenomenonPageProps = {
  params: { slug: string };
};

async function getManifest(slug: string): Promise<Manifest | null> {
  try {
    const publicDir = getPublicDirPath();
    const manifestPath = path.join(publicDir, slug, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(manifestContent);
  } catch (error) {
    console.error(`Error reading manifest for slug "${slug}":`, error);
    return null;
  }
}

async function getPhenomenon(
  slug: string,
  manifest: Manifest | null,
): Promise<RenderablePhenomenon | null> {
  if (!manifest) return null;
  try {
    const publicDir = getPublicDirPath();

    // 2. Process the structure to build the list of renderable blocks
    const renderableBlocksPromises = manifest.structure.map(
      async (structureNode) => {
        const blockData = manifest.blocks[structureNode.block_id];
        if (!blockData) {
          console.warn(
            `Block data not found for block_id: ${structureNode.block_id}`,
          );
          return null;
        }

        // Find the "winning" alternative based on votes for the default language
        const winningAlternative = blockData.alternatives
          .filter((alt) => alt.lang === manifest.default_lang)
          .sort((a, b) => b.votes - a.votes)[0]; // Get the one with the most votes

        if (!winningAlternative) {
          console.warn(
            `No suitable alternative found for block_id: ${structureNode.block_id}`,
          );
          return null;
        }

        // Read the markdown content from its file
        const contentPath = path.join(
          publicDir,
          slug,
          winningAlternative.file,
        );
        const content = await fs.readFile(contentPath, 'utf-8');

        const renderableBlock: RenderableBlock = {
          id: structureNode.block_id,
          type: blockData.type,
          level: structureNode.level,
          content,
          source: winningAlternative.source,
          alternativesCount: blockData.alternatives.length,
        };
        return renderableBlock;
      },
    );

    // Wait for all file reads to complete and filter out any nulls
    const renderableBlocks = (
      await Promise.all(renderableBlocksPromises)
    ).filter((block): block is RenderableBlock => block !== null);

    // If no blocks could be rendered, the page is not found
    if (renderableBlocks.length === 0) {
      return null;
    }

    const phenomenon: RenderablePhenomenon = {
      slug: manifest.article_slug,
      title: manifest.title,
      cardData: manifest.card || undefined,
      blocks: renderableBlocks,
    };

    return phenomenon;
  } catch (error) {
    console.error(`Error building page for slug "${slug}":`, error);
    return null;
  }
}

export default async function PhenomenonPage({
  params,
}: PhenomenonPageProps) {
  const manifest = await getManifest(params.slug);
  const phenomenon = await getPhenomenon(params.slug, manifest);

  if (!phenomenon || !manifest) {
    return <div>Phenomenon not found.</div>;
  }

  // The PhenomenonView now needs to be compatible with RenderablePhenomenon
  return (
    <Layout>
      <Container>
        <Title order={1} my="xl">
          {phenomenon.title}
        </Title>
        {phenomenon.cardData && (
          <PhenomenonCard properties={phenomenon.cardData.properties} />
        )}
        <PhenomenonView phenomenon={phenomenon} manifest={manifest} />
      </Container>
    </Layout>
  );
}
