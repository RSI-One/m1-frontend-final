import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/admin-db';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { listingId }: { listingId: string } = await request.json();

    const db = getDb();

    let listing = null;

    // Check approvals
    const approvalIndex = db.approvals.findIndex(
      (a) => a.id === listingId
    );

    if (approvalIndex > -1) {
      listing = db.approvals.splice(approvalIndex, 1)[0];

      if (!db.listings.find((l) => l.id === listingId)) {
        db.listings.push(listing);
      }
    } else {
      listing = db.listings.find((l) => l.id === listingId);
    }

    if (!listing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing not found',
        },
        { status: 404 }
      );
    }

    listing.verificationStatus = 'Verified';
    listing.status = 'Active';
    listing.verified = true;
    listing.verifiedDate = new Date().toISOString().split('T')[0];

    if (listing.docs) {
     listing.docs.forEach(
  (d: { status?: string; verificationStatus?: string }) => {
        d.status = 'Verified';
        d.verificationStatus = 'Verified';
      });
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Something went wrong';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}