import PhenomenonView from '@/components/phenomenon/organisms/PhenomenonView';
import PhenomenonCard from '@/components/phenomenon/organisms/PhenomenonCard';
import {
  RenderablePhenomenon,
  Manifest,
  RenderableBlock,
  AlternativeWithContent,
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

async function getPhenomenon(
  slug: string,
): Promise<RenderablePhenomenon | null> {
  try {
    const publicDir = getPublicDirPath();
    const manifestPath = path.join(publicDir, slug, 'manifest.json');

    // 1. Read the manifest file from the filesystem
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest: Manifest = JSON.parse(manifestContent);

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

        // Fetch all alternatives content
        const alternativesWithContentPromises = blockData.alternatives
          .filter((alt) => alt.lang === manifest.default_lang)
          .map(async (alt) => {
            const altContentPath = path.join(publicDir, slug, alt.file);
            const altContent = await fs.readFile(altContentPath, 'utf-8');
            return {
              alternative: alt,
              content: altContent,
            };
          });

        const alternativesWithContent = await Promise.all(alternativesWithContentPromises);

        const renderableBlock: RenderableBlock = {
          id: structureNode.block_id,
          type: blockData.type,
          level: structureNode.level,
          content,
          source: winningAlternative.source,
          alternativesCount: blockData.alternatives.length,
          alternatives: alternativesWithContent,
          winningAlternativeFile: winningAlternative.file,
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
    // If the manifest file doesn't exist or there's a parsing error, treat as a 404
    console.error(`Error building page for slug "${slug}":`, error);
    return null;
  }
}

export default async function PhenomenonPage({
  params,
}: PhenomenonPageProps) {
  const p = await params;
  const slug = p.slug;
  const phenomenon = await getPhenomenon(slug);

  if (!phenomenon) {
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
        <PhenomenonView phenomenon={phenomenon} />
      </Container>
    </Layout>
  );
}
