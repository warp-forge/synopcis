import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { slug: string; blockId: string } }
) {
  const body = await request.json();
  const { content } = body;

  console.log(`[API] Proposing new alternative for block ${params.blockId} in ${params.slug}: ${content}`);

  // Here we would typically save the proposed markdown to the database/filesystem.
  // For now, we return a success response with a mocked alternative object.
  const newAlternative = {
    content,
    alternative: {
      file: `proposed-${Date.now()}.md`,
      lang: 'en',
      votes: 1,
      source: null,
      trust_score: 0,
    }
  };

  return NextResponse.json({ success: true, alternative: newAlternative });
}
