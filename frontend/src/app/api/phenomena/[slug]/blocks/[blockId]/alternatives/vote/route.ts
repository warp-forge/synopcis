import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { slug: string; blockId: string } }
) {
  const body = await request.json();
  const { alternativeFile } = body;

  console.log(`[API] Voting for alternative ${alternativeFile} in block ${params.blockId} for ${params.slug}`);

  // Here we would typically update the database.
  // For now, we return a success response.
  return NextResponse.json({ success: true, message: 'Vote recorded successfully' });
}
