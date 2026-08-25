import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/admin-db';

export async function POST(request) {
  try {
    const { listingId, docId } = await request.json();
    const db = getDb();
    
    // Check both listings and approvals for the doc
    let target = db.listings.find(l => l.id === listingId);
    if (!target) {
      target = db.approvals.find(a => a.id === listingId);
    }
    
    if (!target) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const doc = target.docs?.find(d => d.id === docId);
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    doc.status = 'Verified';
    doc.verificationStatus = 'Verified';

    saveDb(db);
    return NextResponse.json({ success: true, doc });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}