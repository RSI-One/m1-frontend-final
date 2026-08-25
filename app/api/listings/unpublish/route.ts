import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/admin-db';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { listingId }: { listingId: string } = await request.json();
    const db = getDb();

    const listing = db.listings.find((l) => l.id === listingId);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    listing.status = 'Unpublished';
    listing.verificationStatus = 'Unpublished';

    saveDb(db);

    return NextResponse.json({
      success: true,
      listing,
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