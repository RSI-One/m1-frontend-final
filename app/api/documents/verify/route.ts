import { NextResponse } from 'next/server';

import { getDb, saveDb } from '@/lib/admin-db';

interface Document {
  id: string;
  status?: string;
  verificationStatus?: string;
}

interface Listing {
  id: string;
  docs?: Document[];
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { listingId, docId }: { listingId: string; docId: string } =
      await request.json();

    const db = getDb();

    // Check both listings and approvals for the doc
    let target = db.listings.find((l: Listing) => l.id === listingId);

    if (!target) {
      target = db.approvals.find((a: Listing) => a.id === listingId);
    }

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const doc = target.docs?.find((d: Document) => d.id === docId);

    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    doc.status = 'Verified';
    doc.verificationStatus = 'Verified';

    saveDb(db);

    return NextResponse.json({
      success: true,
      doc,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}