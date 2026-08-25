import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/admin-db';

export async function POST(request) {
  try {
    const { listingId } = await request.json();
    const db = getDb();
    
    const listing = db.listings.find(l => l.id === listingId);

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    listing.status = 'Unpublished';
    listing.verificationStatus = 'Unpublished';

    saveDb(db);
    return NextResponse.json({ success: true, listing });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}