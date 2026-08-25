import { NextResponse } from 'next/server';
import { getDb } from '@/lib/admin-db';

export async function GET() {
  const db = getDb();
  return NextResponse.json({ success: true, data: db.listings || [] });
}