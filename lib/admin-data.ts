export const CURRENT_YEAR = new Date().getFullYear();

export function pfp(seed: number, gender: 'men' | 'women'): string {
  return `https://randomuser.me/api/portraits/${gender}/${seed}.jpg`;
}

export function esc(str: string): string {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]
  );
}

export function byId(id: string): HTMLElement | null {
  return typeof document !== 'undefined' ? document.getElementById(id) : null;
}

export interface ModuleDef {
  id: string;
  label: string;
  desc: string;
  requiredPermission: string;
  badge?: string;
}

export const moduleDefs: ModuleDef[] = [
  { id: 'databases', label: 'Databases', desc: 'Users, partners, assets, inventory', requiredPermission: 'databases.view' },
  { id: 'eacquisition', label: 'E-Acquisition', desc: 'Leads · M1 Wall · Efficiency', requiredPermission: 'e_acquisition.view' },
  { id: 'datafetching', label: 'Data Fetching', desc: 'Asset intel · Market news', requiredPermission: 'data_fetching.view', badge: 'BETA' },
  { id: 'listings', label: 'Listings', desc: 'Marketplace listings', requiredPermission: 'listings.view' },
  { id: 'verifications', label: 'Verifications', desc: 'Active · Approvals · Incomplete', requiredPermission: 'verifications.view' },
  { id: 'featuring', label: 'Featuring', desc: 'Requests · Featured · Analytics', requiredPermission: 'featuring.view' },
  { id: 'acquisition', label: 'Acquisition / Deal Flow', desc: '7-stage deal pipeline', requiredPermission: 'acquisition.view' },
  { id: 'finance', label: 'Finance', desc: 'Revenue, expenses, transactions', requiredPermission: 'finance.view' },
  { id: 'problems', label: 'Problems Reported', desc: 'Active · Solved · Support', requiredPermission: 'problems.view' },
  { id: 'admin', label: 'Admin Portal', desc: 'Manage admins and permissions', requiredPermission: 'admins.view' },
  { id: 'audit_logs', label: 'Audit Logs', desc: 'Admin activity and security events', requiredPermission: 'audit_logs.view' },
];

export interface UserRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  pfp: string;
  listings: number;
  active: number;
  featured: number;
  verified: number;
  acqRequests: number;
}

export const users: UserRecord[] = [
  { id: 'u1', name: 'Karim Al-Farsi', company: 'Al-Farsi Holdings', email: 'karim@alfarsi.com', phone: '+971 50 111 2233', pfp: pfp(11, 'men'), listings: 6, active: 4, featured: 2, verified: 3, acqRequests: 2 },
  { id: 'u2', name: 'Elena Voss', company: 'Voss Capital', email: 'elena@vosscapital.com', phone: '+41 79 222 3344', pfp: pfp(65, 'women'), listings: 3, active: 2, featured: 1, verified: 2, acqRequests: 1 },
  { id: 'u3', name: 'Marcus Webb', company: '—', email: 'marcus.webb@gmail.com', phone: '+1 305 333 4455', pfp: pfp(22, 'men'), listings: 1, active: 1, featured: 0, verified: 0, acqRequests: 0 },
  { id: 'u4', name: 'Priya Chandran', company: 'Chandran Maritime', email: 'priya@chandranmaritime.com', phone: '+65 8123 4567', pfp: pfp(48, 'women'), listings: 5, active: 3, featured: 2, verified: 4, acqRequests: 3 },
  { id: 'u5', name: 'Tomasz Nowak', company: 'Nowak Aviation Group', email: 'tomasz@nowakaviation.com', phone: '+48 601 222 111', pfp: pfp(35, 'men'), listings: 2, active: 2, featured: 0, verified: 1, acqRequests: 0 },
  { id: 'u6', name: 'Aiko Tanaka', company: '—', email: 'aiko.tanaka@outlook.com', phone: '+81 90 4444 5566', pfp: pfp(77, 'women'), listings: 0, active: 0, featured: 0, verified: 0, acqRequests: 1 },
  { id: 'u7', name: 'Diego Ferreira', company: 'Ferreira Yachts', email: 'diego@ferreirayachts.com', phone: '+55 21 98888 7766', pfp: pfp(15, 'men'), listings: 4, active: 4, featured: 1, verified: 2, acqRequests: 1 },
  { id: 'u8', name: 'Layla Haddad', company: 'Haddad Private Office', email: 'layla@haddadoffice.com', phone: '+961 3 555 222', pfp: pfp(9, 'women'), listings: 2, active: 1, featured: 1, verified: 1, acqRequests: 2 },
];

export interface PartnerMember {
  name: string;
  number: string;
  email: string;
}

export interface Partner {
  id: string;
  company: string;
  location: string;
  founder: string;
  email: string;
  website: string;
  phone: string;
  members: PartnerMember[];
}

export const partners: Partner[] = [
  { id: 'p1', company: 'Skyline Brokers', location: 'Geneva, CH', founder: 'Jonas Reiter', email: 'jonas@skylinebrokers.ch', website: 'skylinebrokers.ch', phone: '+41 22 333 4455', members: [{ name: 'Nina Frei', number: '+41 22 333 4456', email: 'nina@skylinebrokers.ch' }] },
  { id: 'p2', company: 'Azure Maritime Group', location: 'Monaco', founder: 'Camille Duval', email: 'camille@azuremaritime.mc', website: 'azuremaritime.mc', phone: '+377 93 111 222', members: [{ name: 'Hugo Farel', number: '+377 93 111 223', email: 'hugo@azuremaritime.mc' }] },
  { id: 'p3', company: 'Falcon Trade Partners', location: 'Dubai, UAE', founder: 'Rashid Al-Mansoori', email: 'rashid@falcontrade.ae', website: 'falcontrade.ae', phone: '+971 4 222 3344', members: [] },
];

export function jetImg(i: number): string {
  const ids = ['photo-1540962351504-03099e0a754b', 'photo-1474302770737-173ee21bab63', 'photo-1635672033263-a19f27eaefa8', 'photo-1619659085985-f51a00f0160a'];
  return `https://images.unsplash.com/${ids[i % 4]}?w=600&h=400&fit=crop&auto=format`;
}

export interface AssetDbItem {
  id: string;
  manufacturer: string;
  model: string;
  type: string;
  passengers: number;
  image: string;
}

export const assetsDb: AssetDbItem[] = [
  { id: 'a1', manufacturer: 'Gulfstream', model: 'G700', type: 'Long Range Jet', passengers: 19, image: jetImg(0) },
  { id: 'a2', manufacturer: 'Dassault', model: 'Falcon 10X', type: 'Long Range Jet', passengers: 16, image: jetImg(1) },
  { id: 'a3', manufacturer: 'Bombardier', model: 'Global 7500', type: 'Long Range Jet', passengers: 19, image: jetImg(2) },
  { id: 'a4', manufacturer: 'Embraer', model: 'Phenom 300E', type: 'Light Jet', passengers: 9, image: jetImg(3) },
  { id: 'a5', manufacturer: 'Cessna', model: 'Citation X+', type: 'Heavy Jet', passengers: 12, image: jetImg(0) },
  { id: 'a6', manufacturer: 'Pilatus', model: 'PC-24', type: 'Light Jet', passengers: 10, image: jetImg(1) },
];

export interface InventoryItem {
  id: string;
  owner: string;
  asset: string;
  status: string;
  since: string;
}

export const inventory: InventoryItem[] = [
  { id: 'i1', owner: 'Karim Al-Farsi', asset: 'Gulfstream G700', status: 'In fleet', since: '2023' },
  { id: 'i2', owner: 'Priya Chandran', asset: 'Feadship Sabrewing', since: '2022', status: 'In fleet' },
  { id: 'i3', owner: 'Diego Ferreira', asset: 'Benetti B.Now 50M', since: '2021', status: 'Pending transfer' },
];

export interface OffMarketItem {
  id: string;
  name: string;
  owner: string;
  ask: string;
  status: string;
}

export const offMarket: OffMarketItem[] = [
  { id: 'om1', name: 'Falcon 8X — Private Reserve', owner: 'Layla Haddad', ask: '$56M', status: 'Off-market' },
  { id: 'om2', name: 'Royal Huisman 60m Sloop', owner: 'Elena Voss', ask: '$41M', status: 'Off-market' },
];

export interface Lead {
  id: string;
  name: string;
  model: string;
  pax: number;
  phone: string;
  email: string;
  location: string;
  bizEmail: string;
  suggestions: string[];
  answers: string[];
}

export const leads: Lead[] = [
  { id: 'l1', name: 'Samuel Kgosi', model: 'Gulfstream G700', pax: 14, phone: '+27 82 111 2233', email: 'samuel@kgosigroup.co.za', location: 'Johannesburg, ZA', bizEmail: 's.kgosi@kgosigroup.co.za', suggestions: ['Falcon 10X', 'Global 7500'], answers: ['Long range international travel', '12-16 seats', 'Within 6 months', '$60-80M', 'Owned, not chartered', 'Yes, trade-in a G650', 'New or pre-owned, either'] },
  { id: 'l2', name: 'Ines Rocha', model: 'Falcon 10X', pax: 10, phone: '+351 91 222 3344', email: 'ines@rochaholdings.pt', location: 'Lisbon, PT', bizEmail: 'i.rocha@rochaholdings.pt', suggestions: ['G700', 'Global 7500'], answers: ['Family + staff travel', '8-12 seats', '3-6 months', '$50-75M', 'Leasing considered', 'No trade-in', 'Pre-owned preferred'] },
  { id: 'l3', name: 'Wei Zhang', model: 'Phenom 300E', pax: 6, phone: '+86 138 1234 5678', email: 'wei.zhang@zhangventures.cn', location: 'Shanghai, CN', bizEmail: 'w.zhang@zhangventures.cn', suggestions: ['PC-24', 'Citation X+'], answers: ['Regional business trips', '4-8 seats', 'ASAP', '$8-12M', 'Owned', 'No trade-in', 'New only'] },
];

export interface M1WallItem {
  id: string;
  partner: string;
  hours: number;
}

export const m1wall: M1WallItem[] = [
  { id: 'w1', partner: 'Skyline Brokers', hours: 142 },
  { id: 'w2', partner: 'Azure Maritime Group', hours: 88 },
  { id: 'w3', partner: 'Falcon Trade Partners', hours: 203 },
];

export interface AdminDoc {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  status: string;
  verificationStatus: string;
  issuingAuthority: string;
}

interface DocTemplate {
  name: string;
  category: string;
  type: string;
  size: string;
}

function generateAdminDocs(listingId: string, isVerified: boolean): AdminDoc[] {
  const templates: DocTemplate[] = [
    { name: "FAA Form 8050-3 Registration Certificate", category: "Ownership & Legal", type: "pdf", size: "2.4 MB" },
    { name: "Standard Certificate of Airworthiness (Form 8130-7)", category: "Ownership & Legal", type: "pdf", size: "1.8 MB" },
    { name: "Lien Release & Title Clearance Guarantee", category: "Ownership & Legal", type: "pdf", size: "3.1 MB" },
    { name: "Owner Trust Agreement & Declaration", category: "Ownership & Legal", type: "pdf", size: "4.0 MB" },
    { name: "Exclusive Broker Listing Agreement", category: "Ownership & Legal", type: "pdf", size: "1.5 MB" },
    { name: "Master Weight & Balance Report", category: "Specifications & History", type: "pdf", size: "2.9 MB" },
    { name: "ICAO Noise Compliance Certificate", category: "Specifications & History", type: "pdf", size: "1.1 MB" },
    { name: "Avionics & Cabin Equipment Inventory", category: "Specifications & History", type: "pdf", size: "1.7 MB" },
    { name: "24-Month Maintenance Log Export (CAMP)", category: "Maintenance & Airworthiness", type: "pdf", size: "12.4 MB" },
    { name: "Airworthiness Directive Compliance Log", category: "Maintenance & Airworthiness", type: "pdf", size: "3.6 MB" },
    { name: "Service Bulletin Summary Sign-off", category: "Maintenance & Airworthiness", type: "pdf", size: "4.2 MB" },
    { name: "100-Hour / Annual Inspection Log (Part 145)", category: "Maintenance & Airworthiness", type: "pdf", size: "2.8 MB" },
    { name: "Engine Logbook #1 (Left Engine)", category: "Engine & APU", type: "pdf", size: "15.2 MB" },
    { name: "Engine Logbook #2 (Right Engine)", category: "Engine & APU", type: "pdf", size: "14.8 MB" },
    { name: "APU Maintenance & Overhaul Record", category: "Engine & APU", type: "pdf", size: "4.7 MB" },
    { name: "Engine Program Enrollment (CorporateCare)", category: "Engine & APU", type: "pdf", size: "2.2 MB" },
    { name: "RVSM Airworthiness Approval Certificate", category: "Avionics & Systems", type: "pdf", size: "1.3 MB" },
    { name: "ADS-B Out Outband Calibration Audit", category: "Avionics & Systems", type: "pdf", size: "1.4 MB" },
    { name: "Pre-Purchase Inspection Audit Report 2026", category: "Inspection & Financial", type: "pdf", size: "18.6 MB" },
    { name: "Aviation Hull & Liability Insurance Cert", category: "Inspection & Financial", type: "pdf", size: "1.9 MB" },
    { name: "Tax Clearance & VAT Statement", category: "Inspection & Financial", type: "pdf", size: "2.0 MB" },
    { name: "Flight Operations Log & Route History", category: "Specifications & History", type: "pdf", size: "5.3 MB" },
    { name: "Borescope Inspection Video & Report", category: "Engine & APU", type: "pdf", size: "6.1 MB" },
    { name: "Supplemental Type Cert (STC) Records", category: "Maintenance & Airworthiness", type: "pdf", size: "3.0 MB" },
    { name: "Deferred Maintenance & MEL Item Log", category: "Maintenance & Airworthiness", type: "pdf", size: "0.9 MB" },
  ];

  return templates.map((t, idx) => ({
    id: `DOC-${listingId}-${101 + idx}`,
    name: t.name,
    category: t.category,
    uploadDate: `2026-07-${10 + (idx % 18)}`,
    fileType: t.type,
    fileSize: t.size,
    status: isVerified ? "Verified" : (idx % 3 === 0 ? "Pending" : "Verified"),
    verificationStatus: isVerified ? "Verified" : (idx % 3 === 0 ? "Pending" : "Verified"),
    issuingAuthority: "Civil Aviation Authority / FAA",
  }));
}

export interface Listing {
  id: string;
  name: string;
  category: string;
  owner: string;
  email: string;
  phone: string;
  company: string;
  ask: string;
  status: string;
  verificationStatus: string;
  featuredStatus: string;
  flag: string | null;
  verified: boolean;
  featured: boolean;
  verifiedDate: string;
  submissionDate: string;
  docs: AdminDoc[];
}

export const listings: Listing[] = [
  { id: 'LST-9482', name: 'Gulfstream G700', category: 'Long Range Jet', owner: 'Karim Al-Farsi', email: 'karim@alfarsi.com', phone: '+971 50 111 2233', company: 'Al-Farsi Holdings', ask: '$78M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Featured', flag: null, verified: true, featured: true, verifiedDate: '2026-04-15', submissionDate: '2026-04-10', docs: generateAdminDocs('LST-9482', true) },
  { id: 'LST-9483', name: 'Falcon 10X', category: 'Long Range Jet', owner: 'Ines Rocha', email: 'ines@rochaholdings.pt', phone: '+351 91 222 3344', company: 'Rocha Aviation', ask: '$75M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Featured', flag: 'green', verified: true, featured: true, verifiedDate: '2026-05-04', submissionDate: '2026-04-28', docs: generateAdminDocs('LST-9483', true) },
  { id: 'LST-9484', name: 'Global 7500', category: 'Long Range Jet', owner: 'Priya Chandran', email: 'priya@chandranmaritime.com', phone: '+65 8123 4567', company: 'Chandran Maritime', ask: '$62M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Standard', flag: null, verified: true, featured: false, verifiedDate: '2026-03-18', submissionDate: '2026-03-10', docs: generateAdminDocs('LST-9484', true) },
  { id: 'LST-9485', name: 'Lineage 1000E', category: 'VIP Airliner', owner: 'Diego Ferreira', email: 'diego@ferreirayachts.com', phone: '+55 21 98888 7766', company: 'Ferreira Jets', ask: '$55M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Featured', flag: 'yellow', verified: true, featured: true, verifiedDate: '2026-06-12', submissionDate: '2026-06-08', docs: generateAdminDocs('LST-9485', true) },
  { id: 'LST-9486', name: 'Citation X+', category: 'Heavy Jet', owner: 'Marcus Webb', email: 'marcus.webb@gmail.com', phone: '+1 305 333 4455', company: 'Webb Private Office', ask: '$24M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Standard', flag: 'red', verified: true, featured: false, verifiedDate: '2026-02-22', submissionDate: '2026-02-18', docs: generateAdminDocs('LST-9486', true) },
];

export interface Approval {
  id: string;
  name: string;
  category: string;
  owner: string;
  email: string;
  phone: string;
  company: string;
  ask: string;
  status: string;
  verificationStatus: string;
  featuredStatus: string;
  submitted: string;
  submissionDate: string;
  docs: AdminDoc[];
}

export const approvals: Approval[] = [
  { id: 'LST-9487', name: 'Falcon 8X', category: 'Long Range Jet', owner: 'Aiko Tanaka', email: 'aiko.tanaka@outlook.com', phone: '+81 90 4444 5566', company: 'Tanaka Enterprises', ask: '$58M', status: 'Pending Approval', verificationStatus: 'Pending', featuredStatus: 'Featured', submitted: '2 days ago', submissionDate: '2026-08-16', docs: generateAdminDocs('LST-9487', false) },
  { id: 'LST-9488', name: 'Challenger 650', category: 'Heavy Jet', owner: 'Tomasz Nowak', email: 'tomasz@nowakaviation.com', phone: '+48 601 222 111', company: 'Nowak Aviation', ask: '$14.5M', status: 'Pending Approval', verificationStatus: 'Pending', featuredStatus: 'Standard', submitted: '6 hours ago', submissionDate: '2026-08-18', docs: generateAdminDocs('LST-9488', false) },
];

export interface IncompleteListing {
  id: string;
  name: string;
  owner: string;
  stalled: string;
  contact: string;
}

export const incomplete: IncompleteListing[] = [
  { id: 'ic1', name: 'G280 — draft', owner: 'Elena Voss', stalled: '4 days ago', contact: 'elena@vosscapital.com' },
  { id: 'ic2', name: 'Sunseeker 161 — draft', owner: 'Marcus Webb', stalled: '1 day ago', contact: 'marcus.webb@gmail.com' },
];

export interface VerificationItem {
  id: string;
  name: string;
  owner: string;
  status: string;
  docs: number;
}

export const verifications: VerificationItem[] = [
  { id: 'v1', name: 'Global 7500', owner: 'Priya Chandran', status: 'In review', docs: 9 },
  { id: 'v2', name: 'Falcon 10X', owner: 'Ines Rocha', status: 'Verified', docs: 14 },
  { id: 'v3', name: 'PC-24', owner: 'Tomasz Nowak', status: 'In review', docs: 6 },
];

export interface FeaturingItem {
  id: string;
  name: string;
  owner: string;
  status: string;
  plan: string;
}

export const featuring: FeaturingItem[] = [
  { id: 'f1', name: 'G700', owner: 'Karim Al-Farsi', status: 'Featured', plan: 'Bundle — $1500/mo' },
  { id: 'f2', name: 'Lineage 1000E', owner: 'Diego Ferreira', status: 'Featured', plan: 'Basic — $300/mo' },
  { id: 'f3', name: 'Citation X+', owner: 'Marcus Webb', status: 'Requested', plan: 'Basic — $300/mo' },
];

export interface Deal {
  id: string;
  asset: string;
  buyer: string;
  seller: string;
  stage: number;
  meeting: { time: string; agent: string; notes: string };
  verification: { notes: string; reports: string[] };
  loi: { file: string };
  escrow: { receipt: string; status: string; amount: string; request: string };
  inspection: { reports: string; summary: string };
  decision: { status: string };
  transfer: { status: string };
}

export const deals: Deal[] = [
  {
    id: 'd1', asset: 'Gulfstream G700', buyer: 'Samuel Kgosi', seller: 'Karim Al-Farsi', stage: 2,
    meeting: { time: '', agent: '', notes: '' }, verification: { notes: '', reports: [] }, loi: { file: '' },
    escrow: { receipt: '', status: '', amount: '', request: '' }, inspection: { reports: '', summary: '' },
    decision: { status: 'Processing' }, transfer: { status: 'Not started' },
  },
  {
    id: 'd2', asset: 'Falcon 10X', buyer: 'Ines Rocha', seller: 'Ines Rocha (rep.)', stage: 5,
    meeting: { time: 'Confirmed', agent: 'M. Duarte', notes: 'Buyer flew in for walkaround' },
    verification: { notes: 'Clean logbooks', reports: ['verification-report.pdf'] }, loi: { file: 'loi-signed.pdf' },
    escrow: { receipt: 'escrow-receipt.pdf', status: 'Funded', amount: '$7,500,000 (deposit)', request: '' },
    inspection: { reports: '', summary: '' }, decision: { status: 'Processing' }, transfer: { status: 'Pending' },
  },
];

export interface Transaction {
  id: string;
  type: string;
  platform: string;
  desc: string;
  to: string;
  from: string;
  amount: string;
  date: string;
  color: string;
}

export const transactions: Transaction[] = [
  { id: 't1', type: 'Featuring Fee', platform: 'Stripe', desc: 'G700 featured bundle', to: 'M1 Marketplace', from: 'Karim Al-Farsi', amount: '$1,500.00', date: 'Aug 3, 2026', color: 'green' },
  { id: 't2', type: 'Escrow', platform: 'Wire', desc: 'Falcon 10X deposit', to: 'Escrow Agent', from: 'Ines Rocha', amount: '$7,500,000.00', date: 'Aug 6, 2026', color: 'silver' },
  { id: 't3', type: 'Refund', platform: 'Stripe', desc: 'Verification fee refund', to: 'Marcus Webb', from: 'M1 Marketplace', amount: '$250.00', date: 'Aug 7, 2026', color: 'pink' },
  { id: 't4', type: 'Platform Fee', platform: 'Stripe', desc: 'Monthly retainer — flagged for review', to: 'M1 Marketplace', from: 'Skyline Brokers', amount: '$1,500.00', date: 'Aug 9, 2026', color: 'red' },
];

export interface ComplaintActive {
  id: string;
  subject: string;
  reporter: string;
  email: string;
  opened: string;
  notes: string;
}

export const complaintsActive: ComplaintActive[] = [
  { id: 'c1', subject: 'Listing photos not loading', reporter: 'Marcus Webb', email: 'marcus.webb@gmail.com', opened: 'Today', notes: '' },
  { id: 'c2', subject: 'Buyer unresponsive after LOI', reporter: 'Priya Chandran', email: 'priya@chandranmaritime.com', opened: 'Yesterday', notes: '' },
];

export interface ComplaintSolved {
  id: string;
  subject: string;
  reporter: string;
  email: string;
  opened: string;
  notes: string;
}

export const complaintsSolved: ComplaintSolved[] = [
  { id: 'c3', subject: 'Payment not reflecting', reporter: 'Layla Haddad', email: 'layla@haddadoffice.com', opened: 'Aug 2', notes: 'Resolved — delayed webhook, reconciled manually.' },
];

export interface SupportLogItem {
  id: string;
  name: string;
  contact: string;
  date: string;
  help: string;
}

export const supportLog: SupportLogItem[] = [
  { id: 's1', name: 'Tomasz Nowak', contact: '+48 601 222 111', date: 'Aug 8, 2026', help: 'Walked through verification document upload flow.' },
];

export type AdminRole =
  | 'MASTER_ADMIN'
  | 'GENERAL_ADMIN'
  | 'CUSTOMER_CARE_ADMIN'
  | 'BD_ADMIN'
  | 'EXECUTIVE_ADMIN'
  | 'TECH_ADMIN'
  | 'FINANCE_ADMIN'
  | 'LISTING_ADMIN'
  | 'VERIFICATION_ADMIN';

export const ROLE_LABELS: Record<AdminRole, string> = {
  MASTER_ADMIN: 'Master Admin',
  GENERAL_ADMIN: 'General Admin',
  CUSTOMER_CARE_ADMIN: 'Customer Care Admin',
  BD_ADMIN: 'BD Admin',
  EXECUTIVE_ADMIN: 'Executive Admin',
  TECH_ADMIN: 'Tech Admin',
  FINANCE_ADMIN: 'Finance Admin',
  LISTING_ADMIN: 'Listing Admin',
  VERIFICATION_ADMIN: 'Verification Admin',
};

export const ROLE_SCOPE: Partial<Record<AdminRole, string>> = {
  MASTER_ADMIN: 'master',
  GENERAL_ADMIN: 'general',
  CUSTOMER_CARE_ADMIN: 'customer-care',
  BD_ADMIN: 'bd',
  EXECUTIVE_ADMIN: 'executive',
  TECH_ADMIN: 'tech',
};

export const ROLE_ROUTE_MAP: Partial<Record<AdminRole, string>> = {
  MASTER_ADMIN: '/admin/dashboard',
  GENERAL_ADMIN: '/admin/general',
  CUSTOMER_CARE_ADMIN: '/admin/customer-care',
  BD_ADMIN: '/admin/bd',
  EXECUTIVE_ADMIN: '/admin/executive',
  TECH_ADMIN: '/admin/tech',
};

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  MASTER_ADMIN: ['*'],
  GENERAL_ADMIN: ['general', 'problems.view', 'listings.view'],
  CUSTOMER_CARE_ADMIN: ['problems.view'],
  BD_ADMIN: ['databases.view', 'listings.view', 'verifications.view', 'featuring.view'],
  EXECUTIVE_ADMIN: ['databases.view', 'listings.view', 'verifications.view', 'featuring.view', 'acquisition.view'],
  TECH_ADMIN: ['databases.view', 'e_acquisition.view', 'data_fetching.view', 'listings.view', 'verifications.view', 'featuring.view', 'problems.view'],
  FINANCE_ADMIN: ['finance.view'],
  LISTING_ADMIN: ['listings.view'],
  VERIFICATION_ADMIN: ['verifications.view'],
};

export interface DashboardCard {
  label: string;
  metric: () => number | string;
  desc: string;
}

export interface RoleDashboardDef {
  title: string;
  subtitle: string;
  cards: DashboardCard[];
}

export const ROLE_DASHBOARDS: Partial<Record<AdminRole, RoleDashboardDef>> = {
  GENERAL_ADMIN: {
    title: 'General Administration', subtitle: 'Cross-functional platform operations and daily oversight.', cards: [
      { label: 'Open Complaints', metric: () => complaintsActive.length, desc: 'Active support cases requiring attention.' },
      { label: 'Active Listings', metric: () => listings.filter((l) => l.status === 'Active').length, desc: 'Live marketplace listings under management.' },
      { label: 'Pending Approvals', metric: () => approvals.length, desc: 'Listings awaiting review and publication.' },
      { label: 'Platform Users', metric: () => users.length, desc: 'Registered buyer and seller accounts.' }],
  },
  CUSTOMER_CARE_ADMIN: {
    title: 'Customer Care Operations', subtitle: 'Support queue, complaint resolution, and user assistance.', cards: [
      { label: 'Open Complaints', metric: () => complaintsActive.length, desc: 'Cases currently in the support queue.' },
      { label: 'Resolved Cases', metric: () => complaintsSolved.length, desc: 'Recently closed support tickets.' },
      { label: 'Support Contacts', metric: () => supportLog.length, desc: 'Logged support interactions this period.' },
      { label: 'Avg Response', metric: () => '2.4h', desc: 'Average first-response time across channels.' }],
  },
  BD_ADMIN: {
    title: 'Business Development', subtitle: 'Listings pipeline, featuring requests, and verification growth.', cards: [
      { label: 'Active Listings', metric: () => listings.filter((l) => l.status === 'Active').length, desc: 'Live assets in the BD portfolio.' },
      { label: 'Featuring Requests', metric: () => featuring.filter((f) => f.status === 'Requested').length, desc: 'Pending featuring upgrade requests.' },
      { label: 'Verifications', metric: () => verifications.filter((v) => v.status === 'In review').length, desc: 'Assets awaiting verification review.' },
      { label: 'Featured Assets', metric: () => featuring.filter((f) => f.status === 'Featured').length, desc: 'Currently promoted marketplace listings.' }],
  },
  EXECUTIVE_ADMIN: {
    title: 'Executive Operations', subtitle: 'Strategic overview of deals, acquisition flow, and platform health.', cards: [
      { label: 'Active Deals', metric: () => deals.length, desc: 'Deals currently progressing through pipeline stages.' },
      { label: 'Escrow Funded', metric: () => deals.filter((d) => d.escrow.status === 'Funded').length, desc: 'Deals with confirmed escrow funding.' },
      { label: 'Open Complaints', metric: () => complaintsActive.length, desc: 'Issues requiring executive visibility.' },
      { label: 'Active Listings', metric: () => listings.filter((l) => l.status === 'Active').length, desc: 'Total live marketplace inventory.' }],
  },
  TECH_ADMIN: {
    title: 'Technical Operations', subtitle: 'Platform integrity, data pipelines, and system monitoring.', cards: [
      { label: 'Data Fetch Jobs', metric: () => m1wall.length, desc: 'Active partner data-fetch integrations.' },
      { label: 'Beta Modules', metric: () => 1, desc: 'Experimental modules under technical oversight.' },
      { label: 'Open Issues', metric: () => complaintsActive.length, desc: 'Technical issues reported by users.' },
      { label: 'Asset Records', metric: () => assetsDb.length, desc: 'Aircraft and yacht models in the database.' }],
  },
};

export interface AdminRecord {
  id: string;
  name: string;
  role: AdminRole;
  email: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export const admins: AdminRecord[] = [
  { id: 'ad1', name: 'Farah Idris', role: 'MASTER_ADMIN', email: 'farah@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 12, 2026 09:18', createdAt: 'Nov 01, 2024', permissions: ['*'] },
  { id: 'ad2', name: 'Ben Okafor', role: 'EXECUTIVE_ADMIN', email: 'ben@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 11, 2026 16:05', createdAt: 'Jan 22, 2025', permissions: ['executive'] },
  { id: 'ad3', name: 'Grace Lin', role: 'BD_ADMIN', email: 'grace@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 10, 2026 14:32', createdAt: 'Feb 12, 2025', permissions: ['bd'] },
  { id: 'ad4', name: 'Omar Siddiqui', role: 'TECH_ADMIN', email: 'omar@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 09, 2026 08:20', createdAt: 'Mar 05, 2025', permissions: ['tech'] },
  { id: 'ad5', name: 'Sarah Chen', role: 'GENERAL_ADMIN', email: 'sarah@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 12, 2026 08:45', createdAt: 'Apr 18, 2025', permissions: ['general'] },
  { id: 'ad6', name: 'James Porter', role: 'CUSTOMER_CARE_ADMIN', email: 'james@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 12, 2026 07:30', createdAt: 'May 02, 2025', permissions: ['customer-care'] },
];

export interface NotificationItem {
  text: string;
  time: string;
}

export const notifications: NotificationItem[] = [
  { text: 'New listing submitted: Challenger 650 by Tomasz Nowak', time: '4m ago' },
  { text: 'Escrow funded for Falcon 10X deal (Ines Rocha)', time: '22m ago' },
  { text: "Anti-fraud flag: repeated login attempts on Marcus Webb's account", time: '1h ago' },
  { text: 'Verification approved: Falcon 10X', time: '3h ago' },
  { text: 'New complaint opened: "Listing photos not loading"', time: '5h ago' },
  { text: 'Double-listing detected: Citation X+ re-submitted by a second account', time: 'Yesterday' },
];