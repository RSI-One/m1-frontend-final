/* ============================================================
   DATA — mock records for every module
   Converted to TypeScript
============================================================ */

const CURRENT_YEAR = new Date().getFullYear();

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function esc(str: unknown): string {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
}

function pfp(seed: number, gender: 'men' | 'women'): string {
  return `https://randomuser.me/api/portraits/${gender}/${seed}.jpg`;
}

/* ============================================================
   TYPES
============================================================ */

type PermissionId =
  | 'databases.view' | 'e_acquisition.view' | 'data_fetching.view' | 'listings.view'
  | 'verifications.view' | 'featuring.view' | 'acquisition.view' | 'finance.view'
  | 'problems.view' | 'admins.view' | 'audit_logs.view' | '*' | 'general' | 'bd' | 'executive' | 'tech' | 'customer-care' | 'master';

interface ModuleDef {
  id: string;
  label: string;
  desc: string;
  requiredPermission: PermissionId;
  badge?: string;
}

interface UserRecord {
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

interface PartnerMember {
  name: string;
  number: string;
  email: string;
}

interface PartnerRecord {
  id: string;
  company: string;
  location: string;
  founder: string;
  email: string;
  website: string;
  phone: string;
  members: PartnerMember[];
}

interface AssetRecord {
  id: string;
  manufacturer: string;
  model: string;
  type: string;
  passengers: number;
  image: string;
}

interface InventoryRecord {
  id: string;
  owner: string;
  asset: string;
  status: string;
  since: string;
}

interface OffMarketRecord {
  id: string;
  name: string;
  owner: string;
  ask: string;
  status: string;
}

interface LeadRecord {
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

interface WallUsage {
  id: string;
  partner: string;
  hours: number;
}

type DocStatus = 'Verified' | 'Pending';

interface ListingDoc {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  status: DocStatus;
  verificationStatus: DocStatus;
  issuingAuthority: string;
}

interface ListingRecord {
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
  docs: ListingDoc[];
}

interface ApprovalRecord {
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
  docs: ListingDoc[];
}

interface IncompleteRecord {
  id: string;
  name: string;
  owner: string;
  stalled: string;
  contact: string;
}

interface VerificationRecord {
  id: string;
  name: string;
  owner: string;
  status: string;
  docs: number;
}

interface FeaturingRecord {
  id: string;
  name: string;
  owner: string;
  status: string;
  plan: string;
}

interface DealMeeting { time: string; agent: string; notes: string; }
interface DealVerification { notes: string; reports: string[]; }
interface DealLoi { file: string; }
interface DealEscrow { receipt: string; status: string; amount: string; request: string; }
interface DealInspection { reports: string; summary: string; }
interface DealDecision { status: string; }
interface DealTransfer { status: string; }

interface DealRecord {
  id: string;
  asset: string;
  buyer: string;
  seller: string;
  stage: number;
  meeting: DealMeeting;
  verification: DealVerification;
  loi: DealLoi;
  escrow: DealEscrow;
  inspection: DealInspection;
  decision: DealDecision;
  transfer: DealTransfer;
}

interface TransactionRecord {
  id: string;
  type: string;
  platform: string;
  desc: string;
  to: string;
  from: string;
  amount: string;
  date: string;
  color: 'green' | 'silver' | 'pink' | 'red' | string;
}

interface ComplaintRecord {
  id: string;
  subject: string;
  reporter: string;
  email: string;
  opened: string;
  notes: string;
}

interface SupportLogRecord {
  id: string;
  name: string;
  contact: string;
  date: string;
  help: string;
}

type AdminRole =
  | 'MASTER_ADMIN' | 'GENERAL_ADMIN' | 'CUSTOMER_CARE_ADMIN' | 'BD_ADMIN'
  | 'EXECUTIVE_ADMIN' | 'TECH_ADMIN' | 'FINANCE_ADMIN' | 'LISTING_ADMIN' | 'VERIFICATION_ADMIN';

type AdminStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

interface AdminRecord {
  id: string;
  name: string;
  role: AdminRole;
  email: string;
  status: AdminStatus;
  lastLogin: string;
  createdAt: string;
  permissions: PermissionId[];
}

interface NotificationRecord {
  text: string;
  time: string;
}

interface RoleDashboardCard {
  label: string;
  metric: () => number | string;
  desc: string;
}

interface RoleDashboardConfig {
  title: string;
  subtitle: string;
  cards: RoleDashboardCard[];
}

interface CurrentAdmin extends AdminRecord {
  isMaster: boolean;
  homeRoute: string;
  scope: string;
}

interface TableColumn<T> {
  key: string;
  label: string;
  muted?: boolean;
  render?: (row: T) => string;
}

interface RouteConfig {
  roles: AdminRole[];
  view: 'master' | 'role' | 'admin-management';
  roleKey?: AdminRole;
}

interface RouteGuardResult {
  allowed: boolean;
  reason?: string;
  redirect?: string;
  view?: RouteConfig['view'];
  roleKey?: AdminRole;
  route?: string;
}

interface AuthResult {
  ok: boolean;
  admin?: CurrentAdmin;
  reason?: string;
}

interface MasterPreview {
  role: AdminRole;
  name: string;
  id?: string | null;
}

interface AppState {
  currentModule: string | null;
  tabs: Record<string, any>;
  search: Record<string, string>;
  notifIndex: number;
  graphPeriod: 'weekly' | 'monthly' | 'yearly';
  compareSelectedFlag: Record<string, boolean>;
  masterPreview: MasterPreview | null;
}

/* ============================================================
   DATA
============================================================ */

const moduleDefs: ModuleDef[] = [
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
  { id: 'audit_logs', label: 'Audit Logs', desc: 'Admin activity and security events', requiredPermission: 'audit_logs.view' }
];

const users: UserRecord[] = [
  { id: 'u1', name: 'Karim Al-Farsi', company: 'Al-Farsi Holdings', email: 'karim@alfarsi.com', phone: '+971 50 111 2233', pfp: pfp(11, 'men'), listings: 6, active: 4, featured: 2, verified: 3, acqRequests: 2 },
  { id: 'u2', name: 'Elena Voss', company: 'Voss Capital', email: 'elena@vosscapital.com', phone: '+41 79 222 3344', pfp: pfp(65, 'women'), listings: 3, active: 2, featured: 1, verified: 2, acqRequests: 1 },
  { id: 'u3', name: 'Marcus Webb', company: '—', email: 'marcus.webb@gmail.com', phone: '+1 305 333 4455', pfp: pfp(22, 'men'), listings: 1, active: 1, featured: 0, verified: 0, acqRequests: 0 },
  { id: 'u4', name: 'Priya Chandran', company: 'Chandran Maritime', email: 'priya@chandranmaritime.com', phone: '+65 8123 4567', pfp: pfp(48, 'women'), listings: 5, active: 3, featured: 2, verified: 4, acqRequests: 3 },
  { id: 'u5', name: 'Tomasz Nowak', company: 'Nowak Aviation Group', email: 'tomasz@nowakaviation.com', phone: '+48 601 222 111', pfp: pfp(35, 'men'), listings: 2, active: 2, featured: 0, verified: 1, acqRequests: 0 },
  { id: 'u6', name: 'Aiko Tanaka', company: '—', email: 'aiko.tanaka@outlook.com', phone: '+81 90 4444 5566', pfp: pfp(77, 'women'), listings: 0, active: 0, featured: 0, verified: 0, acqRequests: 1 },
  { id: 'u7', name: 'Diego Ferreira', company: 'Ferreira Yachts', email: 'diego@ferreirayachts.com', phone: '+55 21 98888 7766', pfp: pfp(15, 'men'), listings: 4, active: 4, featured: 1, verified: 2, acqRequests: 1 },
  { id: 'u8', name: 'Layla Haddad', company: 'Haddad Private Office', email: 'layla@haddadoffice.com', phone: '+961 3 555 222', pfp: pfp(9, 'women'), listings: 2, active: 1, featured: 1, verified: 1, acqRequests: 2 }
];

const partners: PartnerRecord[] = [
  { id: 'p1', company: 'Skyline Brokers', location: 'Geneva, CH', founder: 'Jonas Reiter', email: 'jonas@skylinebrokers.ch', website: 'skylinebrokers.ch', phone: '+41 22 333 4455', members: [{ name: 'Nina Frei', number: '+41 22 333 4456', email: 'nina@skylinebrokers.ch' }] },
  { id: 'p2', company: 'Azure Maritime Group', location: 'Monaco', founder: 'Camille Duval', email: 'camille@azuremaritime.mc', website: 'azuremaritime.mc', phone: '+377 93 111 222', members: [{ name: 'Hugo Farel', number: '+377 93 111 223', email: 'hugo@azuremaritime.mc' }] },
  { id: 'p3', company: 'Falcon Trade Partners', location: 'Dubai, UAE', founder: 'Rashid Al-Mansoori', email: 'rashid@falcontrade.ae', website: 'falcontrade.ae', phone: '+971 4 222 3344', members: [] }
];

function jetImg(i: number): string {
  const seeds = ['photo-1540962351504-03099e0a754b', 'photo-1474302770737-173ee21bab63', 'photo-1635672033263-a19f27eaefa8', 'photo-1619659085985-f51a00f0160a'];
  return `https://images.unsplash.com/${seeds[i % 4]}?w=600&h=400&fit=crop&auto=format`;
}

const assetsDb: AssetRecord[] = [
  { id: 'a1', manufacturer: 'Gulfstream', model: 'G700', type: 'Long Range Jet', passengers: 19, image: jetImg(0) },
  { id: 'a2', manufacturer: 'Dassault', model: 'Falcon 10X', type: 'Long Range Jet', passengers: 16, image: jetImg(1) },
  { id: 'a3', manufacturer: 'Bombardier', model: 'Global 7500', type: 'Long Range Jet', passengers: 19, image: jetImg(2) },
  { id: 'a4', manufacturer: 'Embraer', model: 'Phenom 300E', type: 'Light Jet', passengers: 9, image: jetImg(3) },
  { id: 'a5', manufacturer: 'Cessna', model: 'Citation X+', type: 'Heavy Jet', passengers: 12, image: jetImg(0) },
  { id: 'a6', manufacturer: 'Pilatus', model: 'PC-24', type: 'Light Jet', passengers: 10, image: jetImg(1) }
];

const inventory: InventoryRecord[] = [
  { id: 'i1', owner: 'Karim Al-Farsi', asset: 'Gulfstream G700', status: 'In fleet', since: '2023' },
  { id: 'i2', owner: 'Priya Chandran', asset: 'Feadship Sabrewing', since: '2022', status: 'In fleet' },
  { id: 'i3', owner: 'Diego Ferreira', asset: 'Benetti B.Now 50M', since: '2021', status: 'Pending transfer' }
];

const offMarket: OffMarketRecord[] = [
  { id: 'om1', name: 'Falcon 8X — Private Reserve', owner: 'Layla Haddad', ask: '$56M', status: 'Off-market' },
  { id: 'om2', name: 'Royal Huisman 60m Sloop', owner: 'Elena Voss', ask: '$41M', status: 'Off-market' }
];

const leads: LeadRecord[] = [
  { id: 'l1', name: 'Samuel Kgosi', model: 'Gulfstream G700', pax: 14, phone: '+27 82 111 2233', email: 'samuel@kgosigroup.co.za', location: 'Johannesburg, ZA', bizEmail: 's.kgosi@kgosigroup.co.za', suggestions: ['Falcon 10X', 'Global 7500'], answers: ['Long range international travel', '12-16 seats', 'Within 6 months', '$60-80M', 'Owned, not chartered', 'Yes, trade-in a G650', 'New or pre-owned, either'] },
  { id: 'l2', name: 'Ines Rocha', model: 'Falcon 10X', pax: 10, phone: '+351 91 222 3344', email: 'ines@rochaholdings.pt', location: 'Lisbon, PT', bizEmail: 'i.rocha@rochaholdings.pt', suggestions: ['G700', 'Global 7500'], answers: ['Family + staff travel', '8-12 seats', '3-6 months', '$50-75M', 'Leasing considered', 'No trade-in', 'Pre-owned preferred'] },
  { id: 'l3', name: 'Wei Zhang', model: 'Phenom 300E', pax: 6, phone: '+86 138 1234 5678', email: 'wei.zhang@zhangventures.cn', location: 'Shanghai, CN', bizEmail: 'w.zhang@zhangventures.cn', suggestions: ['PC-24', 'Citation X+'], answers: ['Regional business trips', '4-8 seats', 'ASAP', '$8-12M', 'Owned', 'No trade-in', 'New only'] }
];

const m1wall: WallUsage[] = [
  { id: 'w1', partner: 'Skyline Brokers', hours: 142 },
  { id: 'w2', partner: 'Azure Maritime Group', hours: 88 },
  { id: 'w3', partner: 'Falcon Trade Partners', hours: 203 }
];

function generateAdminDocs(listingId: string, isVerified: boolean): ListingDoc[] {
  const templates: Array<{ name: string; category: string; type: string; size: string }> = [
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
    { name: "Deferred Maintenance & MEL Item Log", category: "Maintenance & Airworthiness", type: "pdf", size: "0.9 MB" }
  ];
  return templates.map((t, idx) => ({
    id: `DOC-${listingId}-${101 + idx}`,
    name: t.name,
    category: t.category,
    uploadDate: `2026-07-${10 + (idx % 18)}`,
    fileType: t.type,
    fileSize: t.size,
    status: (isVerified ? "Verified" : (idx % 3 === 0 ? "Pending" : "Verified")) as DocStatus,
    verificationStatus: (isVerified ? "Verified" : (idx % 3 === 0 ? "Pending" : "Verified")) as DocStatus,
    issuingAuthority: "Civil Aviation Authority / FAA"
  }));
}

const listings: ListingRecord[] = [
  { id: 'LST-9482', name: 'Gulfstream G700', category: 'Long Range Jet', owner: 'Karim Al-Farsi', email: 'karim@alfarsi.com', phone: '+971 50 111 2233', company: 'Al-Farsi Holdings', ask: '$78M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Featured', flag: null, verified: true, featured: true, verifiedDate: '2026-04-15', submissionDate: '2026-04-10', docs: generateAdminDocs('LST-9482', true) },
  { id: 'LST-9483', name: 'Falcon 10X', category: 'Long Range Jet', owner: 'Ines Rocha', email: 'ines@rochaholdings.pt', phone: '+351 91 222 3344', company: 'Rocha Aviation', ask: '$75M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Featured', flag: 'green', verified: true, featured: true, verifiedDate: '2026-05-04', submissionDate: '2026-04-28', docs: generateAdminDocs('LST-9483', true) },
  { id: 'LST-9484', name: 'Global 7500', category: 'Long Range Jet', owner: 'Priya Chandran', email: 'priya@chandranmaritime.com', phone: '+65 8123 4567', company: 'Chandran Maritime', ask: '$62M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Standard', flag: null, verified: true, featured: false, verifiedDate: '2026-03-18', submissionDate: '2026-03-10', docs: generateAdminDocs('LST-9484', true) },
  { id: 'LST-9485', name: 'Lineage 1000E', category: 'VIP Airliner', owner: 'Diego Ferreira', email: 'diego@ferreirayachts.com', phone: '+55 21 98888 7766', company: 'Ferreira Jets', ask: '$55M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Featured', flag: 'yellow', verified: true, featured: true, verifiedDate: '2026-06-12', submissionDate: '2026-06-08', docs: generateAdminDocs('LST-9485', true) },
  { id: 'LST-9486', name: 'Citation X+', category: 'Heavy Jet', owner: 'Marcus Webb', email: 'marcus.webb@gmail.com', phone: '+1 305 333 4455', company: 'Webb Private Office', ask: '$24M', status: 'Active', verificationStatus: 'Verified', featuredStatus: 'Standard', flag: 'red', verified: true, featured: false, verifiedDate: '2026-02-22', submissionDate: '2026-02-18', docs: generateAdminDocs('LST-9486', true) }
];

const approvals: ApprovalRecord[] = [
  { id: 'LST-9487', name: 'Falcon 8X', category: 'Long Range Jet', owner: 'Aiko Tanaka', email: 'aiko.tanaka@outlook.com', phone: '+81 90 4444 5566', company: 'Tanaka Enterprises', ask: '$58M', status: 'Pending Approval', verificationStatus: 'Pending', featuredStatus: 'Featured', submitted: '2 days ago', submissionDate: '2026-08-16', docs: generateAdminDocs('LST-9487', false) },
  { id: 'LST-9488', name: 'Challenger 650', category: 'Heavy Jet', owner: 'Tomasz Nowak', email: 'tomasz@nowakaviation.com', phone: '+48 601 222 111', company: 'Nowak Aviation', ask: '$14.5M', status: 'Pending Approval', verificationStatus: 'Pending', featuredStatus: 'Standard', submitted: '6 hours ago', submissionDate: '2026-08-18', docs: generateAdminDocs('LST-9488', false) }
];

const incomplete: IncompleteRecord[] = [
  { id: 'ic1', name: 'G280 — draft', owner: 'Elena Voss', stalled: '4 days ago', contact: 'elena@vosscapital.com' },
  { id: 'ic2', name: 'Sunseeker 161 — draft', owner: 'Marcus Webb', stalled: '1 day ago', contact: 'marcus.webb@gmail.com' }
];

const verifications: VerificationRecord[] = [
  { id: 'v1', name: 'Global 7500', owner: 'Priya Chandran', status: 'In review', docs: 9 },
  { id: 'v2', name: 'Falcon 10X', owner: 'Ines Rocha', status: 'Verified', docs: 14 },
  { id: 'v3', name: 'PC-24', owner: 'Tomasz Nowak', status: 'In review', docs: 6 }
];

const featuring: FeaturingRecord[] = [
  { id: 'f1', name: 'G700', owner: 'Karim Al-Farsi', status: 'Featured', plan: 'Bundle — $1500/mo' },
  { id: 'f2', name: 'Lineage 1000E', owner: 'Diego Ferreira', status: 'Featured', plan: 'Basic — $300/mo' },
  { id: 'f3', name: 'Citation X+', owner: 'Marcus Webb', status: 'Requested', plan: 'Basic — $300/mo' }
];

const deals: DealRecord[] = [
  {
    id: 'd1', asset: 'Gulfstream G700', buyer: 'Samuel Kgosi', seller: 'Karim Al-Farsi', stage: 2,
    meeting: { time: '', agent: '', notes: '' }, verification: { notes: '', reports: [] }, loi: { file: '' },
    escrow: { receipt: '', status: '', amount: '', request: '' }, inspection: { reports: '', summary: '' },
    decision: { status: 'Processing' }, transfer: { status: 'Not started' }
  },
  {
    id: 'd2', asset: 'Falcon 10X', buyer: 'Ines Rocha', seller: 'Ines Rocha (rep.)', stage: 5,
    meeting: { time: 'Confirmed', agent: 'M. Duarte', notes: 'Buyer flew in for walkaround' },
    verification: { notes: 'Clean logbooks', reports: ['verification-report.pdf'] }, loi: { file: 'loi-signed.pdf' },
    escrow: { receipt: 'escrow-receipt.pdf', status: 'Funded', amount: '$7,500,000 (deposit)', request: '' },
    inspection: { reports: '', summary: '' }, decision: { status: 'Processing' }, transfer: { status: 'Pending' }
  }
];

const transactions: TransactionRecord[] = [
  { id: 't1', type: 'Featuring Fee', platform: 'Stripe', desc: 'G700 featured bundle', to: 'M1 Marketplace', from: 'Karim Al-Farsi', amount: '$1,500.00', date: 'Aug 3, 2026', color: 'green' },
  { id: 't2', type: 'Escrow', platform: 'Wire', desc: 'Falcon 10X deposit', to: 'Escrow Agent', from: 'Ines Rocha', amount: '$7,500,000.00', date: 'Aug 6, 2026', color: 'silver' },
  { id: 't3', type: 'Refund', platform: 'Stripe', desc: 'Verification fee refund', to: 'Marcus Webb', from: 'M1 Marketplace', amount: '$250.00', date: 'Aug 7, 2026', color: 'pink' },
  { id: 't4', type: 'Platform Fee', platform: 'Stripe', desc: 'Monthly retainer — flagged for review', to: 'M1 Marketplace', from: 'Skyline Brokers', amount: '$1,500.00', date: 'Aug 9, 2026', color: 'red' }
];

const complaintsActive: ComplaintRecord[] = [
  { id: 'c1', subject: 'Listing photos not loading', reporter: 'Marcus Webb', email: 'marcus.webb@gmail.com', opened: 'Today', notes: '' },
  { id: 'c2', subject: 'Buyer unresponsive after LOI', reporter: 'Priya Chandran', email: 'priya@chandranmaritime.com', opened: 'Yesterday', notes: '' }
];

const complaintsSolved: ComplaintRecord[] = [
  { id: 'c3', subject: 'Payment not reflecting', reporter: 'Layla Haddad', email: 'layla@haddadoffice.com', opened: 'Aug 2', notes: 'Resolved — delayed webhook, reconciled manually.' }
];

const supportLog: SupportLogRecord[] = [
  { id: 's1', name: 'Tomasz Nowak', contact: '+48 601 222 111', date: 'Aug 8, 2026', help: 'Walked through verification document upload flow.' }
];

const ROLE_LABELS: Record<AdminRole, string> = {
  MASTER_ADMIN: 'Master Admin', GENERAL_ADMIN: 'General Admin', CUSTOMER_CARE_ADMIN: 'Customer Care Admin',
  BD_ADMIN: 'BD Admin', EXECUTIVE_ADMIN: 'Executive Admin', TECH_ADMIN: 'Tech Admin',
  FINANCE_ADMIN: 'Finance Admin', LISTING_ADMIN: 'Listing Admin', VERIFICATION_ADMIN: 'Verification Admin'
};

const ROLE_SCOPE: Partial<Record<AdminRole, string>> = {
  MASTER_ADMIN: 'master', GENERAL_ADMIN: 'general', CUSTOMER_CARE_ADMIN: 'customer-care',
  BD_ADMIN: 'bd', EXECUTIVE_ADMIN: 'executive', TECH_ADMIN: 'tech'
};

const ROLE_ROUTE_MAP: Partial<Record<AdminRole, string>> = {
  MASTER_ADMIN: '/admin/dashboard', GENERAL_ADMIN: '/admin/general', CUSTOMER_CARE_ADMIN: '/admin/customer-care',
  BD_ADMIN: '/admin/bd', EXECUTIVE_ADMIN: '/admin/executive', TECH_ADMIN: '/admin/tech'
};

const ROLE_PERMISSIONS: Record<AdminRole, PermissionId[]> = {
  MASTER_ADMIN: ['*'],
  GENERAL_ADMIN: ['general', 'problems.view', 'listings.view'],
  CUSTOMER_CARE_ADMIN: ['problems.view'],
  BD_ADMIN: ['databases.view', 'listings.view', 'verifications.view', 'featuring.view'],
  EXECUTIVE_ADMIN: ['databases.view', 'listings.view', 'verifications.view', 'featuring.view', 'acquisition.view'],
  TECH_ADMIN: ['databases.view', 'e_acquisition.view', 'data_fetching.view', 'listings.view', 'verifications.view', 'featuring.view', 'problems.view'],
  FINANCE_ADMIN: ['finance.view'],
  LISTING_ADMIN: ['listings.view'],
  VERIFICATION_ADMIN: ['verifications.view']
};

const ROLE_DASHBOARDS: Partial<Record<AdminRole, RoleDashboardConfig>> = {
  GENERAL_ADMIN: {
    title: 'General Administration', subtitle: 'Cross-functional platform operations and daily oversight.', cards: [
      { label: 'Open Complaints', metric: () => complaintsActive.length, desc: 'Active support cases requiring attention.' },
      { label: 'Active Listings', metric: () => listings.filter((l) => l.status === 'Active').length, desc: 'Live marketplace listings under management.' },
      { label: 'Pending Approvals', metric: () => approvals.length, desc: 'Listings awaiting review and publication.' },
      { label: 'Platform Users', metric: () => users.length, desc: 'Registered buyer and seller accounts.' }]
  },
  CUSTOMER_CARE_ADMIN: {
    title: 'Customer Care Operations', subtitle: 'Support queue, complaint resolution, and user assistance.', cards: [
      { label: 'Open Complaints', metric: () => complaintsActive.length, desc: 'Cases currently in the support queue.' },
      { label: 'Resolved Cases', metric: () => complaintsSolved.length, desc: 'Recently closed support tickets.' },
      { label: 'Support Contacts', metric: () => supportLog.length, desc: 'Logged support interactions this period.' },
      { label: 'Avg Response', metric: () => '2.4h', desc: 'Average first-response time across channels.' }]
  },
  BD_ADMIN: {
    title: 'Business Development', subtitle: 'Listings pipeline, featuring requests, and verification growth.', cards: [
      { label: 'Active Listings', metric: () => listings.filter((l) => l.status === 'Active').length, desc: 'Live assets in the BD portfolio.' },
      { label: 'Featuring Requests', metric: () => featuring.filter((f) => f.status === 'Requested').length, desc: 'Pending featuring upgrade requests.' },
      { label: 'Verifications', metric: () => verifications.filter((v) => v.status === 'In review').length, desc: 'Assets awaiting verification review.' },
      { label: 'Featured Assets', metric: () => featuring.filter((f) => f.status === 'Featured').length, desc: 'Currently promoted marketplace listings.' }]
  },
  EXECUTIVE_ADMIN: {
    title: 'Executive Operations', subtitle: 'Strategic overview of deals, acquisition flow, and platform health.', cards: [
      { label: 'Active Deals', metric: () => deals.length, desc: 'Deals currently progressing through pipeline stages.' },
      { label: 'Escrow Funded', metric: () => deals.filter((d) => d.escrow.status === 'Funded').length, desc: 'Deals with confirmed escrow funding.' },
      { label: 'Open Complaints', metric: () => complaintsActive.length, desc: 'Issues requiring executive visibility.' },
      { label: 'Active Listings', metric: () => listings.filter((l) => l.status === 'Active').length, desc: 'Total live marketplace inventory.' }]
  },
  TECH_ADMIN: {
    title: 'Technical Operations', subtitle: 'Platform integrity, data pipelines, and system monitoring.', cards: [
      { label: 'Data Fetch Jobs', metric: () => m1wall.length, desc: 'Active partner data-fetch integrations.' },
      { label: 'Beta Modules', metric: () => 1, desc: 'Experimental modules under technical oversight.' },
      { label: 'Open Issues', metric: () => complaintsActive.length, desc: 'Technical issues reported by users.' },
      { label: 'Asset Records', metric: () => assetsDb.length, desc: 'Aircraft and yacht models in the database.' }]
  }
};

const admins: AdminRecord[] = [
  { id: 'ad1', name: 'Farah Idris', role: 'MASTER_ADMIN', email: 'farah@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 12, 2026 09:18', createdAt: 'Nov 01, 2024', permissions: ['*'] },
  { id: 'ad2', name: 'Ben Okafor', role: 'EXECUTIVE_ADMIN', email: 'ben@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 11, 2026 16:05', createdAt: 'Jan 22, 2025', permissions: ['executive' as PermissionId] },
  { id: 'ad3', name: 'Grace Lin', role: 'BD_ADMIN', email: 'grace@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 10, 2026 14:32', createdAt: 'Feb 12, 2025', permissions: ['bd'] },
  { id: 'ad4', name: 'Omar Siddiqui', role: 'TECH_ADMIN', email: 'omar@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 09, 2026 08:20', createdAt: 'Mar 05, 2025', permissions: ['tech'] },
  { id: 'ad5', name: 'Sarah Chen', role: 'GENERAL_ADMIN', email: 'sarah@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 12, 2026 08:45', createdAt: 'Apr 18, 2025', permissions: ['general'] },
  { id: 'ad6', name: 'James Porter', role: 'CUSTOMER_CARE_ADMIN', email: 'james@m1marketplace.com', status: 'ACTIVE', lastLogin: 'Aug 12, 2026 07:30', createdAt: 'May 02, 2025', permissions: ['customer-care'] }
];

const notifications: NotificationRecord[] = [
  { text: 'New listing submitted: Challenger 650 by Tomasz Nowak', time: '4m ago' },
  { text: 'Escrow funded for Falcon 10X deal (Ines Rocha)', time: '22m ago' },
  { text: 'Anti-fraud flag: repeated login attempts on Marcus Webb\'s account', time: '1h ago' },
  { text: 'Verification approved: Falcon 10X', time: '3h ago' },
  { text: 'New complaint opened: "Listing photos not loading"', time: '5h ago' },
  { text: 'Double-listing detected: Citation X+ re-submitted by a second account', time: 'Yesterday' }
];

/* ============================================================
   STATE
============================================================ */
let currentAdmin: CurrentAdmin | null = null;

interface VerificationSession {
  masterVerified: boolean;
  newAdminVerified: boolean;
  adminData: any;
  createdAt: number;
  masterCodeHash?: string;
  newAdminCodeHash?: string;
  pendingEmail?: string;
}

interface NewAdminInput {
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  permissions?: PermissionId[];
}

const adminVerificationService = (() => {
  const _sessions = new Map<string, VerificationSession>();
  const _delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  function _generateCode(): string { return String(Math.floor(100000 + Math.random() * 900000)); }
  function maskEmail(email: string): string {
    const parts = String(email || '').split('@');
    if (parts.length < 2) return '•••••';
    const local = parts[0], domain = parts[1];
    const dots = '•'.repeat(Math.max(local.length - 1, 4));
    return (local[0] || '•') + dots + '@' + domain;
  }
  function _getMasterAdmin(): AdminRecord | undefined { return admins.find((a) => a.role === 'MASTER_ADMIN' && a.status === 'ACTIVE'); }
  function _createSession(): string {
    const token = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    _sessions.set(token, { masterVerified: false, newAdminVerified: false, adminData: null, createdAt: Date.now() });
    return token;
  }
  function _purgeExpired(): void {
    const maxAge = 30 * 60 * 1000;
    _sessions.forEach((s, k) => { if (Date.now() - s.createdAt > maxAge) _sessions.delete(k); });
  }
  return {
    maskEmail,
    async sendMasterAdminCode() {
      _purgeExpired();
      const master = _getMasterAdmin();
      if (!master) return { success: false, error: 'No active Master Admin found.' };
      const sessionToken = _createSession();
      const session = _sessions.get(sessionToken)!;
      session.masterCodeHash = String(_generateCode());
      console.log('[AdminVerificationService] Master Admin verification code dispatched to', master.email);
      await _delay(500);
      return { success: true, sessionToken, maskedEmail: maskEmail(master.email) };
    },
    async verifyMasterAdminCode(sessionToken: string, code: string) {
      _purgeExpired();
      const session = _sessions.get(sessionToken);
      if (!session) return { verified: false, error: 'Session expired. Please restart.' };
      await _delay(350);
      if (String(code) !== session.masterCodeHash) return { verified: false, error: 'Invalid verification code.' };
      session.masterVerified = true;
      delete session.masterCodeHash;
      return { verified: true };
    },
    async sendNewAdminCode(sessionToken: string, email: string) {
      _purgeExpired();
      const session = _sessions.get(sessionToken);
      if (!session || !session.masterVerified) return { success: false, error: 'Master Admin verification required.' };
      session.newAdminCodeHash = String(_generateCode());
      session.pendingEmail = email;
      console.log('[AdminVerificationService] New Admin verification code dispatched to', email);
      await _delay(500);
      return { success: true, maskedEmail: maskEmail(email) };
    },
    async verifyNewAdminCode(sessionToken: string, code: string) {
      _purgeExpired();
      const session = _sessions.get(sessionToken);
      if (!session || !session.masterVerified) return { verified: false, error: 'Session expired. Please restart.' };
      await _delay(350);
      if (String(code) !== session.newAdminCodeHash) return { verified: false, error: 'Invalid verification code.' };
      session.newAdminVerified = true;
      delete session.newAdminCodeHash;
      return { verified: true };
    },
    async resendMasterAdminCode(sessionToken: string) {
      _purgeExpired();
      const session = _sessions.get(sessionToken);
      if (!session) return { success: false, error: 'Session expired.' };
      const master = _getMasterAdmin();
      if (!master) return { success: false, error: 'No active Master Admin found.' };
      session.masterCodeHash = String(_generateCode());
      console.log('[AdminVerificationService] Master Admin verification code re-dispatched to', master.email);
      await _delay(600);
      return { success: true };
    },
    async resendNewAdminCode(sessionToken: string) {
      _purgeExpired();
      const session = _sessions.get(sessionToken);
      if (!session || !session.masterVerified) return { success: false, error: 'Session expired.' };
      session.newAdminCodeHash = String(_generateCode());
      console.log('[AdminVerificationService] New Admin verification code re-dispatched to', session.pendingEmail);
      await _delay(600);
      return { success: true };
    },
    async createAdmin(sessionToken: string, adminData: NewAdminInput) {
      _purgeExpired();
      const session = _sessions.get(sessionToken);
      if (!session || !session.masterVerified || !session.newAdminVerified) {
        return { success: false, error: 'Both verification steps must be completed.' };
      }
      await _delay(800);
      const admin: AdminRecord = {
        id: 'ad' + Date.now(),
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        status: adminData.status,
        lastLogin: 'Never',
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        permissions: adminData.permissions || []
      };
      admins.push(admin);
      _sessions.delete(sessionToken);
      return { success: true, admin };
    },
    destroySession(sessionToken: string | null) { if (sessionToken) _sessions.delete(sessionToken); }
  };
})();

const authService = {
  getQueryParam(name: string): string | null { const params = new URLSearchParams(window.location.search); return params.get(name); },
  loadCurrentAdmin(): CurrentAdmin | null {
    const selected = this.getQueryParam('admin') || sessionStorage.getItem('adminSessionId') || 'ad1';
    sessionStorage.setItem('adminSessionId', selected);
    const admin = admins.find((a) => a.id === selected && a.status === 'ACTIVE');
    if (!admin) return null;
    const scopePerms = ROLE_PERMISSIONS[admin.role] || [];
    const permissions: PermissionId[] = admin.role === 'MASTER_ADMIN'
      ? ['*']
      : Array.from(new Set([...scopePerms, ...(admin.permissions || []).filter((p) => scopePerms.includes(p) || p === '*')]));
    return Object.freeze({
      ...admin,
      permissions,
      isMaster: admin.role === 'MASTER_ADMIN',
      homeRoute: ROLE_ROUTE_MAP[admin.role] || '/admin/dashboard',
      scope: ROLE_SCOPE[admin.role] || admin.role.toLowerCase()
    }) as CurrentAdmin;
  },
  requireAuth(): AuthResult { return currentAdmin ? { ok: true, admin: currentAdmin } : { ok: false, reason: 'unauthenticated' }; },
  isMasterAdmin(): boolean { return currentAdmin?.isMaster === true; },
  hasPermission(permission: PermissionId): boolean {
    if (!currentAdmin) return false;
    if (currentAdmin.isMaster || currentAdmin.permissions.includes('*')) return true;
    return currentAdmin.permissions.includes(permission);
  },
  canAccessModule(moduleId: string): boolean {
    if (!currentAdmin) return false;
    if (currentAdmin.isMaster || currentAdmin.permissions.includes('*')) return true;
    const module = moduleDefs.find((m) => m.id === moduleId);
    return !!module && this.hasPermission(module.requiredPermission);
  },
  getHomeRoute(): string { return currentAdmin?.homeRoute || '/admin/dashboard'; }
};

interface AuditLogEntry {
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  result: 'Success' | 'Denied' | string;
}

const auditLogService = (() => {
  const logs: AuditLogEntry[] = [
    { timestamp: 'Aug 12, 2026 09:18', admin: 'Farah Idris', action: 'Login', target: 'Admin Console', result: 'Success' },
    { timestamp: 'Aug 12, 2026 10:02', admin: 'Farah Idris', action: 'Admin created', target: 'Ben Okafor', result: 'Success' }
  ];
  const stamp = () => new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return {
    log(action: string, target: string, result: string = 'Success') { logs.unshift({ timestamp: stamp(), admin: currentAdmin?.name || 'System', action, target, result }); },
    getLogs(): AuditLogEntry[] { return logs.slice(); }
  };
})();

const ADMIN_ROUTES: Record<string, RouteConfig> = {
  '/admin/dashboard': { roles: ['MASTER_ADMIN'], view: 'master' },
  '/admin/general': { roles: ['GENERAL_ADMIN'], view: 'role', roleKey: 'GENERAL_ADMIN' },
  '/admin/customer-care': { roles: ['CUSTOMER_CARE_ADMIN'], view: 'role', roleKey: 'CUSTOMER_CARE_ADMIN' },
  '/admin/bd': { roles: ['BD_ADMIN'], view: 'role', roleKey: 'BD_ADMIN' },
  '/admin/executive': { roles: ['EXECUTIVE_ADMIN'], view: 'role', roleKey: 'EXECUTIVE_ADMIN' },
  '/admin/tech': { roles: ['TECH_ADMIN'], view: 'role', roleKey: 'TECH_ADMIN' },
  '/admin/admin-management': { roles: ['MASTER_ADMIN'], view: 'admin-management' }
};

const authorizationService = {
  requireAuth(): AuthResult { return authService.requireAuth(); },
  requireRole(scope: string): AuthResult {
    const auth = this.requireAuth();
    if (!auth.ok) return auth;
    if (auth.admin!.isMaster) return { ok: true, admin: auth.admin };
    if (auth.admin!.scope === scope) return { ok: true, admin: auth.admin };
    return { ok: false, reason: 'forbidden' };
  },
  canAccessRoute(path: string): boolean {
    const auth = this.requireAuth();
    if (!auth.ok) return false;
    const route = ADMIN_ROUTES[path];
    if (!route) return false;
    if (auth.admin!.isMaster) return true;
    return route.roles.includes(auth.admin!.role);
  },
  guardRoute(path: string): RouteGuardResult {
    const auth = this.requireAuth();
    if (!auth.ok) return { allowed: false, reason: 'unauthenticated' };
    const route = ADMIN_ROUTES[path];
    if (!route) {
      auditLogService.log('Unauthorized access attempt', path, 'Denied');
      return { allowed: false, reason: 'not-found', redirect: authService.getHomeRoute() };
    }
    if (auth.admin!.isMaster) return { allowed: true, ...route, route: path };
    if (route.roles.includes(auth.admin!.role)) return { allowed: true, ...route, route: path };
    auditLogService.log('Unauthorized access attempt', path, 'Denied');
    return { allowed: false, reason: 'forbidden', redirect: authService.getHomeRoute() };
  }
};

const adminRouter = {
  getPath(): string | null {
    if (location.hash && location.hash.startsWith('#/admin/')) return location.hash.slice(1).split('?')[0];
    const path = location.pathname.replace(/\\/g, '/');
    if (path.includes('/admin/')) return path.slice(path.indexOf('/admin/')).split('?')[0];
    return null;
  },
  navigate(path: string, replace = false): void {
    const target = path.startsWith('/') ? path : '/' + path;
    if (location.pathname.includes('m1-admin-dashboard.html') || location.protocol === 'file:') {
      const base = location.pathname.split('/').pop() || 'm1-admin-dashboard.html';
      const url = `${base}#${target}`;
      if (replace) location.replace(url); else location.hash = target;
      this.handleRoute(target);
      return;
    }
    if (replace) history.replaceState({ route: target }, '', target);
    else history.pushState({ route: target }, '', target);
    this.handleRoute(target);
  },
  hideAllViews(): void {
    byId('masterDashboardView')?.classList.add('hidden');
    byId('roleDashboardView')?.classList.add('hidden');
    byId('adminManagementView')?.classList.add('hidden');
    byId('forbiddenView')?.classList.add('hidden');
  },
  handleRoute(explicitPath?: string | null): void {
    const path = explicitPath || this.getPath();
    if (!path) { this.navigate(authService.getHomeRoute(), true); return; }
    closeModulePanel();
    const guard = authorizationService.guardRoute(path);
    if (!guard.allowed) {
      if (guard.reason === 'unauthenticated') { openModal('<h3>No active admin session found.</h3><div class="sub">Please sign in through the authenticated admin session.</div>'); return; }
      const home = guard.redirect || authService.getHomeRoute();
      if (home && home !== path) { this.navigate(home, true); return; }
      this.renderForbidden(home);
      return;
    }
    this.hideAllViews();
    if (guard.view === 'master') this.renderMasterDashboard();
    else if (guard.view === 'role') this.renderRoleDashboard(guard.roleKey!);
    else if (guard.view === 'admin-management') { this.renderMasterDashboard(); openAdminManagementModule(); }
    setAdminPageTitle(guard);
    renderSidebar();
  },
  renderMasterDashboard(): void {
    byId('masterDashboardView')?.classList.remove('hidden');
    state.masterPreview = null;
    if (byId('dashWelcomeTitle')) byId('dashWelcomeTitle').textContent = `Welcome back, ${currentAdmin!.name.split(' ')[0]}`;
    renderStats(); renderTicker(); renderGraph();
  },
  renderRoleDashboard(roleKey: AdminRole): void {
    const view = byId('roleDashboardView');
    view?.classList.remove('hidden');
    const cfg = ROLE_DASHBOARDS[roleKey];
    if (!cfg || !view) { this.renderForbidden(authService.getHomeRoute()); return; }
    const preview = state.masterPreview && state.masterPreview.role === roleKey ? state.masterPreview : null;
    view.innerHTML = `
      ${preview ? `<div class="master-preview-banner reveal"><span>Master Admin preview — viewing <strong>${esc(preview.name)}</strong> · ${esc(ROLE_LABELS[roleKey])}</span><button class="btn btn-ghost" type="button" id="exitPreviewBtn">Exit Preview</button></div>` : ''}
      <section class="role-dash-hero reveal">
        <div class="role-badge"><span></span> ${esc(ROLE_LABELS[roleKey])}</div>
        <h1>${preview ? esc(cfg.title) : `Welcome back, ${esc(currentAdmin!.name.split(' ')[0])}`}</h1>
        <p>${esc(cfg.subtitle)}</p>
      </section>
      <section class="role-action-grid reveal">${cfg.cards.map((c) => `
        <div class="role-action-card"><strong>${esc(c.label)}</strong><span>${esc(c.desc)}</span>
        <div class="metric">${esc(String(typeof c.metric === 'function' ? c.metric() : c.metric))}</div></div>`).join('')}
      </section>
      ${!preview ? `<div class="role-scope-note reveal">This workspace is scoped exclusively to your <strong>${esc(ROLE_LABELS[roleKey])}</strong> role.</div>` : ''}`;
    byId('exitPreviewBtn')?.addEventListener('click', () => { state.masterPreview = null; adminRouter.navigate('/admin/admin-management'); });
  },
  renderForbidden(homeRoute?: string): void {
    this.hideAllViews();
    byId('forbiddenView')?.classList.remove('hidden');
    closeModulePanel();
    (byId('forbiddenReturnBtn') as HTMLButtonElement).onclick = () => this.navigate(homeRoute || authService.getHomeRoute());
  },
  bind(): void {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());
  },
  redirectToHome(): void { this.navigate(authService.getHomeRoute(), true); }
};

function setAdminPageTitle(guard: RouteGuardResult): void {
  if (!guard) return;
  if (guard.view === 'master') document.title = 'Master Dashboard — M1 Admin';
  else if (guard.view === 'role') document.title = `${ROLE_LABELS[guard.roleKey!] || 'Dashboard'} — M1 Admin`;
  else if (guard.view === 'admin-management') document.title = 'Admin Management — M1 Admin';
}

function masterViewAdminDashboard(adminOrRole: AdminRole | { role: AdminRole; name: string; id?: string }): void {
  if (!authService.isMasterAdmin()) return;
  const role: AdminRole = typeof adminOrRole === 'string' ? adminOrRole : adminOrRole.role;
  const name: string = typeof adminOrRole === 'string' ? ROLE_LABELS[adminOrRole] : adminOrRole.name;
  closeModulePanel();
  auditLogService.log('Master Admin viewed admin dashboard', name, 'Success');
  if (role === 'MASTER_ADMIN') {
    state.masterPreview = null;
    adminRouter.navigate('/admin/dashboard');
    return;
  }
  const route = ROLE_ROUTE_MAP[role];
  if (!route) return;
  state.masterPreview = { role, name, id: typeof adminOrRole === 'string' ? null : (adminOrRole.id || null) };
  adminRouter.navigate(route);
}

function bindAdminManagementActions(wrap: HTMLElement): void {
  wrap.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const viewDash = target.closest('[data-view-dash]') as HTMLElement | null;
    const rm = target.closest('[data-remove-admin]') as HTMLElement | null;
    const toggle = target.closest('[data-toggle-admin]') as HTMLElement | null;
    const edit = target.closest('[data-edit-admin]') as HTMLElement | null;
    const perm = target.closest('[data-perm-admin]') as HTMLElement | null;
    const id = viewDash?.dataset.viewDash || rm?.dataset.removeAdmin || toggle?.dataset.toggleAdmin || edit?.dataset.editAdmin || perm?.dataset.permAdmin;
    if (!id) return;
    const targetAdmin = admins.find((x) => x.id === id);
    if (!targetAdmin) { showToast('Admin not found.'); return; }
    if (!authService.isMasterAdmin()) { adminRouter.renderForbidden(authService.getHomeRoute()); return; }
    if (viewDash) { masterViewAdminDashboard(targetAdmin); return; }
    if (edit) { openAdminEditor(targetAdmin); return; }
    if (perm) { openPermissionsEditor(targetAdmin); return; }
    if (toggle) { toggleAdminStatus(targetAdmin); return; }
    if (rm) { confirmAdminRemoval(targetAdmin); return; }
  });
}

// NOTE: openAdminEditor, openPermissionsEditor, toggleAdminStatus, confirmAdminRemoval
// were referenced but not defined in the original source — declared here for type-safety.
// Replace with real implementations as needed.
declare function openAdminEditor(admin: AdminRecord): void;
declare function openPermissionsEditor(admin: AdminRecord): void;
declare function toggleAdminStatus(admin: AdminRecord): void;
declare function confirmAdminRemoval(admin: AdminRecord): void;

const state: AppState = {
  currentModule: null,
  tabs: {},
  search: {},
  notifIndex: 0,
  graphPeriod: 'monthly',
  compareSelectedFlag: {},
  masterPreview: null
};

/* ============================================================
   TOAST / OVERLAY / MODAL HELPERS
============================================================ */
function showToast(text: string): void {
  const t = byId('toast'); t.textContent = text; t.classList.add('show');
  clearTimeout((showToast as any).timer); (showToast as any).timer = setTimeout(() => t.classList.remove('show'), 2400);
}
function openOverlay(): void { byId('overlay').classList.add('show'); }
function closeOverlay(): void {
  const m = byId('detailModal') as HTMLElement & { _wizardCleanup?: (() => void) | null };
  if (m._wizardCleanup) { m._wizardCleanup(); m._wizardCleanup = null; }
  byId('overlay').classList.remove('show');
  m.classList.remove('show', 'modal-wizard', 'modal-listing');
}
function openModal(html: string): void {
  openOverlay();
  const m = byId('detailModal');
  m.className = 'modal glass show';
  m.innerHTML = `<button class="modal-close" data-close-modal aria-label="Close">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  </button>${html}`;
}

/* ============================================================
   SIDEBAR
============================================================ */
const swatches = ['#c9cdd6', '#a9b2be', '#8f97a3', '#e7e9ee', '#b8beca', '#7d8698', '#dfe2e8', '#9aa1ac', '#c2c6cf', '#6f7885'];

function renderSidebar(): void {
  const sidebar = byId('adminSidebar');
  if (!sidebar || !currentAdmin) { if (sidebar) sidebar.innerHTML = ''; return; }
  const path = adminRouter.getPath();

  const allowedModules = moduleDefs.filter((m) => authService.canAccessModule(m.id) && m.id !== 'admin');
  const workspaceTitle = currentAdmin.isMaster ? 'Master Workspace' : `${ROLE_LABELS[currentAdmin.role] || 'Admin'} Workspace`;
  const route = ROLE_ROUTE_MAP[currentAdmin.role];
  const cfg = ROLE_DASHBOARDS[currentAdmin.role];

  let html = `<div class="sidebar-label">${workspaceTitle}</div>`;
  if (!currentAdmin.isMaster && route && cfg) {
    html += `
      <button class="nav-block ${path === route && !state.currentModule ? 'active' : ''}" data-route="${route}" type="button">
        <div class="nb-copy"><strong>${esc(cfg.title || ROLE_LABELS[currentAdmin.role])}</strong><span>${esc(cfg.subtitle || '')}</span></div>
      </button>`;
  }

  if (allowedModules.length) {
    html += `<div class="sidebar-label" style="margin-top:10px">Allowed Modules</div>` + allowedModules.map((m) => {
      let badgeText = m.badge;
      if (m.id === 'verifications' && approvals.length > 0) {
        badgeText = `${approvals.length} Pending`;
      }
      return `
      <button class="nav-block ${state.currentModule === m.id ? 'active' : ''}" data-module="${m.id}" type="button">
        <div class="nb-copy"><strong>${m.label}</strong><span>${m.desc}</span></div>
        ${badgeText ? `<span class="nb-badge" style="${m.id === 'verifications' && approvals.length > 0 ? 'background:var(--warn);color:#000' : ''}">${badgeText}</span>` : ''}
      </button>`;
    }).join('');
  }

  if (currentAdmin.isMaster) {
    html += `
      <div class="sidebar-label" style="margin-top:10px">Administration (Master Only)</div>
      <button class="nav-block ${path === '/admin/dashboard' && !state.currentModule ? 'active' : ''}" data-route="/admin/dashboard" type="button">
        <div class="nb-copy"><strong>Master Dashboard</strong><span>Platform overview & analytics</span></div>
      </button>
      <button class="nav-block ${path === '/admin/admin-management' || state.currentModule === 'admin_management' ? 'active' : ''}" data-module="admin_management" type="button">
        <div class="nb-copy"><strong>Admin Management</strong><span>Manage admins & role dashboards</span></div>
      </button>
      <button class="nav-block ${state.currentModule === 'audit_logs' ? 'active' : ''}" data-module="audit_logs" type="button">
        <div class="nb-copy"><strong>Audit Logs</strong><span>Admin activity and security events</span></div>
      </button>`;
  }

  sidebar.innerHTML = html;
}

/* ============================================================
   DASHBOARD HOME
============================================================ */
function renderStats(): void {
  const totalUsers = users.length + 42;
  const verifiedCount = listings.filter(l => l.verificationStatus === 'Verified' && l.status !== 'Unpublished').length;
  const approvalsCount = approvals.length;
  const data: Array<{ num: number; lbl: string; delta: string; down?: boolean; type?: string }> = [
    { num: verifiedCount, lbl: 'Verified Listings', delta: 'Persisted in database', type: 'verified' },
    { num: approvalsCount, lbl: 'Pending Approvals', delta: `${approvalsCount} awaiting verification`, down: false, type: 'approvals' },
    { num: listings.filter((l) => l.status === 'Active').length, lbl: 'Active Listings', delta: '+2 today' },
    { num: totalUsers, lbl: 'Platform Users', delta: '+3.1% this week' }
  ];
  byId('statRow').innerHTML = data.map((d) => `
    <div class="stat-card" ${d.type ? `style="cursor:pointer" data-nav-listings="${d.type}" title="Click to view ${d.lbl}"` : ''}>
      <div class="num">${d.num}</div>
      <div class="lbl">${d.lbl}</div>
      <div class="delta ${d.down ? 'down' : ''}">${d.delta}</div>
    </div>
  `).join('');

  byId('statRow').querySelectorAll<HTMLElement>('[data-nav-listings]').forEach(el => {
    el.addEventListener('click', () => {
      state.tabs.listingsToggle = el.dataset.navListings;
      openModule('verifications');
    });
  });

  renderDashboardApprovalsWidget();
}

function renderDashboardApprovalsWidget(): void {
  const widget = byId('dashApprovalsWidget');
  if (!widget) return;
  if (!approvals.length) {
    widget.innerHTML = `
      <div class="dash-widget-head">
        <h3>Approvals Queue</h3>
        <span class="chip ok">✓ All caught up!</span>
      </div>
      <div style="font-size:12.5px;color:var(--muted-2);padding:14px 0">No listings currently waiting for admin verification.</div>`;
    return;
  }
  widget.innerHTML = `
    <div class="dash-widget-head">
      <div>
        <h3>Approvals Queue (${approvals.length})</h3>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">Listings awaiting admin review & verification declaration</div>
      </div>
      <button class="btn btn-ghost" id="dashViewAllApprovalsBtn" style="font-size:11px">View Full Queue →</button>
    </div>
    <div class="dash-widget-list">
      ${approvals.slice(0, 3).map(a => `
        <div class="dash-widget-item">
          <div>
            <strong>${esc(a.name)}</strong> <span style="font-size:11.5px;color:var(--muted-2)">(${esc(a.id)})</span>
            <div style="font-size:11.5px;color:var(--muted);margin-top:2px">Lister: ${esc(a.owner)} (${esc(a.company || 'Private')}) • Ask: ${esc(a.ask)} • ${a.docs ? a.docs.length : 25} Documents</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-ghost" data-quick-review="${a.id}" style="padding:6px 12px;font-size:11px">Review</button>
            <button class="btn btn-primary" data-quick-verify="${a.id}" style="padding:6px 12px;font-size:11px;background:var(--success);color:#000;border:none">Declare Verified</button>
          </div>
        </div>
      `).join('')}
    </div>`;

  byId('dashViewAllApprovalsBtn')?.addEventListener('click', () => {
    state.tabs.listingsToggle = 'approvals';
    openModule('verifications');
  });

  widget.querySelectorAll<HTMLElement>('[data-quick-review]').forEach(b => {
    b.addEventListener('click', () => {
      const item = approvals.find(a => a.id === b.dataset.quickReview);
      if (item) openAdminListingModal(item);
    });
  });

  widget.querySelectorAll<HTMLElement>('[data-quick-verify]').forEach(b => {
    b.addEventListener('click', () => {
      const item = approvals.find(a => a.id === b.dataset.quickVerify);
      if (item) executeDeclareVerified(item);
    });
  });
}

function renderTicker(): void {
  const n = notifications[state.notifIndex];
  byId('tickerBody').innerHTML = `<span class="ticker-dot"></span><span class="ticker-text">${esc(n.text)}</span>`;
  byId('tickerPos').textContent = `${state.notifIndex + 1} / ${notifications.length}`;
  (byId('notifPrev') as HTMLButtonElement).disabled = state.notifIndex === 0;
  (byId('notifNext') as HTMLButtonElement).disabled = state.notifIndex === notifications.length - 1;
}

function graphData(period: 'weekly' | 'monthly' | 'yearly'): { values: number[]; labels: string[] } {
  const seeds: Record<'weekly' | 'monthly' | 'yearly', number[]> = {
    weekly: [12, 18, 15, 22, 19, 26, 24],
    monthly: [80, 95, 88, 120, 110, 140, 132, 150, 145, 168, 160, 182],
    yearly: [420, 560, 610, 740, 890, 1020]
  };
  const labels: Record<'weekly' | 'monthly' | 'yearly', string[]> = {
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    yearly: ['2021', '2022', '2023', '2024', '2025', '2026']
  };
  return { values: seeds[period], labels: labels[period] };
}

function renderGraph(): void {
  const { values, labels } = graphData(state.graphPeriod);
  const w = 640, h = 190, padL = 28, padB = 22, padT = 10, padR = 10;
  const max = Math.max(...values), min = Math.min(...values);
  const stepX = (w - padL - padR) / (values.length - 1);
  const pts: [number, number][] = values.map((v, i) => {
    const x = padL + i * stepX;
    const y = padT + (1 - ((v - min) / (max - min || 1))) * (h - padT - padB);
    return [x, y];
  });
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${h - padB} L${pts[0][0].toFixed(1)},${h - padB} Z`;
  const dots = pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#fff"/>`).join('');
  const xLabels = pts.map((p, i) => i % Math.ceil(pts.length / 8 || 1) === 0 ? `<text x="${p[0].toFixed(1)}" y="${h - 6}" class="graph-axis-lbl" text-anchor="middle">${labels[i]}</text>` : '').join('');
  byId('joinsGraph').innerHTML = `
    <defs><linearGradient id="joinsFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${areaPath}" fill="url(#joinsFade)"/>
    <path d="${linePath}" fill="none" stroke="#ffffff" stroke-width="2"/>
    ${dots}${xLabels}`;
}

function bindDashboard(): void {
  byId('notifPrev').addEventListener('click', () => { state.notifIndex = Math.max(0, state.notifIndex - 1); renderTicker(); });
  byId('notifNext').addEventListener('click', () => { state.notifIndex = Math.min(notifications.length - 1, state.notifIndex + 1); renderTicker(); });
  byId('graphToggle').addEventListener('click', (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('button[data-period]') as HTMLButtonElement | null;
    if (!btn) return;
    state.graphPeriod = btn.dataset.period as 'weekly' | 'monthly' | 'yearly';
    document.querySelectorAll('#graphToggle button').forEach((b) => b.classList.toggle('active', b === btn));
    renderGraph();
  });
}

/* ============================================================
   GENERIC TABLE RENDERER
============================================================ */
function renderTable<T extends Record<string, any>>(columns: TableColumn<T>[], rows: T[], onRowClick?: ((row: T) => void) | null, emptyText?: string): string {
  if (!rows.length) return `<div class="sheet-wrap"><table class="sheet"><tbody><tr class="row-empty"><td>${emptyText || 'No records yet.'}</td></tr></tbody></table></div>`;
  const head = `<tr>${columns.map((c) => `<th>${c.label}</th>`).join('')}</tr>`;
  const body = rows.map((row, idx) => `<tr data-row-idx="${idx}">${columns.map((c) => `<td class="${c.muted ? 'muted-cell' : ''}">${c.render ? c.render(row) : esc((row as any)[c.key] ?? '')}</td>`).join('')}</tr>`).join('');
  const table = `<table class="sheet"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = table;
  if (onRowClick) {
    wrap.addEventListener('click', (e: MouseEvent) => {
      const tr = (e.target as HTMLElement).closest('tr[data-row-idx]') as HTMLElement | null;
      if (!tr || (e.target as HTMLElement).closest('.row-edit-btn')) return;
      onRowClick(rows[Number(tr.dataset.rowIdx)]);
    });
  }
  return wrap.outerHTML;
}
// Because renderTable above returns a detached element's outerHTML (losing listeners),
// we re-bind via event delegation per rendered container instead — see bindSheet().
function bindSheet<T>(containerEl: HTMLElement, rows: T[], onRowClick?: ((row: T) => void) | null, onEditClick?: ((row: T) => void) | null): void {
  containerEl.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const editBtn = target.closest('.row-edit-btn') as HTMLElement | null;
    if (editBtn) { onEditClick && onEditClick(rows[Number((editBtn as HTMLElement).dataset.editIdx)]); return; }
    const tr = target.closest('tr[data-row-idx]') as HTMLElement | null;
    if (tr && onRowClick) onRowClick(rows[Number(tr.dataset.rowIdx)]);
  });
}

/* ============================================================
   MODULE OPEN/CLOSE
============================================================ */
function openModule(id: string): void {
  if (id === 'admin_management') {
    if (!authService.isMasterAdmin()) {
      auditLogService.log('Unauthorized access attempt', 'Admin Management', 'Denied');
      adminRouter.renderForbidden(authService.getHomeRoute());
      return;
    }
    adminRouter.navigate('/admin/admin-management');
    return;
  }
  const def = moduleDefs.find((m) => m.id === id);
  if (!def) { showForbidden('Module not found.'); return; }
  if (!authService.canAccessModule(id)) {
    auditLogService.log('Unauthorized access attempt', def.label, 'Denied');
    showForbidden('403 Access Denied', `You do not have permission to access the ${def.label} module.`);
    return;
  }
  adminRouter.hideAllViews();
  state.currentModule = id;
  byId('moduleTitle').textContent = def.label;
  byId('moduleSub').textContent = def.desc;
  byId('breadcrumb').innerHTML = `<span>Admin</span><span class="crumb-sep">/</span><span class="crumb-current">${def.label}</span>`;
  byId('modulePage').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderModuleBody(id);
  renderSidebar();
}
function closeModulePanel(): void {
  if (!byId('modulePage').classList.contains('open')) return;
  byId('modulePage').classList.remove('open');
  document.body.style.overflow = '';
  state.currentModule = null;
  document.querySelectorAll('.verif-shift-arrow').forEach((el) => el.remove());
  byId('breadcrumb').innerHTML = `<span>Admin</span>`;
}
function closeModule(): void {
  closeModulePanel();
  const path = adminRouter.getPath();
  if (path === '/admin/admin-management') { adminRouter.navigate('/admin/dashboard'); return; }
  adminRouter.handleRoute(path || authService.getHomeRoute());
}

function renderModuleBody(id: string): void {
  const body = byId('moduleBody');
  const renderers: Record<string, () => void> = {
    databases: renderDatabasesModule,
    eacquisition: renderEAcquisitionModule,
    datafetching: renderDataFetchingModule,
    listings: renderListingsHub,
    verifications: renderVerificationsModule,
    featuring: renderFeaturingModule,
    acquisition: renderAcquisitionModule,
    finance: renderFinanceModule,
    problems: renderProblemsModule,
    admin: renderAdminModule,
    audit_logs: renderAuditLogsModule
  };
  body.innerHTML = '';
  const renderer = renderers[id];
  if (!renderer) { body.innerHTML = '<div class="info-empty">Module not found.</div>'; return; }
  renderer();
}

/* ============================================================
   MODULE: DATABASES
============================================================ */
function renderDatabasesModule(): void {
  const body = byId('moduleBody');
  const sub = state.tabs.databases || 'hub';
  if (sub === 'hub') {
    const hubItems = [
      { key: 'users', label: 'Users Database', desc: 'Every registered buyer & seller account.' },
      { key: 'partners', label: 'Partners Database', desc: 'Industry partners in the exclusive circle.' },
      { key: 'assets', label: 'Assets Database', desc: 'Every aircraft/yacht model, editable.' },
      { key: 'inventory', label: 'Inventory Database', desc: "Users' inventory records, read-only." },
      { key: 'offmarket', label: 'Off-Market Database', desc: 'Listings marked off-market.' }
    ];
    body.innerHTML = `<div class="hub-grid">${hubItems.map((h) => `
      <button class="hub-block" data-db-sub="${h.key}">
        <strong>${h.label}</strong><span>${h.desc}</span>
      </button>`).join('')}</div>`;
    body.querySelectorAll<HTMLElement>('[data-db-sub]').forEach((b) => b.addEventListener('click', () => { state.tabs.databases = b.dataset.dbSub; renderModuleBody('databases'); }));
    return;
  }
  const backBtn = `<button class="btn btn-ghost" id="dbBackToHub" style="margin-bottom:16px">← All Databases</button>`;
  if (sub === 'users') {
    const term = (state.search.users || '').toLowerCase();
    const rows = users.filter((u) => !term || u.name.toLowerCase().includes(term) || u.company.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    body.innerHTML = `${backBtn}
      <div class="panel-head"><h3>Users Database</h3><span class="meta">${rows.length} records · read-only</span></div>
      <div class="search-bar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input id="userSearch" placeholder="Search users…" value="${esc(state.search.users || '')}"></div>
      <div class="sheet-wrap" id="usersTableWrap">${renderTable<UserRecord>(
      [{ key: 'name', label: 'Username' }, { key: 'company', label: 'Company', muted: true }, { key: 'email', label: 'Email', muted: true }, { key: 'phone', label: 'Phone', muted: true }],
      rows, null, 'No users match your search.'
    )}</div>`;
    byId('usersTableWrap').replaceWith((() => {
      const d = document.createElement('div'); d.id = 'usersTableWrap'; d.innerHTML = renderTable<UserRecord>(
        [{ key: 'name', label: 'Username' }, { key: 'company', label: 'Company', muted: true }, { key: 'email', label: 'Email', muted: true }, { key: 'phone', label: 'Phone', muted: true }],
        rows, null, 'No users match your search.'); return d;
    })());
    bindSheet(byId('usersTableWrap'), rows, openUserSummary);
    byId('dbBackToHub').addEventListener('click', () => { state.tabs.databases = 'hub'; renderModuleBody('databases'); });
    (byId('userSearch') as HTMLInputElement).addEventListener('input', (e) => { state.search.users = (e.target as HTMLInputElement).value; renderModuleBody('databases'); });
  }
  if (sub === 'partners') {
    body.innerHTML = `${backBtn}
      <div class="panel-head"><h3>Partners Database</h3><div class="panel-actions"><button class="btn btn-primary" id="addPartnerBtn">+ Add Partner</button></div></div>
      <div class="sheet-wrap" id="partnersWrap"></div>`;
    byId('partnersWrap').innerHTML = renderTable<PartnerRecord>(
      [{ key: 'company', label: 'Company' }, { key: 'location', label: 'Location', muted: true }, { key: 'founder', label: 'Founder', muted: true }, { key: 'email', label: 'Email', muted: true }],
      partners, null);
    bindSheet(byId('partnersWrap'), partners, openPartnerDetail);
    byId('dbBackToHub').addEventListener('click', () => { state.tabs.databases = 'hub'; renderModuleBody('databases'); });
    byId('addPartnerBtn').addEventListener('click', () => { showToast('Partner sign-up request initiated — invite sent.'); });
  }
  if (sub === 'assets') {
    body.innerHTML = `${backBtn}
      <div class="panel-head"><h3>Assets Database</h3><div class="panel-actions"><button class="btn btn-primary" id="addAssetBtn">+ Add New</button></div></div>
      <div class="sheet-wrap" id="assetsWrap"></div>`;
    const cols: TableColumn<AssetRecord>[] = [{ key: 'manufacturer', label: 'Manufacturer' }, { key: 'model', label: 'Model' }, { key: 'type', label: 'Jet Type', muted: true }, { key: 'passengers', label: 'Passengers', muted: true },
    { key: 'edit', label: '', render: (r) => `<button class="row-edit-btn" data-edit-idx="${assetsDb.indexOf(r)}" title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>` }];
    byId('assetsWrap').innerHTML = renderTable<AssetRecord>(cols, assetsDb, null);
    bindSheet(byId('assetsWrap'), assetsDb, openAssetDetail, openAssetDetail);
    byId('dbBackToHub').addEventListener('click', () => { state.tabs.databases = 'hub'; renderModuleBody('databases'); });
    byId('addAssetBtn').addEventListener('click', () => { showToast('New asset draft created — complete details to publish.'); });
  }
  if (sub === 'inventory') {
    body.innerHTML = `${backBtn}<div class="panel-head"><h3>Inventory Database</h3><span class="meta">Read-only</span></div><div class="sheet-wrap" id="invWrap"></div>`;
    byId('invWrap').innerHTML = renderTable<InventoryRecord>([{ key: 'owner', label: 'Owner' }, { key: 'asset', label: 'Asset' }, { key: 'since', label: 'Since', muted: true }, { key: 'status', label: 'Status', muted: true }], inventory, null);
    byId('dbBackToHub').addEventListener('click', () => { state.tabs.databases = 'hub'; renderModuleBody('databases'); });
  }
  if (sub === 'offmarket') {
    body.innerHTML = `${backBtn}<div class="panel-head"><h3>Off-Market Database</h3></div><div class="sheet-wrap" id="omWrap"></div>`;
    byId('omWrap').innerHTML = renderTable<OffMarketRecord>([{ key: 'name', label: 'Asset' }, { key: 'owner', label: 'Owner' }, { key: 'ask', label: 'Ask', muted: true }, { key: 'status', label: 'Status', muted: true }], offMarket, null);
    byId('dbBackToHub').addEventListener('click', () => { state.tabs.databases = 'hub'; renderModuleBody('databases'); });
  }
}

function openUserSummary(u: UserRecord): void {
  openModal(`
    <div class="profile-row"><img src="${u.pfp}" alt="${esc(u.name)}"><div><h4>${esc(u.name)}</h4><span>${esc(u.company)} · ${esc(u.email)} · ${esc(u.phone)}</span></div></div>
    <div class="modal-grid">
      <div class="modal-card"><h4>Listing summary</h4>
        <div class="deep-link-row"><span>All Listings — ${u.listings}</span><button data-deep="verifications" data-user="${esc(u.name)}">→</button></div>
        <div class="deep-link-row"><span>Active Listings — ${u.active}</span><button data-deep="verifications" data-user="${esc(u.name)}">→</button></div>
        <div class="deep-link-row"><span>Featured Listings — ${u.featured}</span><button data-deep="featuring" data-user="${esc(u.name)}">→</button></div>
        <div class="deep-link-row"><span>Verified Listings — ${u.verified}</span><button data-deep="verifications" data-user="${esc(u.name)}">→</button></div>
        <div class="deep-link-row"><span>Acquisition Requests — ${u.acqRequests}</span><button data-deep="acquisition" data-user="${esc(u.name)}">→</button></div>
      </div>
      <div class="modal-card"><h4>Restricted</h4>
        <p style="font-size:12px;color:var(--muted);line-height:1.7">Password and PIN review is available to authorized super admins only.</p>
        <button class="btn btn-ghost" style="margin-top:10px" id="revealCredsBtn">Review password / PIN</button>
      </div>
    </div>`);
  byId('detailModal').querySelectorAll<HTMLElement>('[data-deep]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeOverlay();
      const mod = btn.dataset.deep!;
      const nameFilter = btn.dataset.user;
      openModule(mod);
      if (mod === 'listings' || mod === 'verifications') {
        state.tabs.listingsToggle = 'verified';
        state.search.listings = nameFilter || '';
        renderModuleBody(mod);
      }
    });
  });
  const revealBtn = byId('detailModal').querySelector('#revealCredsBtn') as HTMLElement | null;
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      openModal(`
        <h3>Security Audit Transcript — ${esc(u.name)}</h3>
        <div class="sub">Authorized Super Admin Access Recorded in Audit Logs</div>
        <div class="modal-card" style="margin-top:14px">
          <h4>Account Credentials Summary</h4>
          <div class="detail-list" style="grid-template-columns:repeat(2,1fr)">
            <div class="item"><span>User ID</span><strong>${esc(u.id)}</strong></div>
            <div class="item"><span>Security PIN</span><strong>8492 (Encrypted)</strong></div>
            <div class="item"><span>Password Hash</span><strong>$2b$12$K89v... (Bcrypt)</strong></div>
            <div class="item"><span>2FA Authentication</span><strong>Enabled (SMS / Auth)</strong></div>
            <div class="item"><span>Last Password Reset</span><strong>May 14, 2026</strong></div>
            <div class="item"><span>Fraud Flags</span><strong>0 Security Flags</strong></div>
          </div>
        </div>
      `);
      auditLogService.log('Reviewed user password/PIN credentials', u.name, 'Success');
    });
  }
}

function openPartnerDetail(p: PartnerRecord): void {
  openModal(`
    <h3>${esc(p.company)}</h3><div class="sub">${esc(p.location)} · ${esc(p.website)}</div>
    <div class="modal-grid">
      <div class="modal-card"><h4>Company details</h4><div class="detail-list">
        <div class="item"><span>Founder</span><strong>${esc(p.founder)}</strong></div>
        <div class="item"><span>Email</span><strong>${esc(p.email)}</strong></div>
        <div class="item"><span>Phone</span><strong>${esc(p.phone)}</strong></div>
        <div class="item"><span>Website</span><strong>${esc(p.website)}</strong></div>
      </div></div>
      <div class="modal-card"><h4>Team members</h4>${p.members.length ? p.members.map((m) => `<div class="deep-link-row"><span>${esc(m.name)} · ${esc(m.number)}</span><span style="color:var(--muted-2)">${esc(m.email)}</span></div>`).join('') : '<p style="color:var(--muted-2);font-size:12px">No additional members listed.</p>'}</div>
    </div>`);
}

function openAssetDetail(a: AssetRecord): void {
  openModal(`
    <h3>${esc(a.manufacturer)} ${esc(a.model)}</h3><div class="sub">${esc(a.type)} · Editable record</div>
    <div class="modal-grid">
      <div class="modal-card"><h4>Edit details</h4>
        <div class="field-row" style="margin-bottom:10px"><label>Manufacturer</label><input class="field-input" value="${esc(a.manufacturer)}"></div>
        <div class="field-row" style="margin-bottom:10px"><label>Model</label><input class="field-input" value="${esc(a.model)}"></div>
        <div class="field-row" style="margin-bottom:10px"><label>Jet type</label><input class="field-input" value="${esc(a.type)}"></div>
        <div class="field-row" style="margin-bottom:10px"><label>Passenger capacity</label><input class="field-input" type="number" value="${a.passengers}"></div>
        <button class="btn btn-primary" id="saveAssetBtn">Save changes</button>
      </div>
      <div class="modal-card"><h4>Preview</h4><img src="${a.image}" style="width:100%;height:180px;object-fit:cover;border-radius:14px"></div>
    </div>`);
  byId('saveAssetBtn').addEventListener('click', () => { closeOverlay(); showToast('Asset record updated.'); });
}

/* ============================================================
   MODULE: E-ACQUISITION
============================================================ */
function renderEAcquisitionModule(): void {
  const tab = state.tabs.eacquisition || 'leads';
  const body = byId('moduleBody');
  body.innerHTML = `<div class="tab-row" id="eaTabs">
      <button class="tab-btn ${tab === 'leads' ? 'active' : ''}" data-tab="leads">Leads</button>
      <button class="tab-btn ${tab === 'wall' ? 'active' : ''}" data-tab="wall">M1 Wall</button>
      <button class="tab-btn ${tab === 'efficiency' ? 'active' : ''}" data-tab="efficiency">Efficiency</button>
    </div><div id="eaBody"></div>`;
  byId('eaTabs').addEventListener('click', (e: MouseEvent) => { const b = (e.target as HTMLElement).closest('[data-tab]') as HTMLElement | null; if (!b) return; state.tabs.eacquisition = b.dataset.tab; renderModuleBody('eacquisition'); });
  const eaBody = byId('eaBody');
  if (tab === 'leads') {
    eaBody.innerHTML = `<div class="panel-head"><h3>Leads</h3><span class="meta">${leads.length} acquisition-engine sessions</span></div><div class="sheet-wrap" id="leadsWrap"></div>`;
    byId('leadsWrap').innerHTML = renderTable<LeadRecord>([{ key: 'name', label: 'Name' }, { key: 'model', label: 'Plane model' }, { key: 'pax', label: 'Pax', muted: true }, { key: 'phone', label: 'Phone', muted: true }], leads, null);
    bindSheet(byId('leadsWrap'), leads, openLeadDetail);
  }
  if (tab === 'wall') {
    eaBody.innerHTML = `<div class="panel-head"><h3>M1 Wall / Office usage</h3></div><div class="sheet-wrap" id="wallWrap"></div>`;
    byId('wallWrap').innerHTML = renderTable<WallUsage>([{ key: 'partner', label: 'Partner' }, { key: 'hours', label: 'Usage hours', muted: true }], m1wall, null);
  }
  if (tab === 'efficiency') {
    eaBody.innerHTML = `
      <div class="panel-head"><h3>Efficiency</h3><div class="panel-actions"><button class="btn btn-primary" id="runLoadTest">Run 10-request load test</button></div></div>
      <div class="grid-cards">
        <div class="mini-card"><div class="num">${leads.length * 37}</div><div class="lbl">Total engine activities</div></div>
        <div class="mini-card"><div class="num">96.4%</div><div class="lbl">Completion efficiency</div></div>
        <div class="mini-card"><div class="num">1.8s</div><div class="lbl">Avg. response time</div></div>
      </div>
      <div id="loadTestResult" style="margin-top:16px"></div>`;
    byId('runLoadTest').addEventListener('click', (e: MouseEvent) => {
      const btn = e.target as HTMLButtonElement;
      btn.disabled = true; btn.textContent = 'Running…';
      showToast('Firing 10 concurrent engine requests…');
      setTimeout(() => {
        btn.disabled = false; btn.textContent = 'Run 10-request load test';
        const rows = Array.from({ length: 10 }, (_, i) => ({ req: `Request #${i + 1}`, latency: `${(600 + Math.random() * 900).toFixed(0)}ms`, status: Math.random() > 0.08 ? 'OK' : 'Retry' }));
        byId('loadTestResult').innerHTML = `<div class="sheet-wrap">${renderTable([{ key: 'req', label: 'Request' }, { key: 'latency', label: 'Latency', muted: true }, { key: 'status', label: 'Status', render: (r: any) => `<span class="chip ${r.status === 'OK' ? 'ok' : 'warn'}">${r.status}</span>` }], rows, null)}</div>`;
        showToast('Load test complete — 10/10 requests processed.');
      }, 1200);
    });
  }
}

function openLeadDetail(l: LeadRecord): void {
  openModal(`
    <h3>${esc(l.name)}</h3><div class="sub">${esc(l.model)} · ${l.pax} pax requested · ${esc(l.phone)}</div>
    <div class="modal-grid">
      <div class="modal-card"><h4>Contact</h4><div class="detail-list">
        <div class="item"><span>Email</span><strong>${esc(l.email)}</strong></div>
        <div class="item"><span>Business email</span><strong>${esc(l.bizEmail)}</strong></div>
        <div class="item"><span>Location</span><strong>${esc(l.location)}</strong></div>
        <div class="item"><span>Suggested alternatives</span><strong>${l.suggestions.join(', ')}</strong></div>
      </div></div>
      <div class="modal-card"><h4>7-question wizard answers</h4>${l.answers.map((a, i) => `<div class="deep-link-row"><span>Q${i + 1}</span><span style="color:var(--muted)">${esc(a)}</span></div>`).join('')}</div>
    </div>`);
}

/* ============================================================
   MODULE: DATA FETCHING (beta)
============================================================ */
interface NewsItem {
  id: string;
  heading: string;
  body: string;
  image: string;
  link: string;
}

let newsItems: NewsItem[] = [
  { id: 'n1', heading: 'Gulfstream unveils G900 test milestones', body: 'Flight-test program update from Gulfstream.', image: '', link: '#' },
  { id: 'n2', heading: 'Superyacht demand rises in Med charter season', body: 'Brokers report a 14% YoY increase in inquiries.', image: '', link: '#' }
];

function renderDataFetchingModule(): void {
  const tab = state.tabs.datafetching || 'intel';
  const body = byId('moduleBody');
  body.innerHTML = `<div class="tab-row" id="dfTabs">
      <button class="tab-btn ${tab === 'intel' ? 'active' : ''}" data-tab="intel">Asset Intelligence</button>
      <button class="tab-btn ${tab === 'news' ? 'active' : ''}" data-tab="news">Market News</button>
    </div><div id="dfBody"></div>`;
  byId('dfTabs').addEventListener('click', (e: MouseEvent) => { const b = (e.target as HTMLElement).closest('[data-tab]') as HTMLElement | null; if (!b) return; state.tabs.datafetching = b.dataset.tab; renderModuleBody('datafetching'); });
  const dfBody = byId('dfBody');
  if (tab === 'intel') {
    dfBody.innerHTML = `<div class="panel-head"><h3>Asset Intelligence <span class="chip warn" style="margin-left:8px">beta</span></h3><div class="panel-actions"><button class="btn btn-primary" id="fetchAssetBtn">Fetch asset data</button></div></div><div id="intelResults"></div>`;
    byId('fetchAssetBtn').addEventListener('click', () => {
      showToast('Scanning manufacturer sources…');
      setTimeout(() => {
        const rows = [
          { model: 'Gulfstream G900', stage: 'Certification testing', mfr: 'Gulfstream' },
          { model: 'Bombardier Global 8000', stage: 'Recently launched', mfr: 'Bombardier' },
          { model: 'Cirrus Vision Jet G3+', stage: 'In production', mfr: 'Cirrus' }
        ];
        byId('intelResults').innerHTML = `<div class="sheet-wrap">${renderTable([{ key: 'model', label: 'Model' }, { key: 'mfr', label: 'Manufacturer', muted: true }, { key: 'stage', label: 'Stage', muted: true }], rows, null)}</div>`;
        showToast('Asset intelligence updated.');
      }, 900);
    });
  }
  if (tab === 'news') {
    dfBody.innerHTML = `<div class="panel-head"><h3>Market News</h3><div class="panel-actions"><button class="btn btn-primary" id="addNewsBtn">+ Add news item</button></div></div><div class="sheet-wrap" id="newsWrap"></div>`;
    byId('newsWrap').innerHTML = renderTable<NewsItem>([{ key: 'heading', label: 'Heading' }, { key: 'body', label: 'Body', muted: true },
    { key: 'remove', label: '', render: (r) => `<button class="row-edit-btn" data-remove="${r.id}" title="Remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>` }], newsItems, null, 'No news items yet.');
    byId('newsWrap').addEventListener('click', (e: MouseEvent) => {
      const rm = (e.target as HTMLElement).closest('[data-remove]') as HTMLElement | null;
      if (!rm) return;
      newsItems = newsItems.filter((n) => n.id !== rm.dataset.remove);
      renderModuleBody('datafetching');
      showToast('News item removed.');
    });
    byId('addNewsBtn').addEventListener('click', () => {
      openModal(`
        <h3>Add news item</h3><div class="sub">Appears in the public Market Intelligence section.</div>
        <div class="field-row" style="margin-bottom:10px"><label>Heading</label><input class="field-input" id="newsHeading"></div>
        <div class="field-row" style="margin-bottom:10px"><label>Body text</label><textarea class="field-textarea" id="newsBody"></textarea></div>
        <div class="field-row" style="margin-bottom:10px"><label>Image URL</label><input class="field-input" id="newsImage"></div>
        <div class="field-row" style="margin-bottom:14px"><label>Link</label><input class="field-input" id="newsLink"></div>
        <button class="btn btn-primary" id="saveNewsBtn">Publish</button>`);
      byId('saveNewsBtn').addEventListener('click', () => {
        const heading = (byId('newsHeading') as HTMLInputElement).value.trim();
        if (!heading) { showToast('Heading is required.'); return; }
        newsItems.push({ id: 'n' + Date.now(), heading, body: (byId('newsBody') as HTMLTextAreaElement).value.trim(), image: (byId('newsImage') as HTMLInputElement).value.trim(), link: (byId('newsLink') as HTMLInputElement).value.trim() || '#' });
        closeOverlay(); renderModuleBody('datafetching'); showToast('News item published.');
      });
    });
  }
}

/* ============================================================
   MODULE: LISTINGS (Admin Verified Listings & Approvals Workflow)
============================================================ */
type AdminListingItem = ListingRecord | ApprovalRecord;

function renderThreeDotMenu(row: AdminListingItem): string {
  return `
    <div class="dot-menu-wrap" onclick="event.stopPropagation()">
      <button class="dot-menu-btn" data-dot-toggle="${row.id}" aria-label="Listing Actions">⋮</button>
      <div class="dot-menu-dropdown" id="dotDropdown_${row.id}">
        <button class="dot-menu-item" data-action="view" data-id="${row.id}">👁️ View Details</button>
        <button class="dot-menu-item" data-action="docs" data-id="${row.id}">📁 Review Docs (${row.docs ? row.docs.length : 25})</button>
        ${row.verificationStatus !== 'Verified' ? `<button class="dot-menu-item success" data-action="verify" data-id="${row.id}">✅ Declare Verified</button>` : ''}
        ${row.status !== 'Unpublished' ? `<button class="dot-menu-item danger" data-action="unpublish" data-id="${row.id}">🚫 Unpublish Listing</button>` : ''}
      </div>
    </div>`;
}

function renderFlagDot(r: ListingRecord): string {
  const colorMap: Record<string, string> = { blue: '#70b5f9', red: '#ff5c5c', pink: '#e88fc4', yellow: '#f2c46d', green: '#3dd598' };
  const hex = colorMap[r.flag || ''] || 'rgba(255,255,255,.2)';
  return `<span class="flag-swatch-dot" data-flag-item="${r.id}" style="width:10px;height:10px;border-radius:50%;background:${hex};display:inline-block" title="Flag color: ${r.flag || 'Default'}"></span>`;
}

function renderListingsHub(): void {
  const body = byId('moduleBody');
  if (!body) return;
  body.innerHTML = '';
}

function renderListingsModule(): void {
  try {
    const viewToggle: string = state.tabs.listingsToggle || 'verified';
    const body = byId('moduleBody');
    if (!body) return;

    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap">
        <div class="period-toggle" id="listingsToggleBar" style="background:rgba(255,255,255,.05);padding:4px;border-radius:12px;border:1px solid var(--line-2)">
          <button data-view="verified" class="${viewToggle === 'verified' ? 'active' : ''}" style="padding:9px 16px;font-size:12px">All Verified (${listings.filter(l => l.verificationStatus === 'Verified' && l.status !== 'Unpublished').length})</button>
          <button data-view="approvals" class="${viewToggle === 'approvals' ? 'active' : ''}" style="padding:9px 16px;font-size:12px">Approvals Queue (${approvals.length})</button>
          <button data-view="incomplete" class="${viewToggle === 'incomplete' ? 'active' : ''}" style="padding:9px 16px;font-size:12px">Incomplete (${incomplete.length})</button>
          <button data-view="analytics" class="${viewToggle === 'analytics' ? 'active' : ''}" style="padding:9px 16px;font-size:12px">Analytics</button>
        </div>
        ${viewToggle !== 'analytics' ? `
        <div class="search-bar" style="margin-bottom:0;max-width:340px">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input id="listSearch" placeholder="Search by ID, plane, lister..." value="${esc(state.search.listings || '')}">
        </div>` : ''}
      </div>
      <div id="listBody"></div>`;

    const toggleBar = byId('listingsToggleBar');
    if (toggleBar) {
      toggleBar.addEventListener('click', (e: MouseEvent) => {
        const btn = (e.target as HTMLElement).closest('button[data-view]') as HTMLElement | null;
        if (!btn) return;
        state.tabs.listingsToggle = btn.dataset.view;
        renderModuleBody(state.currentModule || 'verifications');
      });
    }

    const searchInput = byId<HTMLInputElement>('listSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.search.listings = (e.target as HTMLInputElement).value;
        renderModuleBody(state.currentModule || 'verifications');
      });
    }

    const lb = byId('listBody');
    if (!lb) return;
    const term = (state.search.listings || '').toLowerCase().trim();

    if (viewToggle === 'verified') {
      const rows = listings.filter((l) => l.verificationStatus === 'Verified' && l.status !== 'Unpublished' &&
        (!term || l.name.toLowerCase().includes(term) || l.owner.toLowerCase().includes(term) || l.id.toLowerCase().includes(term) || l.category.toLowerCase().includes(term)));

      const cols: TableColumn<ListingRecord>[] = [
        { key: 'flag', label: 'Flag', render: (r) => renderFlagDot(r) },
        { key: 'id', label: 'Listing ID', render: (r) => `<strong>${r.id}</strong>` },
        { key: 'name', label: 'Listing Title & Category', render: (r) => `<div><strong>${r.name}</strong><br><span style="font-size:11px;color:var(--muted-2)">${r.category}</span></div>` },
        { key: 'owner', label: 'Lister / Seller', render: (r) => `<div><strong>${r.owner}</strong><br><span style="font-size:11px;color:var(--muted-2)">${r.company || '—'}</span></div>` },
        { key: 'ask', label: 'Asking Price', render: (r) => `<strong>${r.ask}</strong>` },
        { key: 'verifiedDate', label: 'Verified Date', muted: true, render: (r) => r.verifiedDate || r.submissionDate },
        { key: 'docs', label: 'Documents', render: (r) => `<span class="chip">📁 ${r.docs ? r.docs.length : 25} Docs</span>` },
        { key: 'status', label: 'Status', render: () => `<span class="chip ok">✓ Verified</span>` },
        { key: 'featured', label: 'Featured', render: (r) => r.featuredStatus === 'Featured' ? `<span class="chip warn">★ Featured</span>` : `<span class="muted-cell">Standard</span>` },
        { key: 'actions', label: 'Actions', render: (r) => renderThreeDotMenu(r) }
      ];

      lb.innerHTML = `<div class="panel-head"><h3>All Verified Listings</h3><span class="meta">${rows.length} verified listings persisted in backend</span></div>
        <div id="verifiedWrap">${renderTable<ListingRecord>(cols, rows, null, 'No verified listings match your search.')}</div>`;
      bindListingRowActions(byId('verifiedWrap'), rows);
    } else if (viewToggle === 'approvals') {
      const rows = approvals.filter((a) => !term || a.name.toLowerCase().includes(term) || a.owner.toLowerCase().includes(term) || a.id.toLowerCase().includes(term));

      const cols: TableColumn<ApprovalRecord>[] = [
        { key: 'id', label: 'Listing ID', render: (r) => `<strong>${r.id}</strong>` },
        { key: 'name', label: 'Listing Title & Category', render: (r) => `<div><strong>${r.name}</strong><br><span style="font-size:11px;color:var(--muted-2)">${r.category}</span></div>` },
        { key: 'owner', label: 'Lister / Seller', render: (r) => `<div><strong>${r.owner}</strong><br><span style="font-size:11px;color:var(--muted-2)">${r.company || '—'}</span></div>` },
        { key: 'ask', label: 'Asking Price', render: (r) => `<strong>${r.ask}</strong>` },
        { key: 'submissionDate', label: 'Submitted Date', muted: true, render: (r) => r.submissionDate || r.submitted },
        { key: 'docs', label: 'Documents', render: (r) => `<span class="chip">📁 ${r.docs ? r.docs.length : 25} Docs</span>` },
        { key: 'status', label: 'Status', render: () => `<span class="chip warn">⏳ Pending Approval</span>` },
        { key: 'actions', label: 'Actions', render: (r) => renderThreeDotMenu(r) }
      ];

      lb.innerHTML = `<div class="panel-head"><h3>Approvals Queue</h3><span class="meta">${rows.length} pending verification</span></div>
        <div id="apprWrap">${renderTable<ApprovalRecord>(cols, rows, null, 'No pending approval requests.')}</div>`;
      bindListingRowActions(byId('apprWrap'), rows);
    } else if (viewToggle === 'incomplete') {
      const rows = incomplete.filter((i) => !term || i.name.toLowerCase().includes(term) || i.owner.toLowerCase().includes(term));
      const cols: TableColumn<IncompleteRecord>[] = [
        { key: 'id', label: 'Draft ID', render: (r) => `<strong>${r.id}</strong>` },
        { key: 'name', label: 'Draft Listing Name', render: (r) => `<strong>${r.name}</strong>` },
        { key: 'owner', label: 'Owner', render: (r) => `<strong>${r.owner}</strong>` },
        { key: 'contact', label: 'Contact Email', muted: true, render: (r) => r.contact },
        { key: 'stalled', label: 'Stalled Time', muted: true, render: (r) => r.stalled },
        { key: 'actions', label: 'Actions', render: (r) => `<button class="btn btn-ghost" data-contact-incomplete="${r.id}" style="padding:4px 10px;font-size:11px">Contact Owner</button>` }
      ];
      lb.innerHTML = `<div class="panel-head"><h3>Incomplete Listings</h3><span class="meta">${rows.length} stalled draft processes</span></div>
        <div id="incWrap">${renderTable<IncompleteRecord>(cols, rows, null, 'No incomplete draft listings.')}</div>`;
      byId('incWrap').querySelectorAll<HTMLElement>('[data-contact-incomplete]').forEach(b => {
        b.addEventListener('click', () => {
          const item = incomplete.find(x => x.id === b.dataset.contactIncomplete);
          if (item) showToast(`Email notification sent to ${item.contact} to complete draft.`);
        });
      });
    } else if (viewToggle === 'analytics') {
      lb.innerHTML = `
        <div class="panel-head"><h3>Listing Analytics</h3><span class="meta">Traffic, views, clicks, and performance metrics</span></div>
        <div class="grid-cards" style="margin-bottom:20px">
          <div class="mini-card"><div class="num">14,280</div><div class="lbl">Monthly listing views</div></div>
          <div class="mini-card"><div class="num">3,140</div><div class="lbl">Avg. clicks per listing</div></div>
          <div class="mini-card"><div class="num">4.8%</div><div class="lbl">Acquisition conversion rate</div></div>
          <div class="mini-card"><div class="num">1.2k</div><div class="lbl">Unique buyer inquiries</div></div>
        </div>
        <div class="modal-grid">
          <div class="modal-card">
            <h4>🏆 Top 3 Best-Performing Listings</h4>
            <div class="deep-link-row"><span>1. Gulfstream G700 (LST-9482)</span><strong style="color:var(--success)">2,410 views • 14 LOIs</strong></div>
            <div class="deep-link-row"><span>2. Falcon 10X (LST-9483)</span><strong style="color:var(--success)">1,890 views • 9 LOIs</strong></div>
            <div class="deep-link-row"><span>3. Lineage 1000E (LST-9485)</span><strong style="color:var(--success)">1,540 views • 7 LOIs</strong></div>
          </div>
          <div class="modal-card">
            <h4>📉 Last 3 Worst-Performing Listings</h4>
            <div class="deep-link-row"><span>1. Citation X+ (LST-9486)</span><strong style="color:var(--danger)">120 views • 0 LOIs</strong></div>
            <div class="deep-link-row"><span>2. Challenger 650 (LST-9488)</span><strong style="color:var(--danger)">140 views • 1 LOI</strong></div>
            <div class="deep-link-row"><span>3. Global 7500 (LST-9484)</span><strong style="color:var(--muted)">410 views • 2 LOIs</strong></div>
          </div>
        </div>`;
    }

    bindVerificationShiftArrows(viewToggle);
  } catch (err: any) {
    console.error('Error rendering listings module:', err);
    if (byId('moduleBody')) byId('moduleBody').innerHTML = `<div class="info-empty">Error loading module: ${err.message}</div>`;
  }
}

const verificationViews: Array<{ id: string; label: string }> = [
  { id: 'verified', label: 'All Verified' },
  { id: 'approvals', label: 'Approvals Queue' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'analytics', label: 'Analytics' }
];

function bindVerificationShiftArrows(viewToggle: string): void {
  document.querySelectorAll('.verif-shift-arrow').forEach((el) => el.remove());
  if (state.currentModule !== 'verifications') return;

  const idx = Math.max(0, verificationViews.findIndex((v) => v.id === viewToggle));
  const prev = verificationViews[(idx - 1 + verificationViews.length) % verificationViews.length];
  const next = verificationViews[(idx + 1) % verificationViews.length];

  const leftBtn = document.createElement('button');
  leftBtn.type = 'button';
  leftBtn.className = 'verif-shift-arrow left';
  leftBtn.setAttribute('aria-label', `Go to ${prev.label}`);
  leftBtn.title = prev.label;
  leftBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  leftBtn.addEventListener('click', () => {
    state.tabs.listingsToggle = prev.id;
    renderModuleBody('verifications');
  });

  const rightBtn = document.createElement('button');
  rightBtn.type = 'button';
  rightBtn.className = 'verif-shift-arrow right';
  rightBtn.setAttribute('aria-label', `Go to ${next.label}`);
  rightBtn.title = next.label;
  rightBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  rightBtn.addEventListener('click', () => {
    state.tabs.listingsToggle = next.id;
    renderModuleBody('verifications');
  });

  byId('modulePage').appendChild(leftBtn);
  byId('modulePage').appendChild(rightBtn);
}

function bindListingRowActions(wrapEl: HTMLElement, rows: AdminListingItem[]): void {
  if (!wrapEl) return;

  // Close any open dropdowns when clicking outside
  document.addEventListener('click', (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.dot-menu-wrap')) {
      document.querySelectorAll('.dot-menu-dropdown.show').forEach(d => d.classList.remove('show'));
    }
  }, { once: false });

  wrapEl.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const dotBtn = target.closest('[data-dot-toggle]') as HTMLElement | null;
    const actionBtn = target.closest('[data-action]') as HTMLElement | null;
    const tr = target.closest('tr[data-row-idx]') as HTMLElement | null;

    if (dotBtn) {
      e.stopPropagation();
      const id = dotBtn.dataset.dotToggle!;
      const targetDropdown = byId(`dotDropdown_${id}`);
      document.querySelectorAll('.dot-menu-dropdown.show').forEach(d => {
        if (d !== targetDropdown) d.classList.remove('show');
      });
      if (targetDropdown) targetDropdown.classList.toggle('show');
      return;
    }

    if (actionBtn) {
      e.stopPropagation();
      document.querySelectorAll('.dot-menu-dropdown.show').forEach(d => d.classList.remove('show'));
      const act = actionBtn.dataset.action;
      const id = actionBtn.dataset.id;
      const item: AdminListingItem | undefined = listings.find((l) => l.id === id) || approvals.find((a) => a.id === id);
      if (!item) return;

      if (act === 'view') openAdminListingModal(item, 'info');
      if (act === 'docs') openAdminListingModal(item, 'docs');
      if (act === 'verify') executeDeclareVerified(item);
      if (act === 'unpublish') executeUnpublishListing(item);
      return;
    }

    if (tr) {
      const item = rows[Number(tr.dataset.rowIdx)];
      if (item) openAdminListingModal(item, 'info');
    }
  });
}

async function executeDeclareVerified(item: AdminListingItem): Promise<void> {
  if (!confirm(`Are you sure you want to declare ${item.name} (${item.id}) as Verified? This will update and persist status to the backend.`)) return;

  // Optimistic update
  item.verificationStatus = 'Verified';
  item.status = 'Active';
  (item as ListingRecord).verified = true;
  (item as ListingRecord).verifiedDate = new Date().toISOString().split('T')[0];
  if (item.docs) {
    item.docs.forEach(d => { d.status = 'Verified'; d.verificationStatus = 'Verified'; });
  }

  const apprIdx = approvals.findIndex(a => a.id === item.id);
  if (apprIdx > -1) {
    approvals.splice(apprIdx, 1);
    if (!listings.find(l => l.id === item.id)) {
      listings.push(item as unknown as ListingRecord);
    }
  }

  try {
    await fetch('/api/listings/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: item.id })
    });
  } catch (e) {
    console.warn('Backend REST API sync notice:', e);
  }

  showToast(`✓ Listing ${item.id} successfully declared verified.`);
  renderStats();
  if (state.currentModule === 'verifications' || state.currentModule === 'listings') renderModuleBody(state.currentModule);
}

async function executeUnpublishListing(item: AdminListingItem): Promise<void> {
  if (!confirm(`Are you sure you want to unpublish ${item.name} (${item.id})? This will update and persist status in the backend.`)) return;

  item.status = 'Unpublished';
  item.verificationStatus = 'Unpublished';

  try {
    await fetch('/api/listings/unpublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: item.id })
    });
  } catch (e) {
    console.warn('Backend REST API sync notice:', e);
  }

  showToast(`Listing ${item.id} has been unpublished.`);
  renderStats();
  if (state.currentModule === 'verifications' || state.currentModule === 'listings') renderModuleBody(state.currentModule);
}

interface ListingGallery {
  exterior: string[];
  cabin: string[];
  blueprint: string[];
}

function getListingGallery(item: AdminListingItem): ListingGallery {
  const offset = parseInt(String(item.id).replace(/\D/g, ''), 10) % 4 || 0;
  const imgs = (start: number) => [0, 1, 2, 3].map((i) => jetImg((i + start) % 4));
  return {
    exterior: imgs(offset),
    cabin: imgs(offset + 1).slice(0, 3),
    blueprint: imgs(offset + 2).slice(0, 2)
  };
}

interface AssetSpecs {
  engine: string;
  range: string;
  pax: string;
  launch: string;
  lastProd: string;
  newPrice: string;
  usedPrice: string;
  avgPrice: string;
  variance: string;
}

function getListingAssetSpecs(item: AdminListingItem): AssetSpecs {
  const catalog: Record<string, AssetSpecs> = {
    'Gulfstream G700': { engine: 'Rolls-Royce Pearl 700', range: '7,500 NM', pax: '19 pax', launch: '2019', lastProd: 'In production', newPrice: '$78M – $95M', usedPrice: '$68M – $82M', avgPrice: '$77.0M', variance: '±4%' },
    'Falcon 10X': { engine: 'Rolls-Royce Pearl', range: '7,500 NM', pax: '16 pax', launch: '2021', lastProd: 'In production', newPrice: '$75M – $90M', usedPrice: '$62M – $78M', avgPrice: '$74.5M', variance: '±5%' },
    'Global 7500': { engine: 'GE Passport', range: '7,700 NM', pax: '19 pax', launch: '2018', lastProd: 'In production', newPrice: '$72M – $78M', usedPrice: '$58M – $68M', avgPrice: '$62.0M', variance: '±3%' },
    'Lineage 1000E': { engine: 'CFM International CFM56', range: '6,426 NM', pax: '25 pax', launch: '2015', lastProd: '2019', newPrice: 'No longer in production', usedPrice: '$60.1M – $74.7M', avgPrice: '$77.0M', variance: '±4%' },
    'Citation X+': { engine: 'Rolls-Royce AE 3007C2', range: '3,460 NM', pax: '12 pax', launch: '2012', lastProd: '2018', newPrice: 'No longer in production', usedPrice: '$18M – $26M', avgPrice: '$24.0M', variance: '±6%' },
    'Falcon 8X': { engine: 'Pratt & Whitney PW307D', range: '6,450 NM', pax: '14 pax', launch: '2016', lastProd: 'In production', newPrice: '$58M – $62M', usedPrice: '$42M – $54M', avgPrice: '$56.0M', variance: '±4%' },
    'Challenger 650': { engine: 'GE CF34-3B', range: '4,000 NM', pax: '12 pax', launch: '2015', lastProd: 'In production', newPrice: '$32M – $36M', usedPrice: '$14M – $18M', avgPrice: '$14.5M', variance: '±5%' }
  };
  const key = Object.keys(catalog).find((k) => item.name.includes(k)) || '';
  return catalog[key] || { engine: 'Rolls-Royce / Pratt & Whitney', range: '6,500 NM', pax: '16 pax', launch: '2018', lastProd: 'In production', newPrice: item.ask, usedPrice: item.ask, avgPrice: item.ask, variance: '±4%' };
}

interface AirworthinessSpecs {
  engine: string;
  range: string;
  pax: string;
  altitude: string;
}

function getAirworthinessSpecs(item: AdminListingItem): AirworthinessSpecs {
  const specs = getListingAssetSpecs(item);
  return {
    engine: specs.engine,
    range: specs.range,
    pax: specs.pax.replace(' pax', ' Passengers'),
    altitude: '51,000 FT'
  };
}

function initListingGallery(gallery: ListingGallery): void {
  const panel = byId('listingGalleryPanel');
  if (!panel) return;
  let mediaTab: keyof ListingGallery = 'exterior';
  let slideIdx = 0;

  function currentImages(): string[] {
    return gallery[mediaTab] || gallery.exterior;
  }

  function renderGallery(): void {
    const imgs = currentImages();
    if (!imgs.length) return;
    if (slideIdx >= imgs.length) slideIdx = 0;
    panel.innerHTML = `
      <div class="listing-gallery-tabs" id="listingGalleryTabs">
        <button class="listing-gallery-tab ${mediaTab === 'exterior' ? 'active' : ''}" data-media-tab="exterior">Exterior</button>
        <button class="listing-gallery-tab ${mediaTab === 'cabin' ? 'active' : ''}" data-media-tab="cabin">Cabin</button>
        <button class="listing-gallery-tab ${mediaTab === 'blueprint' ? 'active' : ''}" data-media-tab="blueprint">Blueprint</button>
      </div>
      <div class="listing-gallery-viewport">
        <img src="${imgs[slideIdx]}" alt="Aircraft ${mediaTab} view">
        ${imgs.length > 1 ? `
          <button class="listing-gallery-nav prev" data-gallery-prev aria-label="Previous image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button class="listing-gallery-nav next" data-gallery-next aria-label="Next image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div class="listing-gallery-dots">${imgs.map((_, i) => `<button class="listing-gallery-dot ${i === slideIdx ? 'active' : ''}" data-gallery-dot="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>
        ` : ''}
      </div>`;

    panel.querySelector('#listingGalleryTabs')?.addEventListener('click', (e: Event) => {
      const tab = (e.target as HTMLElement).closest('[data-media-tab]') as HTMLElement | null;
      if (!tab) return;
      mediaTab = tab.dataset.mediaTab as keyof ListingGallery;
      slideIdx = 0;
      renderGallery();
    });

    panel.querySelector('[data-gallery-prev]')?.addEventListener('click', () => {
      slideIdx = (slideIdx - 1 + imgs.length) % imgs.length;
      renderGallery();
    });
    panel.querySelector('[data-gallery-next]')?.addEventListener('click', () => {
      slideIdx = (slideIdx + 1) % imgs.length;
      renderGallery();
    });
    panel.querySelectorAll<HTMLElement>('[data-gallery-dot]').forEach((dot) => {
      dot.addEventListener('click', () => {
        slideIdx = Number(dot.dataset.galleryDot);
        renderGallery();
      });
    });
  }

  renderGallery();
}

function openAdminListingModal(item: AdminListingItem, initialTab: 'info' | 'lister' | 'docs' = 'info'): void {
  const docsList = item.docs || generateAdminDocs(item.id, item.verificationStatus === 'Verified');
  const gallery = getListingGallery(item);
  const assetSpecs = getListingAssetSpecs(item);
  const airSpecs = getAirworthinessSpecs(item);
  const verifyLabel = item.verificationStatus === 'Verified' ? '✓ Verified Listing' : item.verificationStatus === 'Unpublished' ? '🚫 Unpublished' : '⏳ Pending Verification';
  const verifyChipClass = item.verificationStatus === 'Verified' ? 'ok' : item.verificationStatus === 'Unpublished' ? 'danger' : 'warn';

  openModal(`
    <div class="listing-modal-shell">
      <div class="listing-modal-top">
        <div class="listing-modal-head">
          <div>
            <span class="chip ${verifyChipClass}">${verifyLabel}</span>
            <h3 class="listing-modal-title">${esc(item.name)} <span>(${esc(item.id)})</span></h3>
          </div>
          <div class="listing-modal-actions">
            ${item.verificationStatus !== 'Verified' ? `<button class="btn-verify" id="modalDeclareVerifiedBtn">Declare Verified</button>` : ''}
            ${item.status !== 'Unpublished' ? `<button class="btn-unpublish" id="modalUnpublishBtn">Unpublish Listing</button>` : ''}
          </div>
        </div>
        <div class="listing-modal-tabs" id="adminModalTabs">
          <button class="tab-btn ${initialTab === 'info' ? 'active' : ''}" data-tab="info">Listing Details</button>
          <button class="tab-btn ${initialTab === 'lister' ? 'active' : ''}" data-tab="lister">Lister / User Info</button>
          <button class="tab-btn ${initialTab === 'docs' ? 'active' : ''}" data-tab="docs">Documents (${docsList.length})</button>
        </div>
      </div>
      <div class="listing-modal-body" id="adminModalBody"></div>
    </div>
  `);

  const modalEl = byId('detailModal');
  modalEl.classList.add('modal-listing');

  function renderModalTab(tabName: string): void {
    const box = byId('adminModalBody');
    if (!box) return;

    if (tabName === 'info') {
      box.innerHTML = `
        <div class="listing-modal-split">
          <div class="listing-spec-panel">
            <div class="listing-spec-label">Asset Overview</div>
            <h4 class="listing-spec-title">${esc(item.name)}</h4>
            <div class="listing-spec-category">${esc(item.category)}</div>

            <div class="listing-spec-rows">
              <div class="listing-spec-row"><span>Engine</span><strong>${esc(assetSpecs.engine)}</strong></div>
              <div class="listing-spec-row"><span>Range</span><strong>${esc(assetSpecs.range)}</strong></div>
              <div class="listing-spec-row"><span>Passenger Capacity</span><strong>${esc(assetSpecs.pax)}</strong></div>
              <div class="listing-spec-row"><span>Launch Year</span><strong>${esc(assetSpecs.launch)}</strong></div>
              <div class="listing-spec-row"><span>Last Unit Production</span><strong>${esc(assetSpecs.lastProd)}</strong></div>
              <div class="listing-spec-row"><span>Brand New Price Range</span><strong>${esc(assetSpecs.newPrice)}</strong></div>
              <div class="listing-spec-row"><span>Used Price Range</span><strong>${esc(assetSpecs.usedPrice)}</strong></div>
              <div class="listing-spec-row"><span>Average Market Price</span><strong>${esc(assetSpecs.avgPrice)}</strong></div>
              <div class="listing-spec-row"><span>Variance</span><strong>${esc(assetSpecs.variance)}</strong></div>
            </div>

            <div class="listing-spec-label">Listing Overview</div>
            <div class="listing-overview-grid">
              <div class="item"><span>Listing ID</span><strong>${esc(item.id)}</strong></div>
              <div class="item"><span>Asset / Category</span><strong>${esc(item.category)}</strong></div>
              <div class="item"><span>Asking Price</span><strong>${esc(item.ask)}</strong></div>
              <div class="item"><span>Listing Status</span><strong>${esc(item.status)}</strong></div>
              <div class="item"><span>Verification Status</span><strong>${esc(item.verificationStatus)}</strong></div>
              <div class="item"><span>Featured Status</span><strong>${esc(item.featuredStatus || 'Standard')}</strong></div>
              <div class="item"><span>Submission Date</span><strong>${esc(item.submissionDate || 'N/A')}</strong></div>
              <div class="item"><span>Verification Date</span><strong>${esc((item as ListingRecord).verifiedDate || 'N/A')}</strong></div>
            </div>

            <div class="listing-spec-label">Airworthiness Specifications</div>
            <p class="listing-airworth-desc">Certified airworthiness documentation, engine overhaul logs, and pre-purchase inspection records filed under M1 Audit Vault.</p>
            <div class="listing-overview-grid">
              <div class="item"><span>Engine Type</span><strong>${esc(airSpecs.engine)}</strong></div>
              <div class="item"><span>Max Range</span><strong>${esc(airSpecs.range)}</strong></div>
              <div class="item"><span>Passenger Pax</span><strong>${esc(airSpecs.pax)}</strong></div>
              <div class="item"><span>Max Altitude</span><strong>${esc(airSpecs.altitude)}</strong></div>
            </div>
          </div>
          <div class="listing-gallery-panel" id="listingGalleryPanel"></div>
        </div>`;
      initListingGallery(gallery);
    } else if (tabName === 'lister') {
      box.innerHTML = `
        <div class="listing-tab-full">
          <div class="listing-spec-label">Lister / Account Owner Profile</div>
          <div class="listing-lister-grid">
            <div class="item"><span>User Name</span><strong>${esc(item.owner)}</strong></div>
            <div class="item"><span>User Email</span><strong>${esc(item.email || item.owner.toLowerCase().replace(/\s+/g, '') + '@marketplace.com')}</strong></div>
            <div class="item"><span>Contact Phone</span><strong>${esc(item.phone || '+1 305 892 4401')}</strong></div>
            <div class="item"><span>Company / Entity</span><strong>${esc(item.company || 'Private Aviation Group')}</strong></div>
            <div class="item"><span>Account Role</span><strong>Registered Aircraft Lister</strong></div>
            <div class="item"><span>Verification Status</span><strong>Verified Account</strong></div>
            <div class="item"><span>Active Portfolio</span><strong>${item.owner === 'Karim Al-Farsi' ? '6 Active Listings' : '3 Active Listings'}</strong></div>
            <div class="item"><span>Security Audit</span><strong>KYC Verified • Identity Cleared</strong></div>
          </div>
        </div>`;
    } else if (tabName === 'docs') {
      const docRows = docsList.map(d => `
        <tr data-doc-id="${d.id}">
          <td><strong>${esc(d.name)}</strong><br><span style="font-size:10.5px;color:var(--muted-2)">${esc(d.category)} • ${esc(d.fileSize)}</span></td>
          <td style="font-size:11.5px;color:var(--muted)">${esc(d.uploadDate)}</td>
          <td><span class="chip ${d.verificationStatus === 'Verified' ? 'ok' : 'warn'}">${d.verificationStatus === 'Verified' ? '✓ Verified' : 'Pending Audit'}</span></td>
          <td style="text-align:right">
            <button class="btn btn-ghost" data-view-doc="${d.id}" style="padding:4px 10px;font-size:11px">View</button>
            ${d.verificationStatus !== 'Verified' ? `<button class="btn btn-primary" data-verify-doc="${d.id}" style="padding:4px 10px;font-size:11px;margin-left:4px;background:var(--success);color:#000;border:none">Verify</button>` : ''}
          </td>
        </tr>
      `).join('');

      box.innerHTML = `
        <div class="listing-tab-full">
          <div class="sheet-wrap" style="max-height:420px;overflow-y:auto">
            <table class="sheet">
              <thead>
                <tr>
                  <th>Document Name & Category</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th style="text-align:right">Action</th>
                </tr>
              </thead>
              <tbody>${docRows}</tbody>
            </table>
          </div>
        </div>`;

      box.onclick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const viewBtn = target.closest('[data-view-doc]') as HTMLElement | null;
        const verBtn = target.closest('[data-verify-doc]') as HTMLElement | null;
        if (viewBtn) {
          const doc = docsList.find(d => d.id === viewBtn.dataset.viewDoc);
          if (doc) openDocumentPreviewModal(doc, item.name, item.id);
        }
        if (verBtn) {
          const doc = docsList.find(d => d.id === verBtn.dataset.verifyDoc);
          if (doc) executeVerifyDoc(item.id, doc, () => renderModalTab('docs'));
        }
      };
    }
  }

  renderModalTab(initialTab);

  byId('adminModalTabs')?.addEventListener('click', (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('.tab-btn') as HTMLElement | null;
    if (!btn) return;
    byId('adminModalTabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderModalTab(btn.dataset.tab!);
  });

  const modalDeclareBtn = byId('modalDeclareVerifiedBtn');
  const modalUnpublishBtn = byId('modalUnpublishBtn');

  if (modalDeclareBtn) {
    modalDeclareBtn.addEventListener('click', () => {
      closeOverlay();
      executeDeclareVerified(item);
    });
  }
  if (modalUnpublishBtn) {
    modalUnpublishBtn.addEventListener('click', () => {
      closeOverlay();
      executeUnpublishListing(item);
    });
  }
}

async function executeVerifyDoc(listingId: string, doc: ListingDoc, callback?: () => void): Promise<void> {
  doc.status = 'Verified';
  doc.verificationStatus = 'Verified';
  try {
    await fetch('/api/documents/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, docId: doc.id })
    });
  } catch (e) {
    console.warn('Doc verify REST notice:', e);
  }
  showToast(`Document ${doc.id} verified ✓`);
  if (callback) callback();
}

function openDocumentPreviewModal(doc: ListingDoc, assetName: string, listingId: string): void {
  openModal(`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:10px;gap:12px;flex-wrap:wrap">
      <div>
        <span class="chip ${doc.verificationStatus === 'Verified' ? 'ok' : 'warn'}">${doc.verificationStatus === 'Verified' ? '✓ Verified Document' : 'Pending Audit'}</span>
        <h3 style="margin-top:4px;font-size:20px">📄 ${esc(doc.name)}</h3>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">${esc(assetName)} • Category: ${esc(doc.category)} • Size: ${esc(doc.fileSize)}</div>
      </div>
      <div>
        ${doc.verificationStatus !== 'Verified' ? `<button class="btn btn-primary" id="previewVerifyDocBtn" style="background:var(--success);color:#000;border:none">Declare Document Verified</button>` : ''}
      </div>
    </div>
    <div style="background:#08090d;border:1px solid var(--line);border-radius:12px;padding:32px;text-align:center;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font-size:42px;margin-bottom:12px">📑</div>
      <h4 style="color:var(--gold);font-family:var(--display);font-size:22px">M1 CERTIFIED AVIATION AUDIT TRANSCRIPT</h4>
      <p style="font-size:12.5px;color:var(--muted);max-width:460px;margin:8px 0 18px;line-height:1.6">
        Authenticated via M1 Vault Protocol. Issuing Authority: ${esc(doc.issuingAuthority || 'FAA Flight Standards FSDO')}. Uploaded on ${esc(doc.uploadDate)}.
      </p>
      <div style="padding:10px 20px;background:rgba(255,255,255,.04);border:1px dashed var(--line-2);border-radius:8px;font-size:11.5px;color:#fff">
        Document ID: <code>${esc(doc.id)}</code> • Encryption Signature Verified
      </div>
    </div>
  `);

  const previewVerBtn = byId('previewVerifyDocBtn');
  if (previewVerBtn) {
    previewVerBtn.addEventListener('click', () => {
      executeVerifyDoc(listingId, doc, () => closeOverlay());
    });
  }
}

/* ============================================================
   MODULE: VERIFICATIONS / FEATURING (shared shell)
============================================================ */
function renderTabbedRequestsModule<T extends { id: string; name: string; owner: string; status: string }>(
  moduleId: string, title: string, dataset: T[], fields: TableColumn<T>[]
): void {
  const tab = state.tabs[moduleId] || 'requests';
  const body = byId('moduleBody');
  const groups = {
    requests: dataset.filter((d) => d.status.toLowerCase().includes('review') || d.status.toLowerCase().includes('request')),
    listed: dataset.filter((d) => !d.status.toLowerCase().includes('review') && !d.status.toLowerCase().includes('request'))
  };
  body.innerHTML = `<div class="tab-row" id="${moduleId}Tabs">
      <button class="tab-btn ${tab === 'requests' ? 'active' : ''}" data-tab="requests">Requests</button>
      <button class="tab-btn ${tab === 'listed' ? 'active' : ''}" data-tab="listed">${title}</button>
      <button class="tab-btn ${tab === 'analytics' ? 'active' : ''}" data-tab="analytics">Analytics</button>
    </div><div id="${moduleId}Body"></div>`;
  byId(`${moduleId}Tabs`).addEventListener('click', (e: MouseEvent) => { const b = (e.target as HTMLElement).closest('[data-tab]') as HTMLElement | null; if (!b) return; state.tabs[moduleId] = b.dataset.tab; renderModuleBody(moduleId); });
  const box = byId(`${moduleId}Body`);
  if (tab === 'analytics') {
    box.innerHTML = `<div class="grid-cards">
      <div class="mini-card"><div class="num">${dataset.length}</div><div class="lbl">Total records</div></div>
      <div class="mini-card"><div class="num">${groups.requests.length}</div><div class="lbl">Pending requests</div></div>
      <div class="mini-card"><div class="num">${groups.listed.length}</div><div class="lbl">${title}</div></div>
      <div class="mini-card"><div class="num">4.1 days</div><div class="lbl">Avg. review time</div></div>
    </div>`;
    return;
  }
  const rows = tab === 'requests' ? groups.requests : groups.listed;
  box.innerHTML = `<div class="panel-head"><h3>${tab === 'requests' ? 'Requests' : title}</h3><span class="meta">${rows.length} records</span></div><div class="sheet-wrap" id="${moduleId}Wrap"></div>`;
  byId(`${moduleId}Wrap`).innerHTML = renderTable<T>(fields, rows, null, 'Nothing here yet.');
  bindSheet(byId(`${moduleId}Wrap`), rows, (r) => openModal(`
    <h3>${esc(r.name)}</h3><div class="sub">Owner: ${esc(r.owner)}</div>
    <div class="modal-card"><h4>Details</h4><div class="detail-list">${Object.entries(r).filter(([k]) => k !== 'id').map(([k, v]) => `<div class="item"><span>${esc(k)}</span><strong>${esc(v as any)}</strong></div>`).join('')}</div></div>`));
}

function renderVerificationsModule(): void {
  renderListingsModule();
}

function renderFeaturingModule(): void {
  renderTabbedRequestsModule<FeaturingRecord>('featuring', 'Featured Listings', featuring,
    [{ key: 'name', label: 'Asset' }, { key: 'owner', label: 'Owner', muted: true }, { key: 'status', label: 'Status', render: (r) => `<span class="chip ${r.status === 'Featured' ? 'ok' : 'warn'}">${r.status}</span>` }, { key: 'plan', label: 'Plan', muted: true }]);
}

/* ============================================================
   MODULE: ACQUISITION / DEAL FLOW
============================================================ */
const dealStages = ['Coordinated Meeting', 'M1 Asset Verification', 'Letter of Intent', 'Escrow', 'M1 Inspection', 'Final Decision', 'Transfer of Assets'];

function renderAcquisitionModule(): void {
  const activeDealId: string | undefined = state.tabs.acquisitionDeal;
  const body = byId('moduleBody');
  if (!activeDealId) {
    body.innerHTML = `<div class="panel-head"><h3>Acquisition / Deal Flow</h3><span class="meta">${deals.length} active deals</span></div>
      <div class="sheet-wrap" id="dealsWrap"></div>`;
    byId('dealsWrap').innerHTML = renderTable<DealRecord>([{ key: 'asset', label: 'Asset' }, { key: 'buyer', label: 'Buyer', muted: true }, { key: 'seller', label: 'Seller', muted: true },
    { key: 'stage', label: 'Stage', render: (r) => `<span class="chip">${r.stage + 1}/7 · ${dealStages[r.stage]}</span>` }], deals, null);
    bindSheet(byId('dealsWrap'), deals, (d) => { state.tabs.acquisitionDeal = d.id; renderModuleBody('acquisition'); });
    return;
  }
  const deal = deals.find((d) => d.id === activeDealId)!;
  const activeStage: number = state.tabs['stage_' + deal.id] ?? deal.stage;
  body.innerHTML = `<button class="btn btn-ghost" id="backToDeals" style="margin-bottom:16px">← All Deals</button>
    <div class="panel-head"><h3>${esc(deal.asset)}</h3><span class="meta">Buyer: ${esc(deal.buyer)} · Seller: ${esc(deal.seller)}</span></div>
    <div class="pipeline" id="pipeline">${dealStages.map((s, i) => `
      <div class="pipe-step ${i < deal.stage ? 'done' : ''} ${i === activeStage ? 'active' : ''}" data-stage="${i}">
        <div class="pipe-dot">${i < deal.stage ? '✓' : i + 1}</div><span>${s}</span>
      </div>`).join('')}</div>
    <div id="stageBody"></div>`;
  byId('backToDeals').addEventListener('click', () => { state.tabs.acquisitionDeal = null; renderModuleBody('acquisition'); });
  byId('pipeline').addEventListener('click', (e: MouseEvent) => {
    const step = (e.target as HTMLElement).closest('[data-stage]') as HTMLElement | null; if (!step) return;
    state.tabs['stage_' + deal.id] = Number(step.dataset.stage);
    renderModuleBody('acquisition');
  });
  renderStageBody(deal, activeStage);
}

function renderStageBody(deal: DealRecord, stageIdx: number): void {
  const box = byId('stageBody');
  const actions = `<div class="stage-actions">
      <button class="btn btn-ghost" id="stageNextBtn">Next Step</button>
      <button class="btn btn-primary" id="stageUpdateBtn">Update</button>
      ${stageIdx === 5 ? '<button class="btn btn-danger" id="stageCancelBtn">Cancel Process</button>' : ''}
    </div>`;
  let html = '';
  if (stageIdx === 0) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Meeting time</label><input class="field-input" id="fMeetTime" value="${esc(deal.meeting.time)}"></div>
      <div class="field-row"><label>M1 agent name</label><input class="field-input" id="fMeetAgent" value="${esc(deal.meeting.agent)}"></div>
      <div class="field-row"><label>Notes</label><textarea class="field-textarea" id="fMeetNotes">${esc(deal.meeting.notes)}</textarea></div>
      ${actions}</div>`;
  } else if (stageIdx === 1) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Notes</label><textarea class="field-textarea" id="fVerNotes">${esc(deal.verification.notes)}</textarea></div>
      <div class="field-row"><label>Verification reports</label><input class="field-input" id="fVerFile" placeholder="Upload file (mock)"></div>
      ${actions}</div>`;
  } else if (stageIdx === 2) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Letter of Intent</label><input class="field-input" id="fLoi" value="${esc(deal.loi.file)}" placeholder="Upload / update LOI (mock)"></div>
      ${actions}</div>`;
  } else if (stageIdx === 3) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Receipt</label><input class="field-input" id="fEscrowReceipt" value="${esc(deal.escrow.receipt)}" placeholder="Upload receipt (mock)"></div>
      <div class="field-row"><label>Status description</label><input class="field-input" id="fEscrowStatus" value="${esc(deal.escrow.status)}"></div>
      <div class="field-row"><label>Amount</label><input class="field-input" id="fEscrowAmount" value="${esc(deal.escrow.amount)}"></div>
      <div class="field-row"><label>Ongoing request</label><textarea class="field-textarea" id="fEscrowRequest">${esc(deal.escrow.request)}</textarea></div>
      ${actions}</div>`;
  } else if (stageIdx === 4) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Inspection reports</label><input class="field-input" id="fInspReports" value="${esc(deal.inspection.reports)}" placeholder="Upload report (mock)"></div>
      <div class="field-row"><label>Inspection summary</label><textarea class="field-textarea" id="fInspSummary">${esc(deal.inspection.summary)}</textarea></div>
      ${actions}</div>`;
  } else if (stageIdx === 5) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Decision status</label>
        <select class="field-select" id="fDecision">
          ${['Sold', 'Processing', 'Issue', 'On Hold'].map((s) => `<option ${deal.decision.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></div>
      ${actions}</div>`;
  } else if (stageIdx === 6) {
    html = `<div class="stage-card">
      <div class="field-row"><label>Transfer status</label><input class="field-input" id="fTransfer" value="${esc(deal.transfer.status)}"></div>
      ${actions}</div>`;
  }
  box.innerHTML = html;
  const nextBtn = byId('stageNextBtn'), updateBtn = byId('stageUpdateBtn'), cancelBtn = byId('stageCancelBtn');
  function collect(): void {
    if (stageIdx === 0) { deal.meeting = { time: (byId('fMeetTime') as HTMLInputElement).value, agent: (byId('fMeetAgent') as HTMLInputElement).value, notes: (byId('fMeetNotes') as HTMLTextAreaElement).value }; }
    if (stageIdx === 1) { deal.verification.notes = (byId('fVerNotes') as HTMLTextAreaElement).value; const f = (byId('fVerFile') as HTMLInputElement).value; if (f) deal.verification.reports.push(f); }
    if (stageIdx === 2) { deal.loi.file = (byId('fLoi') as HTMLInputElement).value; }
    if (stageIdx === 3) { deal.escrow = { receipt: (byId('fEscrowReceipt') as HTMLInputElement).value, status: (byId('fEscrowStatus') as HTMLInputElement).value, amount: (byId('fEscrowAmount') as HTMLInputElement).value, request: (byId('fEscrowRequest') as HTMLTextAreaElement).value }; }
    if (stageIdx === 4) { deal.inspection = { reports: (byId('fInspReports') as HTMLInputElement).value, summary: (byId('fInspSummary') as HTMLTextAreaElement).value }; }
    if (stageIdx === 5) { deal.decision.status = (byId('fDecision') as HTMLSelectElement).value; }
    if (stageIdx === 6) { deal.transfer.status = (byId('fTransfer') as HTMLInputElement).value; }
  }
  nextBtn.addEventListener('click', () => {
    collect();
    state.tabs['stage_' + deal.id] = Math.min(6, stageIdx + 1);
    showToast('Progress saved for your view.');
    renderModuleBody('acquisition');
  });
  updateBtn.addEventListener('click', () => {
    collect();
    deal.stage = Math.max(deal.stage, stageIdx);
    showToast('Process updated for all parties.');
    renderModuleBody('acquisition');
  });
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const reason = prompt('Reason for cancelling this process:');
      if (reason) { showToast('Process cancelled: ' + reason); }
    });
  }
}

/* ============================================================
   MODULE: FINANCE
============================================================ */
function renderFinanceModule(): void {
  const view = state.tabs.financeView || 'overview';
  const body = byId('moduleBody');
  if (view === 'history') {
    body.innerHTML = `<button class="btn btn-ghost" id="finBackBtn" style="margin-bottom:16px">← Overview</button>
      <div class="panel-head"><h3>Transaction History</h3></div>
      <div class="sheet-wrap" id="txWrap"></div>`;
    byId('finBackBtn').addEventListener('click', () => { state.tabs.financeView = 'overview'; renderModuleBody('finance'); });
    const colorMap: Record<string, string> = { green: 'rgba(61,213,152,.14)', pink: 'rgba(232,143,196,.14)', silver: 'rgba(255,255,255,.08)', red: 'rgba(255,92,92,.16)' };
    const wrap = byId('txWrap');
    wrap.innerHTML = renderTable<TransactionRecord>([{ key: 'type', label: 'Type' }, { key: 'platform', label: 'Platform', muted: true }, { key: 'desc', label: 'Description', muted: true }, { key: 'amount', label: 'Amount' }, { key: 'date', label: 'Date', muted: true }], transactions, null);
    wrap.querySelectorAll('tbody tr').forEach((tr, i) => { (tr as HTMLElement).style.background = colorMap[transactions[i].color] || ''; });
    bindSheet(wrap, transactions, (t) => openModal(`<h3>${esc(t.type)}</h3><div class="sub">${esc(t.desc)}</div><div class="modal-card"><h4>Details</h4><div class="detail-list">
      <div class="item"><span>From</span><strong>${esc(t.from)}</strong></div><div class="item"><span>To</span><strong>${esc(t.to)}</strong></div>
      <div class="item"><span>Amount</span><strong>${esc(t.amount)}</strong></div><div class="item"><span>Date</span><strong>${esc(t.date)}</strong></div>
      <div class="item"><span>Platform</span><strong>${esc(t.platform)}</strong></div></div></div>`));
    return;
  }
  body.innerHTML = `
    <div class="panel-head"><h3>Finance</h3><div class="panel-actions"><button class="btn btn-ghost" id="finHistoryBtn">History</button><button class="btn btn-primary" id="finAddBtn">+ Add transaction</button></div></div>
    <div class="graph-card" style="margin-bottom:18px">
      <div class="graph-head"><h3>Revenue</h3><div class="period-toggle" id="finPeriodToggle">
        <button data-p="weekly">Weekly</button><button data-p="monthly" class="active">Monthly</button><button data-p="yearly">Yearly</button>
      </div></div>
      <svg class="graph-svg" id="finGraph" viewBox="0 0 640 190" preserveAspectRatio="none"></svg>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      <div class="mini-card"><div class="num">$284k</div><div class="lbl">Revenue (30d)</div></div>
      <div class="mini-card"><div class="num">$96k</div><div class="lbl">Expenses (30d)</div></div>
      <div class="mini-card"><div class="num">$41k</div><div class="lbl">Customer acquisition cost</div></div>
      <div class="mini-card"><div class="num">$188k</div><div class="lbl">Profit (30d)</div></div>
    </div>
    <div class="modal-card"><h4>Revenue split</h4>
      ${[['Platform fees', '38%'], ['Featuring fees', '24%'], ['Verification fees', '16%'], ['Monthly retainer', '14%'], ['Partner registration', '8%']].map(([k, v]) => `<div class="deep-link-row"><span>${k}</span><span style="color:var(--muted)">${v}</span></div>`).join('')}
    </div>`;
  function drawFinGraph(period: 'weekly' | 'monthly' | 'yearly'): void {
    const { values, labels } = graphData(period === 'weekly' ? 'weekly' : period === 'yearly' ? 'yearly' : 'monthly');
    const w = 640, h = 190, padL = 28, padB = 22, padT = 10, padR = 10;
    const max = Math.max(...values), min = Math.min(...values);
    const stepX = (w - padL - padR) / (values.length - 1);
    const pts: [number, number][] = values.map((v, i) => [padL + i * stepX, padT + (1 - ((v - min) / (max - min || 1))) * (h - padT - padB)]);
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    byId('finGraph').innerHTML = `<path d="${line}" fill="none" stroke="#fff" stroke-width="2"/>${pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#fff"/>`).join('')}`;
  }
  drawFinGraph('monthly');
  byId('finPeriodToggle').addEventListener('click', (e: MouseEvent) => {
    const b = (e.target as HTMLElement).closest('[data-p]') as HTMLElement | null; if (!b) return;
    document.querySelectorAll('#finPeriodToggle button').forEach((x) => x.classList.toggle('active', x === b));
    drawFinGraph(b.dataset.p as 'weekly' | 'monthly' | 'yearly');
  });
  byId('finHistoryBtn').addEventListener('click', () => { state.tabs.financeView = 'history'; renderModuleBody('finance'); });
  byId('finAddBtn').addEventListener('click', () => {
    openModal(`<h3>Add transaction</h3>
      <div class="field-row" style="margin-bottom:10px"><label>Type</label><input class="field-input" id="txType" placeholder="e.g. Featuring Fee"></div>
      <div class="field-row" style="margin-bottom:10px"><label>Platform</label><input class="field-input" id="txPlatform" placeholder="e.g. Stripe / Wire"></div>
      <div class="field-row" style="margin-bottom:10px"><label>Description</label><input class="field-input" id="txDesc"></div>
      <div class="field-row" style="margin-bottom:10px"><label>To</label><input class="field-input" id="txTo"></div>
      <div class="field-row" style="margin-bottom:10px"><label>From</label><input class="field-input" id="txFrom"></div>
      <div class="field-row" style="margin-bottom:10px"><label>Account number (other party)</label><input class="field-input" id="txAcct"></div>
      <div class="field-row" style="margin-bottom:14px"><label>Amount</label><input class="field-input" id="txAmount" placeholder="$0.00"></div>
      <button class="btn btn-primary" id="saveTxBtn">Save transaction</button>`);
    byId('saveTxBtn').addEventListener('click', () => {
      const type = (byId('txType') as HTMLInputElement).value.trim();
      if (!type) { showToast('Transaction type is required.'); return; }
      transactions.unshift({
        id: 't' + Date.now(), type,
        platform: (byId('txPlatform') as HTMLInputElement).value,
        desc: (byId('txDesc') as HTMLInputElement).value,
        to: (byId('txTo') as HTMLInputElement).value,
        from: (byId('txFrom') as HTMLInputElement).value,
        amount: (byId('txAmount') as HTMLInputElement).value || '$0.00',
        date: 'Today', color: 'silver'
      });
      closeOverlay(); showToast('Transaction recorded.'); state.tabs.financeView = 'history'; renderModuleBody('finance');
    });
  });
}

/* ============================================================
   MODULE: PROBLEMS REPORTED
============================================================ */
function renderProblemsModule(): void {
  const tab = state.tabs.problems || 'active';
  const body = byId('moduleBody');
  body.innerHTML = `<div class="tab-row" id="probTabs">
      <button class="tab-btn ${tab === 'active' ? 'active' : ''}" data-tab="active">Active</button>
      <button class="tab-btn ${tab === 'solved' ? 'active' : ''}" data-tab="solved">Solved</button>
      <button class="tab-btn ${tab === 'support' ? 'active' : ''}" data-tab="support">Support</button>
    </div><div id="probBody"></div>`;
  byId('probTabs').addEventListener('click', (e: MouseEvent) => { const b = (e.target as HTMLElement).closest('[data-tab]') as HTMLElement | null; if (!b) return; state.tabs.problems = b.dataset.tab; renderModuleBody('problems'); });
  const box = byId('probBody');
  if (tab === 'active') {
    box.innerHTML = `<div class="panel-head"><h3>Active reports</h3><span class="meta">${complaintsActive.length} open</span></div><div class="sheet-wrap" id="actProbWrap"></div>`;
    byId('actProbWrap').innerHTML = renderTable<ComplaintRecord>([{ key: 'subject', label: 'Subject' }, { key: 'reporter', label: 'Reporter', muted: true }, { key: 'opened', label: 'Opened', muted: true }], complaintsActive, null);
    bindSheet(byId('actProbWrap'), complaintsActive, openComplaintDetail);
  }
  if (tab === 'solved') {
    box.innerHTML = `<div class="panel-head"><h3>Solved reports</h3></div><div class="sheet-wrap" id="solvedWrap"></div>`;
    byId('solvedWrap').innerHTML = renderTable<ComplaintRecord>([{ key: 'subject', label: 'Subject' }, { key: 'reporter', label: 'Reporter', muted: true }, { key: 'opened', label: 'Opened', muted: true }], complaintsSolved, null);
    bindSheet(byId('solvedWrap'), complaintsSolved, openComplaintDetail);
  }
  if (tab === 'support') {
    box.innerHTML = `<div class="panel-head"><h3>Support log</h3><div class="panel-actions"><button class="btn btn-primary" id="newSupportBtn">+ New</button></div></div><div class="sheet-wrap" id="suppWrap"></div>`;
    byId('suppWrap').innerHTML = renderTable<SupportLogRecord>([{ key: 'name', label: 'Name' }, { key: 'contact', label: 'Contact', muted: true }, { key: 'date', label: 'Date', muted: true }, { key: 'help', label: 'How we helped', muted: true }], supportLog, null);
    byId('newSupportBtn').addEventListener('click', () => {
      openModal(`<h3>Log a support contact</h3>
        <div class="field-row" style="margin-bottom:10px"><label>Name</label><input class="field-input" id="spName"></div>
        <div class="field-row" style="margin-bottom:10px"><label>Contact</label><input class="field-input" id="spContact"></div>
        <div class="field-row" style="margin-bottom:14px"><label>How we helped</label><textarea class="field-textarea" id="spHelp"></textarea></div>
        <button class="btn btn-primary" id="saveSupportBtn">Save</button>`);
      byId('saveSupportBtn').addEventListener('click', () => {
        const name = (byId('spName') as HTMLInputElement).value.trim();
        if (!name) { showToast('Name is required.'); return; }
        supportLog.unshift({ id: 's' + Date.now(), name, contact: (byId('spContact') as HTMLInputElement).value, date: 'Today', help: (byId('spHelp') as HTMLTextAreaElement).value });
        closeOverlay(); renderModuleBody('problems'); showToast('Support contact logged.');
      });
    });
  }
}

function openComplaintDetail(c: ComplaintRecord): void {
  openModal(`<h3>${esc(c.subject)}</h3><div class="sub">Reported by ${esc(c.reporter)} · ${esc(c.email)} · ${esc(c.opened)}</div>
    <div class="field-row"><label>Resolution notes</label><textarea class="field-textarea" id="compNotes">${esc(c.notes)}</textarea></div>
    <button class="btn btn-primary" id="saveCompBtn" style="margin-top:12px">Save notes</button>`);
  byId('saveCompBtn').addEventListener('click', () => { c.notes = (byId('compNotes') as HTMLTextAreaElement).value; closeOverlay(); showToast('Notes saved.'); });
}

/* ============================================================
   MODULE: ADMIN MANAGEMENT (full-screen, master only)
============================================================ */
function openAdminManagementModule(): void {
  if (!authService.isMasterAdmin()) { adminRouter.renderForbidden(authService.getHomeRoute()); return; }
  state.currentModule = 'admin_management';
  state.masterPreview = null;
  byId('moduleTitle').textContent = 'Admin Management';
  byId('moduleSub').textContent = 'Manage administrators and preview role-scoped dashboards';
  byId('breadcrumb').innerHTML = `<span>Admin</span><span class="crumb-sep">/</span><span class="crumb-current">Admin Management</span>`;
  byId('modulePage').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderAdminManagementModule();
  renderSidebar();
}

function renderAdminManagementModule(): void {
  if (!authService.isMasterAdmin()) return;
  const body = byId('moduleBody');
  const roleCards = (Object.entries(ROLE_DASHBOARDS) as Array<[AdminRole, RoleDashboardConfig]>).map(([roleKey, cfg]) => {
    const sample = admins.find((a) => a.role === roleKey && a.status === 'ACTIVE');
    return `<div class="admin-role-card">
      <strong>${esc(ROLE_LABELS[roleKey])}</strong>
      <span>${esc(cfg.subtitle)}</span>
      <button class="btn btn-ghost" type="button" data-view-role="${roleKey}" data-view-name="${esc(sample?.name || ROLE_LABELS[roleKey])}">View Dashboard</button>
    </div>`;
  }).join('');
  body.innerHTML = `
    <div class="panel-head"><h3>Role Dashboards</h3><span class="meta">Preview any admin role workspace</span></div>
    <div class="admin-role-grid">${roleCards}</div>
    <div class="panel-head" style="margin-top:24px"><h3>Administrator Accounts</h3>
      <div class="panel-actions"><button class="btn btn-primary" id="addAdminBtn">+ Add New Admin</button></div></div>
    <div class="sheet-wrap" id="adminMgmtWrap"></div>`;
  byId('adminMgmtWrap').innerHTML = renderTable<AdminRecord>([
    { key: 'name', label: 'Name' }, { key: 'role', label: 'Role', muted: true, render: (r) => esc(ROLE_LABELS[r.role] || r.role) }, { key: 'email', label: 'Email', muted: true }, { key: 'status', label: 'Status', muted: true },
    {
      key: 'actions', label: 'Actions', render: (r) => `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <button class="admin-action-btn" data-view-dash="${r.id}">View</button>
      <button class="admin-action-btn" data-edit-admin="${r.id}">Edit</button>
      <button class="admin-action-btn" data-perm-admin="${r.id}">Perms</button>
      <button class="admin-action-btn" data-toggle-admin="${r.id}">Toggle</button>
      <button class="admin-action-btn" data-remove-admin="${r.id}">Delete</button></div>`
    }
  ], admins, null);
  bindAdminManagementActions(byId('adminMgmtWrap'));
  byId('addAdminBtn')?.addEventListener('click', () => openAddAdminModal());
  body.querySelectorAll<HTMLElement>('[data-view-role]').forEach((btn) => btn.addEventListener('click', () => {
    masterViewAdminDashboard({ role: btn.dataset.viewRole as AdminRole, name: btn.dataset.viewName! });
  }));
}

/* ============================================================
   MODULE: ADMIN PORTAL (master admin only)
============================================================ */
function renderAdminModule(): void {
  if (!authService.isMasterAdmin()) { adminRouter.renderForbidden(authService.getHomeRoute()); return; }
  openAdminManagementModule();
}

function renderAuditLogsModule(): void {
  if (!authService.isMasterAdmin()) { adminRouter.renderForbidden(authService.getHomeRoute()); return; }
  const body = byId('moduleBody');
  const logs = auditLogService.getLogs();
  body.innerHTML = `
    <div class="panel-head"><h3>Audit Logs</h3><span class="meta">${logs.length} security & activity events</span></div>
    <div class="sheet-wrap" id="auditLogsWrap"></div>`;
  byId('auditLogsWrap').innerHTML = renderTable<AuditLogEntry>([
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'admin', label: 'Admin', muted: true },
    { key: 'action', label: 'Action' },
    { key: 'target', label: 'Target / Module', muted: true },
    { key: 'result', label: 'Result', render: (r) => `<span class="chip ${r.result === 'Success' ? 'ok' : 'warn'}">${r.result}</span>` }
  ], logs, null);
}

function openAddAdminModal(): void {
  if (!authService.isMasterAdmin()) { showForbidden('403 Forbidden', 'Only Master Admin can create new admins.'); return; }
  const wizardState: {
    step: number;
    sessionToken: string | null;
    masterMaskedEmail: string;
    newAdminMaskedEmail: string;
    form: { name: string; email: string; role: AdminRole; status: AdminStatus };
    resendTimer: any;
    resendSeconds: number;
  } = {
    step: 1,
    sessionToken: null,
    masterMaskedEmail: '',
    newAdminMaskedEmail: '',
    form: { name: '', email: '', role: 'GENERAL_ADMIN', status: 'ACTIVE' },
    resendTimer: null,
    resendSeconds: 0
  };
  const roleOptions = (Object.entries(ROLE_LABELS) as Array<[AdminRole, string]>).filter(([key]) => key !== 'MASTER_ADMIN').map(([key, label]) => `<option value="${key}">${esc(label)}</option>`).join('');
  function renderPermPreview(role: AdminRole): string {
    const perms = ROLE_PERMISSIONS[role] || [];
    return perms.length ? perms.map((p) => `<span class="perm-tag">${esc(p)}</span>`).join('') : '<span class="perm-tag">No permissions assigned</span>';
  }
  function renderStepIndicator(step: number): string {
    const steps = [
      { n: 1, label: 'Admin Info' },
      { n: 2, label: 'Master Code' },
      { n: 3, label: 'Admin Code' }
    ];
    const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    return `<div class="wizard-steps" data-progress="${step}" id="wizardSteps">
      <div class="wizard-step-line"></div>
      ${steps.map((s) => {
      const cls = s.n < step ? 'done' : s.n === step ? 'active' : '';
      const inner = s.n < step ? checkSvg : esc(String(s.n));
      return `<div class="wizard-step ${cls}" data-step-ind="${s.n}">
          <div class="wizard-step-circle">${inner}</div>
          <span class="wizard-step-label">${esc(s.label)}</span>
        </div>`;
    }).join('')}
    </div>`;
  }
  function openWizardModal(html: string): void {
    openOverlay();
    const m = byId('detailModal');
    m.className = 'modal glass modal-wizard show';
    m.innerHTML = `<button class="modal-close" data-close-modal aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>${html}`;
  }
  function isValidEmail(v: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validateStep1(showErrors: boolean): boolean {
    const name = (byId<HTMLInputElement>('newAdminName')?.value.trim()) || wizardState.form.name;
    const email = (byId<HTMLInputElement>('newAdminEmail')?.value.trim()) || wizardState.form.email;
    const role = (byId<HTMLSelectElement>('newAdminRole')?.value as AdminRole) || wizardState.form.role;
    const status = (byId<HTMLSelectElement>('newAdminStatus')?.value as AdminStatus) || wizardState.form.status;
    wizardState.form = { name, email, role, status };
    let valid = true;
    const setErr = (id: string, msg: string, fieldValid: boolean) => {
      const row = byId(id)?.closest('.field-row');
      const err = byId(id + 'Err');
      if (!row) return;
      if (showErrors && !fieldValid) {
        row.classList.add('has-error', 'shake');
        setTimeout(() => row.classList.remove('shake'), 400);
        if (err) { err.textContent = msg; err.classList.add('show'); }
        valid = false;
      } else {
        row.classList.remove('has-error');
        if (err) err.classList.remove('show');
      }
      const input = byId<HTMLInputElement>(id);
      if (input) {
        input.classList.toggle('is-valid', fieldValid && !!input.value.trim());
        input.classList.toggle('is-invalid', showErrors && !fieldValid);
      }
    };
    setErr('newAdminName', name ? '' : 'Full name is required.', !!name);
    setErr('newAdminEmail', !email ? 'Email is required.' : !isValidEmail(email) ? 'Please enter a valid email address.' : '', !!email && isValidEmail(email));
    const roleRow = byId('newAdminRole')?.closest('.field-row');
    const statusRow = byId('newAdminStatus')?.closest('.field-row');
    if (roleRow) roleRow.querySelector('.field-select')?.classList.toggle('is-valid', !!role);
    if (statusRow) statusRow.querySelector('.field-select')?.classList.toggle('is-valid', !!status);
    return valid;
  }
  function updateStep1Button(): void {
    const btn = byId<HTMLButtonElement>('wizardStep1Next');
    if (!btn) return;
    const ok = validateStep1(false);
    btn.classList.toggle('is-valid', ok);
    btn.disabled = !ok;
  }
  function getOtpValue(groupId: string): string {
    const g = byId(groupId);
    if (!g) return '';
    return Array.from(g.querySelectorAll<HTMLInputElement>('.otp-input')).map((i) => i.value).join('');
  }
  function updateOtpButton(btnId: string, groupId: string): void {
    const btn = byId<HTMLButtonElement>(btnId);
    if (!btn) return;
    const code = getOtpValue(groupId);
    const ok = code.length === 6 && /^\d{6}$/.test(code);
    btn.classList.toggle('is-valid', ok);
    btn.disabled = !ok;
  }
  function bindOtpInputs(groupId: string, btnId: string, onComplete?: () => void): void {
    const g = byId(groupId);
    if (!g) return;
    const inputs = Array.from(g.querySelectorAll<HTMLInputElement>('.otp-input'));
    inputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const v = (e.target as HTMLInputElement).value.replace(/\D/g, '');
        (e.target as HTMLInputElement).value = v.slice(-1);
        if (v && idx < inputs.length - 1) inputs[idx + 1].focus();
        (e.target as HTMLInputElement).classList.toggle('filled', !!(e.target as HTMLInputElement).value);
        g.classList.remove('has-error');
        const err = byId(groupId + 'Err'); if (err) err.classList.remove('show');
        updateOtpButton(btnId, groupId);
        if (getOtpValue(groupId).length === 6 && onComplete) onComplete();
      });
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) { inputs[idx - 1].focus(); inputs[idx - 1].value = ''; inputs[idx - 1].classList.remove('filled'); }
        if (e.key === 'ArrowLeft' && idx > 0) inputs[idx - 1].focus();
        if (e.key === 'ArrowRight' && idx < inputs.length - 1) inputs[idx + 1].focus();
      });
      input.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();
        const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        pasted.split('').forEach((ch, i) => { if (inputs[i]) { inputs[i].value = ch; inputs[i].classList.add('filled'); } });
        const focusIdx = Math.min(pasted.length, inputs.length - 1);
        inputs[focusIdx].focus();
        updateOtpButton(btnId, groupId);
        if (pasted.length === 6 && onComplete) onComplete();
      });
      input.addEventListener('focus', () => input.select());
    });
  }
  function clearOtp(groupId: string): void {
    const g = byId(groupId);
    if (!g) return;
    g.querySelectorAll<HTMLInputElement>('.otp-input').forEach((i) => { i.value = ''; i.classList.remove('filled'); });
    g.classList.remove('has-error');
    const err = byId(groupId + 'Err'); if (err) err.classList.remove('show');
  }
  function showOtpError(groupId: string, msg: string): void {
    const g = byId(groupId);
    if (g) g.classList.add('has-error');
    const err = byId(groupId + 'Err');
    if (err) { err.textContent = msg; err.classList.add('show'); }
  }
  function startResendCountdown(btnId: string, seconds: number, resendFn: () => Promise<{ success: boolean; error?: string }>): void {
    clearInterval(wizardState.resendTimer);
    wizardState.resendSeconds = seconds;
    const btn = byId<HTMLButtonElement>(btnId);
    const tick = () => {
      if (!btn) return;
      if (wizardState.resendSeconds > 0) {
        btn.disabled = true;
        btn.innerHTML = `Resend code in ${wizardState.resendSeconds}s`;
        wizardState.resendSeconds--;
      } else {
        clearInterval(wizardState.resendTimer);
        btn.disabled = false;
        btn.innerHTML = 'Resend Code';
      }
    };
    tick();
    wizardState.resendTimer = setInterval(tick, 1000);
    btn!.onclick = async () => {
      if (wizardState.resendSeconds > 0) return;
      btn!.disabled = true;
      btn!.innerHTML = '<span class="resend-loading"><span class="resend-spinner"></span> Sending…</span>';
      const res = await resendFn();
      if (res.success) {
        startResendCountdown(btnId, 30, resendFn);
        showToast('Verification code resent.');
      } else {
        showToast(res.error || 'Could not resend code.');
        startResendCountdown(btnId, 30, resendFn);
      }
    };
  }
  function transitionTo(renderFn: () => string): void {
    const content = byId('wizardContent');
    const panel = content?.querySelector('.wizard-panel.active');
    if (panel) {
      panel.classList.remove('active');
      panel.classList.add('exiting');
      setTimeout(() => {
        content.innerHTML = renderFn();
        const newPanel = content.querySelector('.wizard-panel');
        if (newPanel) {
          newPanel.classList.add('entering');
          requestAnimationFrame(() => {
            newPanel.classList.remove('entering');
            newPanel.classList.add('active');
          });
        }
      }, 320);
    } else {
      content.innerHTML = renderFn();
      const newPanel = content.querySelector('.wizard-panel');
      if (newPanel) newPanel.classList.add('active');
    }
    const stepsEl = byId('wizardSteps');
    if (stepsEl) {
      stepsEl.outerHTML = renderStepIndicator(wizardState.step);
    }
  }
  function renderStep1Panel(): string {
    return `<div class="wizard-panel active">
      <div class="field-row" style="margin-bottom:12px"><label>Full Name</label>
        <input class="field-input" id="newAdminName" placeholder="John Smith" value="${esc(wizardState.form.name)}" autocomplete="name">
        <div class="field-error" id="newAdminNameErr"></div></div>
      <div class="field-row" style="margin-bottom:12px"><label>Email</label>
        <input class="field-input" id="newAdminEmail" type="email" placeholder="john@example.com" value="${esc(wizardState.form.email)}" autocomplete="email">
        <div class="field-error" id="newAdminEmailErr"></div></div>
      <div class="field-row" style="margin-bottom:12px"><label>Role</label>
        <select class="field-select" id="newAdminRole">${roleOptions.replace(`value="${wizardState.form.role}"`, `value="${wizardState.form.role}" selected`)}</select></div>
      <div class="field-row" style="margin-bottom:12px"><label>Status</label>
        <select class="field-select" id="newAdminStatus">
          <option value="ACTIVE" ${wizardState.form.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
          <option value="SUSPENDED" ${wizardState.form.status === 'SUSPENDED' ? 'selected' : ''}>Suspended</option>
          <option value="INACTIVE" ${wizardState.form.status === 'INACTIVE' ? 'selected' : ''}>Inactive</option>
        </select></div>
      <div class="field-row" style="margin-bottom:6px"><label>Permissions</label>
        <div class="perm-preview" id="permPreview">${renderPermPreview(wizardState.form.role)}</div></div>
      <div class="wizard-actions wizard-actions-end">
        <button type="button" class="wizard-btn-action" id="wizardStep1Next" disabled><span class="btn-label">Next →</span><span class="btn-spinner"></span></button>
      </div>
    </div>`;
  }
  function renderStep2Panel(): string {
    return `<div class="wizard-panel active">
      <div class="wizard-email-badge"><span>Master Admin Email</span> ${esc(wizardState.masterMaskedEmail)}</div>
      <div class="field-row" style="margin-bottom:4px"><label>Enter verification code</label></div>
      <div class="otp-group" id="masterOtpGroup">${Array(6).fill(0).map((_, i) => `<input class="otp-input" type="text" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" autocomplete="one-time-code">`).join('')}</div>
      <div class="otp-error" id="masterOtpGroupErr"></div>
      <div class="resend-row">Didn't receive the code? <button type="button" id="masterResendBtn" disabled>Resend code in 30s</button></div>
      <div class="wizard-actions">
        <button type="button" class="wizard-btn-back" id="wizardStep2Back">← Back</button>
        <button type="button" class="wizard-btn-action" id="wizardStep2Verify" disabled><span class="btn-label">Verify & Continue →</span><span class="btn-spinner"></span></button>
      </div>
    </div>`;
  }
  function renderStep3Panel(): string {
    return `<div class="wizard-panel active">
      <div class="wizard-email-badge"><span>New Admin Email</span> ${esc(wizardState.newAdminMaskedEmail)}</div>
      <div class="field-row" style="margin-bottom:4px"><label>Enter verification code</label></div>
      <div class="otp-group" id="newAdminOtpGroup">${Array(6).fill(0).map((_, i) => `<input class="otp-input" type="text" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" autocomplete="one-time-code">`).join('')}</div>
      <div class="otp-error" id="newAdminOtpGroupErr"></div>
      <div class="resend-row">Didn't receive the code? <button type="button" id="newAdminResendBtn" disabled>Resend code in 30s</button></div>
      <div class="wizard-actions">
        <button type="button" class="wizard-btn-back" id="wizardStep3Back">← Back</button>
        <button type="button" class="wizard-btn-action" id="wizardStep3Create" disabled><span class="btn-label">Create Admin</span><span class="btn-spinner"></span></button>
      </div>
    </div>`;
  }
  function renderSuccessPanel(admin: AdminRecord): string {
    return `<div class="wizard-panel active wizard-success">
      <div class="wizard-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
      <h4>Admin Created</h4>
      <div class="success-name">${esc(admin.name)}</div>
      <div class="success-role">${esc(ROLE_LABELS[admin.role] || admin.role)}</div>
      <div class="success-email">${esc(admin.email)}</div>
      <p class="success-msg">Administrator account has been successfully created.</p>
      <button type="button" class="wizard-btn-action is-valid" id="wizardDoneBtn"><span class="btn-label">Done</span></button>
    </div>`;
  }
  function bindStep1(): void {
    ['newAdminName', 'newAdminEmail'].forEach((id) => {
      byId(id)?.addEventListener('input', updateStep1Button);
      byId(id)?.addEventListener('blur', () => validateStep1(true));
    });
    byId('newAdminRole')?.addEventListener('change', (e) => {
      byId('permPreview').innerHTML = renderPermPreview((e.target as HTMLSelectElement).value as AdminRole);
      updateStep1Button();
    });
    byId('newAdminStatus')?.addEventListener('change', updateStep1Button);
    updateStep1Button();
    byId('wizardStep1Next')?.addEventListener('click', async () => {
      if (!validateStep1(true)) return;
      const btn = byId('wizardStep1Next');
      btn.classList.add('is-loading');
      const res = await adminVerificationService.sendMasterAdminCode();
      btn.classList.remove('is-loading');
      if (!res.success) { showToast(res.error || 'Could not send verification code.'); return; }
      wizardState.sessionToken = res.sessionToken!;
      wizardState.masterMaskedEmail = res.maskedEmail!;
      wizardState.step = 2;
      byId('wizardHeaderTitle').textContent = 'Master Admin Verification';
      byId('wizardHeaderSub').textContent = 'A verification code has been sent to the Master Admin\'s registered email.';
      transitionTo(renderStep2Panel);
      setTimeout(bindStep2, 340);
    });
  }
  function bindStep2(): void {
    bindOtpInputs('masterOtpGroup', 'wizardStep2Verify');
    updateOtpButton('wizardStep2Verify', 'masterOtpGroup');
    byId('masterOtpGroup')?.querySelector<HTMLInputElement>('.otp-input')?.focus();
    startResendCountdown('masterResendBtn', 30, () => adminVerificationService.resendMasterAdminCode(wizardState.sessionToken!));
    byId('wizardStep2Back')?.addEventListener('click', () => {
      clearInterval(wizardState.resendTimer);
      wizardState.step = 1;
      byId('wizardHeaderTitle').textContent = 'Add New Admin';
      byId('wizardHeaderSub').textContent = 'Enter the information for the new administrator.';
      transitionTo(renderStep1Panel);
      setTimeout(bindStep1, 340);
    });
    byId('wizardStep2Verify')?.addEventListener('click', async () => {
      const code = getOtpValue('masterOtpGroup');
      if (code.length !== 6) return;
      const btn = byId('wizardStep2Verify');
      btn.classList.add('is-loading');
      const verify = await adminVerificationService.verifyMasterAdminCode(wizardState.sessionToken!, code);
      if (!verify.verified) {
        btn.classList.remove('is-loading');
        showOtpError('masterOtpGroup', verify.error || 'Invalid verification code.');
        clearOtp('masterOtpGroup');
        byId('masterOtpGroup')?.querySelector<HTMLInputElement>('.otp-input')?.focus();
        updateOtpButton('wizardStep2Verify', 'masterOtpGroup');
        return;
      }
      const send = await adminVerificationService.sendNewAdminCode(wizardState.sessionToken!, wizardState.form.email);
      btn.classList.remove('is-loading');
      if (!send.success) { showToast(send.error || 'Could not send new admin code.'); return; }
      wizardState.newAdminMaskedEmail = send.maskedEmail!;
      wizardState.step = 3;
      byId('wizardHeaderTitle').textContent = 'Verify New Admin';
      byId('wizardHeaderSub').textContent = 'A verification code has been sent to the new administrator\'s email address.';
      transitionTo(renderStep3Panel);
      setTimeout(bindStep3, 340);
    });
  }
  function bindStep3(): void {
    bindOtpInputs('newAdminOtpGroup', 'wizardStep3Create');
    updateOtpButton('wizardStep3Create', 'newAdminOtpGroup');
    byId('newAdminOtpGroup')?.querySelector<HTMLInputElement>('.otp-input')?.focus();
    startResendCountdown('newAdminResendBtn', 30, () => adminVerificationService.resendNewAdminCode(wizardState.sessionToken!));
    byId('wizardStep3Back')?.addEventListener('click', () => {
      clearInterval(wizardState.resendTimer);
      wizardState.step = 2;
      byId('wizardHeaderTitle').textContent = 'Master Admin Verification';
      byId('wizardHeaderSub').textContent = 'A verification code has been sent to the Master Admin\'s registered email.';
      transitionTo(renderStep2Panel);
      setTimeout(bindStep2, 340);
    });
    byId('wizardStep3Create')?.addEventListener('click', async () => {
      const code = getOtpValue('newAdminOtpGroup');
      if (code.length !== 6) return;
      const btn = byId('wizardStep3Create');
      btn.classList.add('is-loading');
      btn.querySelector('.btn-label')!.textContent = 'Creating Admin…';
      const verify = await adminVerificationService.verifyNewAdminCode(wizardState.sessionToken!, code);
      if (!verify.verified) {
        btn.classList.remove('is-loading');
        btn.querySelector('.btn-label')!.textContent = 'Create Admin';
        showOtpError('newAdminOtpGroup', verify.error || 'Invalid verification code.');
        clearOtp('newAdminOtpGroup');
        byId('newAdminOtpGroup')?.querySelector<HTMLInputElement>('.otp-input')?.focus();
        updateOtpButton('wizardStep3Create', 'newAdminOtpGroup');
        return;
      }
      const perms = [...(ROLE_PERMISSIONS[wizardState.form.role] || [])];
      const result = await adminVerificationService.createAdmin(wizardState.sessionToken!, {
        name: wizardState.form.name,
        email: wizardState.form.email,
        role: wizardState.form.role,
        status: wizardState.form.status,
        permissions: perms
      });
      btn.classList.remove('is-loading');
      if (!result.success) { showToast(result.error || 'Could not create admin.'); btn.querySelector('.btn-label')!.textContent = 'Create Admin'; return; }
      clearInterval(wizardState.resendTimer);
      wizardState.step = 4;
      byId('wizardSteps')?.remove();
      byId('wizardHeaderTitle').textContent = 'Success';
      byId('wizardHeaderSub').textContent = '';
      transitionTo(() => renderSuccessPanel(result.admin!));
      setTimeout(() => {
        byId('wizardDoneBtn')?.addEventListener('click', () => {
          closeOverlay();
          adminRouter.navigate('/admin/admin-management');
          showToast(`${result.admin!.name} added.`);
        });
      }, 360);
    });
  }
  openWizardModal(`
    <div class="wizard-header">
      <h3 id="wizardHeaderTitle">Add New Admin</h3>
      <div class="sub" id="wizardHeaderSub">Create a new administrator securely.</div>
    </div>
    ${renderStepIndicator(1)}
    <div class="wizard-content" id="wizardContent">${renderStep1Panel()}</div>
  `);
  bindStep1();
  const modal = byId('detailModal') as HTMLElement & { _wizardCleanup?: (() => void) | null };
  const origClose = () => {
    clearInterval(wizardState.resendTimer);
    adminVerificationService.destroySession(wizardState.sessionToken);
  };
  modal.querySelector('[data-close-modal]')?.addEventListener('click', origClose, { once: false });
  modal._wizardCleanup = origClose;
}

/* ============================================================
   GLOBAL BINDINGS
============================================================ */
function showForbidden(title: string = '403 Forbidden', message: string = 'You do not have permission to access this module.'): void {
  openModal(`<h3>${esc(title)}</h3><div class="sub">${esc(message)}</div><button class="btn btn-ghost" data-close-modal>Close</button>`);
}

function bindGlobal(): void {
  byId('adminSidebar').addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const routeBtn = target.closest('[data-route]') as HTMLElement | null;
    if (routeBtn) { adminRouter.navigate(routeBtn.dataset.route!); return; }
    const b = target.closest('[data-module]') as HTMLElement | null; if (!b) return;
    openModule(b.dataset.module!);
  });
  byId('moduleBackBtn').addEventListener('click', closeModule);
  byId('overlay').addEventListener('click', closeOverlay);
  document.addEventListener('click', (e: MouseEvent) => { if ((e.target as HTMLElement).closest('[data-close-modal]')) closeOverlay(); });
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    if (byId('overlay').classList.contains('show')) { closeOverlay(); return; }
    if (byId('modulePage').classList.contains('open')) closeModule();
  });
  byId('notifBtn').addEventListener('click', () => showToast('You have ' + notifications.length + ' recent notifications.'));
  byId('profileBtn').addEventListener('click', () => showToast(`Admin profile — ${currentAdmin?.name || 'Unknown'}.`));
  document.querySelectorAll<HTMLElement>('[data-open-module]').forEach((a) => { a.addEventListener('click', (e: Event) => { e.preventDefault(); openModule(a.dataset.openModule!); }); });
}

/* ============================================================
   INIT
============================================================ */
async function syncBackendData(): Promise<void> {
  try {
    const [resListings, resApprovals] = await Promise.all([
      fetch('/api/listings').then(r => r.ok ? r.json() : null),
      fetch('/api/approvals').then(r => r.ok ? r.json() : null)
    ]);
    if (resListings && resListings.success && Array.isArray(resListings.data)) {
      listings.length = 0;
      listings.push(...resListings.data);
    }
    if (resApprovals && resApprovals.success && Array.isArray(resApprovals.data)) {
      approvals.length = 0;
      approvals.push(...resApprovals.data);
    }
    renderStats();
    renderSidebar();
    if (state.currentModule === 'verifications' || state.currentModule === 'listings') renderModuleBody(state.currentModule);
  } catch (e) {
    console.log('REST API initial sync notice:', e);
  }
}

function init(): void {
  currentAdmin = authService.loadCurrentAdmin();
  if (!currentAdmin) { openModal('<h3>No active admin session found.</h3><div class="sub">Please sign in through the authenticated admin session.</div>'); return; }
  if (byId('authName')) byId('authName').textContent = currentAdmin.name;
  if (byId('authRole')) byId('authRole').textContent = ROLE_LABELS[currentAdmin.role] || currentAdmin.role;

  auditLogService.log('Login', 'Admin Console', 'Success');
  bindDashboard();
  bindGlobal();
  adminRouter.bind();
  syncBackendData();
  const path = adminRouter.getPath();
  const home = authService.getHomeRoute();
  if (!path) { adminRouter.redirectToHome(); return; }
  if (!currentAdmin.isMaster && !authorizationService.canAccessRoute(path)) {
    adminRouter.navigate(home, true);
    return;
  }
  adminRouter.handleRoute(path);
}

init();