import { NextResponse } from 'next/server';
import { DiffResult } from '@/types/history';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  const commit1 = searchParams.get('commit1');
  const commit2 = searchParams.get('commit2');

  if (!file || !commit1 || !commit2) {
    return NextResponse.json(
      { error: 'Missing required parameters (file, commit1, commit2)' },
      { status: 400 }
    );
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // A very simple unified diff mock
  const mockDiff = `--- a/${file}
+++ b/${file}
@@ -1,5 +1,5 @@
-This is the old text.
+This is the new text.

 It had some typos,
-which have now been fixed in this line.
+which have now been corrected in this line.

 And some more unchanged text below.`;

  return NextResponse.json({ diff: mockDiff } as DiffResult);
}
