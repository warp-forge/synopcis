import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Manifest, AlternativeWithContent } from '@/types/phenomenon';

const getPublicDirPath = () => path.join(process.cwd(), 'public');

export async function POST(
  request: Request,
  { params }: { params: { slug: string; blockId: string } }
) {
  try {
    const { slug, blockId } = await params;
    const body = await request.json();
    const { content } = body;

    const publicDir = getPublicDirPath();
    const manifestPath = path.join(publicDir, slug, 'manifest.json');

    // Read current manifest
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest: Manifest = JSON.parse(manifestContent);

    if (!manifest.blocks[blockId]) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Create a new alternative entry
    const newAlternativeFile = `proposed-${Date.now()}.md`;
    const lang = manifest.default_lang || 'en';
    const relativePath = `${lang}/${newAlternativeFile}`;

    const newAlternativeMeta = {
      file: relativePath,
      lang: lang,
      votes: 1,
      source: null,
      trust_score: 0,
    };

    // Write the new content to the filesystem
    const newContentDir = path.join(publicDir, slug, lang);
    await fs.mkdir(newContentDir, { recursive: true });

    const newContentPath = path.join(publicDir, slug, relativePath);
    await fs.writeFile(newContentPath, content, 'utf-8');

    // Add to manifest and save
    manifest.blocks[blockId].alternatives.push(newAlternativeMeta);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    const newAlternative: AlternativeWithContent = {
      content,
      alternative: newAlternativeMeta
    };

    return NextResponse.json({ success: true, alternative: newAlternative });
  } catch (error) {
    console.error('Error proposing alternative:', error);
    return NextResponse.json({ error: 'Failed to propose alternative' }, { status: 500 });
  }
}
