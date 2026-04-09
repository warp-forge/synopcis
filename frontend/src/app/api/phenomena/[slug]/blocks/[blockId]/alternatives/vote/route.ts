import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Manifest } from '@/types/phenomenon';

const getPublicDirPath = () => path.join(process.cwd(), 'public');

export async function POST(
  request: Request,
  { params }: { params: { slug: string; blockId: string } }
) {
  try {
    const { slug, blockId } = await params;
    const body = await request.json();
    const { alternativeFile } = body;

    const publicDir = getPublicDirPath();
    const manifestPath = path.join(publicDir, slug, 'manifest.json');

    // Read current manifest
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest: Manifest = JSON.parse(manifestContent);

    if (!manifest.blocks[blockId]) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Find and update the vote count
    let alternativeFound = false;
    manifest.blocks[blockId].alternatives = manifest.blocks[blockId].alternatives.map(alt => {
      if (alt.file === alternativeFile) {
        alternativeFound = true;
        return { ...alt, votes: alt.votes + 1 };
      }
      return alt;
    });

    if (!alternativeFound) {
      return NextResponse.json({ error: 'Alternative not found' }, { status: 404 });
    }

    // Write back to the manifest file (Simulating a real database update)
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
