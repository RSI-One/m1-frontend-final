#!/usr/bin/env python3
"""SPA fallback server & REST API for M1 Admin Dashboard."""

import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SPA_ENTRY = '/m1-admin-dashboard.html'
DB_FILE = os.path.join(ROOT, 'db.json')


def default_collections():
    return {
        "users": [
            {"id": "u1", "name": "Karim Al-Farsi", "company": "Al-Farsi Holdings", "email": "karim@alfarsi.com", "phone": "+971 50 111 2233"},
            {"id": "u2", "name": "Elena Voss", "company": "Voss Capital", "email": "elena@vosscapital.com", "phone": "+41 79 222 3344"},
            {"id": "u3", "name": "Marcus Webb", "company": "Private", "email": "marcus.webb@gmail.com", "phone": "+1 305 333 4455"},
            {"id": "u4", "name": "Priya Chandran", "company": "Chandran Maritime", "email": "priya@chandranmaritime.com", "phone": "+65 8123 4567"},
            {"id": "u5", "name": "Tomasz Nowak", "company": "Nowak Aviation Group", "email": "tomasz@nowakaviation.com", "phone": "+48 601 222 111"}
        ],
        "partners": [
            {"id": "p1", "company": "Skyline Brokers", "location": "Geneva, CH", "founder": "Jonas Reiter", "email": "jonas@skylinebrokers.ch", "website": "skylinebrokers.ch", "phone": "+41 22 333 4455", "members": []},
            {"id": "p2", "company": "Azure Maritime Group", "location": "Monaco", "founder": "Camille Duval", "email": "camille@azuremaritime.mc", "website": "azuremaritime.mc", "phone": "+377 93 111 222", "members": []}
        ],
        "assets": [
            {"id": "a1", "manufacturer": "Gulfstream", "model": "G700", "type": "Long Range Jet", "passengers": 19},
            {"id": "a2", "manufacturer": "Dassault", "model": "Falcon 10X", "type": "Long Range Jet", "passengers": 16},
            {"id": "a3", "manufacturer": "Bombardier", "model": "Global 7500", "type": "Long Range Jet", "passengers": 19},
            {"id": "a4", "manufacturer": "Embraer", "model": "Phenom 300E", "type": "Light Jet", "passengers": 9}
        ],
        "inventory": [
            {"id": "i1", "owner": "Karim Al-Farsi", "asset": "Gulfstream G700", "since": "2023", "status": "In fleet"},
            {"id": "i2", "owner": "Priya Chandran", "asset": "Feadship Sabrewing", "since": "2022", "status": "In fleet"},
            {"id": "i3", "owner": "Diego Ferreira", "asset": "Benetti B.Now 50M", "since": "2021", "status": "Pending transfer"}
        ],
        "offMarket": [
            {"id": "om1", "name": "Falcon 8X — Private Reserve", "owner": "Layla Haddad", "ask": "$56M", "status": "Off-market"},
            {"id": "om2", "name": "Royal Huisman 60m Sloop", "owner": "Elena Voss", "ask": "$41M", "status": "Off-market"}
        ],
        "leads": [
            {"id": "l1", "name": "Samuel Kgosi", "model": "Gulfstream G700", "pax": 14, "phone": "+27 82 111 2233", "email": "samuel@kgosigroup.co.za", "bizEmail": "s.kgosi@kgosigroup.co.za", "location": "Johannesburg, ZA", "suggestions": ["Falcon 10X", "Global 7500"], "answers": ["Long range international travel", "12-16 seats", "Within 6 months", "$60-80M", "Owned, not chartered", "Yes, trade-in a G650", "New or pre-owned, either"]},
            {"id": "l2", "name": "Ines Rocha", "model": "Falcon 10X", "pax": 10, "phone": "+351 91 222 3344", "email": "ines@rochaholdings.pt", "bizEmail": "i.rocha@rochaholdings.pt", "location": "Lisbon, PT", "suggestions": ["G700", "Global 7500"], "answers": ["Family + staff travel", "8-12 seats", "3-6 months", "$50-75M", "Leasing considered", "No trade-in", "Pre-owned preferred"]}
        ],
        "m1wall": [{"id": "w1", "partner": "Skyline Brokers", "hours": 142}, {"id": "w2", "partner": "Azure Maritime Group", "hours": 88}],
        "featuring": [{"id": "f1", "name": "G700", "owner": "Karim Al-Farsi", "status": "Featured", "plan": "Bundle — $1500/mo"}, {"id": "f2", "name": "Citation X+", "owner": "Marcus Webb", "status": "Requested", "plan": "Basic — $300/mo"}],
        "deals": [
            {"id": "d1", "asset": "Gulfstream G700", "buyer": "Samuel Kgosi", "seller": "Karim Al-Farsi", "stage": 2, "meeting": {"time": "", "agent": "", "notes": ""}, "verification": {"notes": "", "reports": []}, "loi": {"file": ""}, "escrow": {"receipt": "", "status": "", "amount": "", "request": ""}, "inspection": {"reports": "", "summary": ""}, "decision": {"status": "Processing"}, "transfer": {"status": "Not started"}},
            {"id": "d2", "asset": "Falcon 10X", "buyer": "Ines Rocha", "seller": "Ines Rocha (rep.)", "stage": 5, "meeting": {"time": "Confirmed", "agent": "M. Duarte", "notes": "Buyer flew in for walkaround"}, "verification": {"notes": "Clean logbooks", "reports": ["verification-report.pdf"]}, "loi": {"file": "loi-signed.pdf"}, "escrow": {"receipt": "escrow-receipt.pdf", "status": "Funded", "amount": "$7,500,000 (deposit)", "request": ""}, "inspection": {"reports": "", "summary": ""}, "decision": {"status": "Processing"}, "transfer": {"status": "Pending"}}
        ],
        "transactions": [{"id": "t1", "type": "Featuring Fee", "platform": "Stripe", "desc": "G700 featured bundle", "amount": "$1,500.00", "date": "Aug 3, 2026"}],
        "newsItems": [{"id": "n1", "heading": "Gulfstream unveils G900 test milestones", "body": "Flight-test program update from Gulfstream.", "image": "", "link": "#"}],
        "problems": [
            {"id": "c1", "subject": "Listing photos not loading", "reporter": "Marcus Webb", "email": "marcus.webb@gmail.com", "opened": "Today", "category": "Technical", "priority": "High", "status": "Open", "assignee": "Tech Queue", "description": "Listing gallery returns empty images.", "notes": [], "createdAt": "2026-08-19T09:00:00Z", "updatedAt": "2026-08-19T09:00:00Z"},
            {"id": "c2", "subject": "Buyer unresponsive after LOI", "reporter": "Priya Chandran", "email": "priya@chandranmaritime.com", "opened": "Yesterday", "category": "Deal Flow", "priority": "Medium", "status": "In Progress", "assignee": "Customer Care", "description": "Buyer has not responded after the LOI was shared.", "notes": [], "createdAt": "2026-08-18T09:00:00Z", "updatedAt": "2026-08-18T09:00:00Z"}
        ],
        "solvedProblems": [{"id": "c3", "subject": "Payment not reflecting", "reporter": "Layla Haddad", "email": "layla@haddadoffice.com", "opened": "Aug 2", "category": "Finance", "priority": "High", "status": "Resolved", "assignee": "Finance", "description": "Payment webhook was delayed.", "notes": [{"text": "Resolved and reconciled manually.", "by": "Finance", "at": "2026-08-03T10:00:00Z"}], "createdAt": "2026-08-02T09:00:00Z", "updatedAt": "2026-08-03T10:00:00Z"}],
        "supportLog": [{"id": "s1", "name": "Tomasz Nowak", "contact": "+48 601 222 111", "date": "Aug 8, 2026", "help": "Walked through verification document upload flow."}]
    }


def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                changed = False
                for key, value in default_collections().items():
                    if key not in data:
                        data[key] = value
                        changed = True
                for deal in data.get('deals', []):
                    for key, value in {
                        "meeting": {"time": "", "agent": "", "notes": ""},
                        "verification": {"notes": "", "reports": []},
                        "loi": {"file": ""},
                        "escrow": {"receipt": "", "status": "", "amount": "", "request": ""},
                        "inspection": {"reports": "", "summary": ""},
                        "decision": {"status": "Processing"},
                        "transfer": {"status": "Not started"}
                    }.items():
                        if key not in deal:
                            deal[key] = value
                            changed = True
                if changed:
                    save_db(data)
                return data
        except Exception as e:
            print(f"Error reading {DB_FILE}: {e}")
    return seed_db()


def save_db(data):
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing to {DB_FILE}: {e}")


def generate_admin_docs(listing_id, is_verified):
    templates = [
        {"name": "FAA Form 8050-3 Registration Certificate", "category": "Ownership & Legal", "type": "pdf", "size": "2.4 MB"},
        {"name": "Standard Certificate of Airworthiness (Form 8130-7)", "category": "Ownership & Legal", "type": "pdf", "size": "1.8 MB"},
        {"name": "Lien Release & Title Clearance Guarantee", "category": "Ownership & Legal", "type": "pdf", "size": "3.1 MB"},
        {"name": "Owner Trust Agreement & Declaration", "category": "Ownership & Legal", "type": "pdf", "size": "4.0 MB"},
        {"name": "Exclusive Broker Listing Agreement", "category": "Ownership & Legal", "type": "pdf", "size": "1.5 MB"},
        {"name": "Master Weight & Balance Report", "category": "Specifications & History", "type": "pdf", "size": "2.9 MB"},
        {"name": "ICAO Noise Compliance Certificate", "category": "Specifications & History", "type": "pdf", "size": "1.1 MB"},
        {"name": "Avionics & Cabin Equipment Inventory", "category": "Specifications & History", "type": "pdf", "size": "1.7 MB"},
        {"name": "24-Month Maintenance Log Export (CAMP)", "category": "Maintenance & Airworthiness", "type": "pdf", "size": "12.4 MB"},
        {"name": "Airworthiness Directive Compliance Log", "category": "Maintenance & Airworthiness", "type": "pdf", "size": "3.6 MB"},
        {"name": "Service Bulletin Summary Sign-off", "category": "Maintenance & Airworthiness", "type": "pdf", "size": "4.2 MB"},
        {"name": "100-Hour / Annual Inspection Log (Part 145)", "category": "Maintenance & Airworthiness", "type": "pdf", "size": "2.8 MB"},
        {"name": "Engine Logbook #1 (Left Engine)", "category": "Engine & APU", "type": "pdf", "size": "15.2 MB"},
        {"name": "Engine Logbook #2 (Right Engine)", "category": "Engine & APU", "type": "pdf", "size": "14.8 MB"},
        {"name": "APU Maintenance & Overhaul Record", "category": "Engine & APU", "type": "pdf", "size": "4.7 MB"},
        {"name": "Engine Program Enrollment (CorporateCare)", "category": "Engine & APU", "type": "pdf", "size": "2.2 MB"},
        {"name": "RVSM Airworthiness Approval Certificate", "category": "Avionics & Systems", "type": "pdf", "size": "1.3 MB"},
        {"name": "ADS-B Out Outband Calibration Audit", "category": "Avionics & Systems", "type": "pdf", "size": "1.4 MB"},
        {"name": "Pre-Purchase Inspection Audit Report 2026", "category": "Inspection & Financial", "type": "pdf", "size": "18.6 MB"},
        {"name": "Aviation Hull & Liability Insurance Cert", "category": "Inspection & Financial", "type": "pdf", "size": "1.9 MB"},
        {"name": "Tax Clearance & VAT Statement", "category": "Inspection & Financial", "type": "pdf", "size": "2.0 MB"},
        {"name": "Flight Operations Log & Route History", "category": "Specifications & History", "type": "pdf", "size": "5.3 MB"},
        {"name": "Borescope Inspection Video & Report", "category": "Engine & APU", "type": "pdf", "size": "6.1 MB"},
        {"name": "Supplemental Type Cert (STC) Records", "category": "Maintenance & Airworthiness", "type": "pdf", "size": "3.0 MB"},
        {"name": "Deferred Maintenance & MEL Item Log", "category": "Maintenance & Airworthiness", "type": "pdf", "size": "0.9 MB"}
    ]
    docs = []
    for idx, t in enumerate(templates):
        doc_status = "Verified" if is_verified else ("Pending" if idx % 3 == 0 else "Verified")
        docs.append({
            "id": f"DOC-{listing_id}-{101 + idx}",
            "name": t["name"],
            "category": t["category"],
            "uploadDate": f"2026-07-{10 + (idx % 18):02d}",
            "fileType": t["type"],
            "fileSize": t["size"],
            "status": doc_status,
            "verificationStatus": doc_status,
            "issuingAuthority": "Civil Aviation Authority / FAA Flight Standards FSDO"
        })
    return docs


def seed_db():
    initial_db = {
        "listings": [
            {
                "id": "LST-9482",
                "name": "Gulfstream G700",
                "category": "Long Range Jet",
                "owner": "Karim Al-Farsi",
                "email": "karim@alfarsi.com",
                "phone": "+971 50 111 2233",
                "company": "Al-Farsi Holdings",
                "ask": "$78M",
                "status": "Active",
                "verificationStatus": "Verified",
                "featuredStatus": "Featured",
                "flag": None,
                "verified": True,
                "featured": True,
                "verifiedDate": "2026-04-15",
                "submissionDate": "2026-04-10",
                "docs": generate_admin_docs("LST-9482", True)
            },
            {
                "id": "LST-9483",
                "name": "Falcon 10X",
                "category": "Long Range Jet",
                "owner": "Ines Rocha",
                "email": "ines@rochaholdings.pt",
                "phone": "+351 91 222 3344",
                "company": "Rocha Aviation",
                "ask": "$75M",
                "status": "Active",
                "verificationStatus": "Verified",
                "featuredStatus": "Featured",
                "flag": "green",
                "verified": True,
                "featured": True,
                "verifiedDate": "2026-05-04",
                "submissionDate": "2026-04-28",
                "docs": generate_admin_docs("LST-9483", True)
            },
            {
                "id": "LST-9484",
                "name": "Global 7500",
                "category": "Long Range Jet",
                "owner": "Priya Chandran",
                "email": "priya@chandranmaritime.com",
                "phone": "+65 8123 4567",
                "company": "Chandran Maritime",
                "ask": "$62M",
                "status": "Active",
                "verificationStatus": "Verified",
                "featuredStatus": "Standard",
                "flag": None,
                "verified": True,
                "featured": False,
                "verifiedDate": "2026-03-18",
                "submissionDate": "2026-03-10",
                "docs": generate_admin_docs("LST-9484", True)
            },
            {
                "id": "LST-9485",
                "name": "Lineage 1000E",
                "category": "VIP Airliner",
                "owner": "Diego Ferreira",
                "email": "diego@ferreirayachts.com",
                "phone": "+55 21 98888 7766",
                "company": "Ferreira Jets",
                "ask": "$55M",
                "status": "Active",
                "verificationStatus": "Verified",
                "featuredStatus": "Featured",
                "flag": "yellow",
                "verified": True,
                "featured": True,
                "verifiedDate": "2026-06-12",
                "submissionDate": "2026-06-08",
                "docs": generate_admin_docs("LST-9485", True)
            },
            {
                "id": "LST-9486",
                "name": "Citation X+",
                "category": "Heavy Jet",
                "owner": "Marcus Webb",
                "email": "marcus.webb@gmail.com",
                "phone": "+1 305 333 4455",
                "company": "Webb Private Office",
                "ask": "$24M",
                "status": "Active",
                "verificationStatus": "Verified",
                "featuredStatus": "Standard",
                "flag": "red",
                "verified": True,
                "featured": False,
                "verifiedDate": "2026-02-22",
                "submissionDate": "2026-02-18",
                "docs": generate_admin_docs("LST-9486", True)
            }
        ],
        "approvals": [
            {
                "id": "LST-9487",
                "name": "Falcon 8X",
                "category": "Long Range Jet",
                "owner": "Aiko Tanaka",
                "email": "aiko.tanaka@outlook.com",
                "phone": "+81 90 4444 5566",
                "company": "Tanaka Enterprises",
                "ask": "$58M",
                "status": "Pending Approval",
                "verificationStatus": "Pending",
                "featuredStatus": "Featured",
                "submitted": "2 days ago",
                "submissionDate": "2026-08-16",
                "docs": generate_admin_docs("LST-9487", False)
            },
            {
                "id": "LST-9488",
                "name": "Challenger 650",
                "category": "Heavy Jet",
                "owner": "Tomasz Nowak",
                "email": "tomasz@nowakaviation.com",
                "phone": "+48 601 222 111",
                "company": "Nowak Aviation",
                "ask": "$14.5M",
                "status": "Pending Approval",
                "verificationStatus": "Pending",
                "featuredStatus": "Standard",
                "submitted": "6 hours ago",
                "submissionDate": "2026-08-18",
                "docs": generate_admin_docs("LST-9488", False)
            }
        ]
    }
    save_db(initial_db)
    return initial_db


class SPAHandler(SimpleHTTPRequestHandler):
    def _send_json(self, data, code=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def do_GET(self):
        url_path = self.path.split('?', 1)[0]
        if url_path.startswith('/api/'):
            db = load_db()
            if url_path == '/api/listings':
                verified = [l for l in db.get('listings', []) if l.get('verificationStatus') == 'Verified' and l.get('status') != 'Unpublished']
                return self._send_json({"success": True, "data": verified})
            elif url_path == '/api/approvals':
                return self._send_json({"success": True, "data": db.get('approvals', [])})
            elif url_path == '/api/dashboard/stats':
                verified_count = len([l for l in db.get('listings', []) if l.get('verificationStatus') == 'Verified' and l.get('status') != 'Unpublished'])
                approvals_count = len(db.get('approvals', []))
                return self._send_json({
                    "success": True,
                    "stats": {
                        "verifiedCount": verified_count,
                        "approvalsCount": approvals_count,
                        "totalListings": len(db.get('listings', [])) + len(db.get('approvals', []))
                    }
                })
            elif url_path == '/api/collections':
                return self._send_json({"success": True, "data": {key: db.get(key, []) for key in default_collections()}})
            elif url_path == '/api/problems':
                return self._send_json({"success": True, "data": {"active": db.get('problems', []), "solved": db.get('solvedProblems', []), "support": db.get('supportLog', [])}})
            else:
                return self._send_json({"error": "Endpoint not found"}, 404)

        if url_path == '/admin' or url_path.startswith('/admin/'):
            self.path = SPA_ENTRY
        elif url_path == '/':
            self.path = SPA_ENTRY
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        url_path = self.path.split('?', 1)[0]
        if url_path.startswith('/api/'):
            length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
            try:
                body = json.loads(raw_body)
            except Exception:
                body = {}

            db = load_db()

            if url_path == '/api/listings/verify':
                listing_id = body.get('listingId')
                item = None
                appr_idx = -1
                for idx, a in enumerate(db.get('approvals', [])):
                    if a.get('id') == listing_id:
                        appr_idx = idx
                        item = a
                        break

                if item and appr_idx > -1:
                    db['approvals'].pop(appr_idx)
                    item['verificationStatus'] = 'Verified'
                    item['status'] = 'Active'
                    item['verified'] = True
                    item['verifiedDate'] = '2026-08-19'
                    if item.get('docs'):
                        for doc in item['docs']:
                            doc['status'] = 'Verified'
                            doc['verificationStatus'] = 'Verified'
                    db['listings'].append(item)
                    save_db(db)
                    return self._send_json({"success": True, "message": f"Listing {listing_id} verified successfully", "item": item})
                
                for l in db.get('listings', []):
                    if l.get('id') == listing_id:
                        l['verificationStatus'] = 'Verified'
                        l['status'] = 'Active'
                        l['verified'] = True
                        l['verifiedDate'] = '2026-08-19'
                        if l.get('docs'):
                            for doc in l['docs']:
                                doc['status'] = 'Verified'
                                doc['verificationStatus'] = 'Verified'
                        save_db(db)
                        return self._send_json({"success": True, "message": f"Listing {listing_id} verified successfully", "item": l})

                return self._send_json({"error": "Listing not found"}, 404)

            elif url_path == '/api/listings/unpublish':
                listing_id = body.get('listingId')
                target = None
                for l in db.get('listings', []):
                    if l.get('id') == listing_id:
                        l['status'] = 'Unpublished'
                        l['verificationStatus'] = 'Unpublished'
                        target = l
                        break
                if not target:
                    for a in db.get('approvals', []):
                        if a.get('id') == listing_id:
                            a['status'] = 'Unpublished'
                            a['verificationStatus'] = 'Unpublished'
                            target = a
                            break

                if target:
                    save_db(db)
                    return self._send_json({"success": True, "message": f"Listing {listing_id} unpublished", "item": target})
                return self._send_json({"error": "Listing not found"}, 404)

            elif url_path == '/api/documents/verify':
                listing_id = body.get('listingId')
                doc_id = body.get('docId')
                all_items = db.get('listings', []) + db.get('approvals', [])
                for item in all_items:
                    if item.get('id') == listing_id:
                        for doc in item.get('docs', []):
                            if doc.get('id') == doc_id:
                                doc['status'] = 'Verified'
                                doc['verificationStatus'] = 'Verified'
                                save_db(db)
                                return self._send_json({"success": True, "message": f"Document {doc_id} verified", "doc": doc})
                return self._send_json({"error": "Document not found"}, 404)

            elif url_path == '/api/problems':
                now = __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat()
                report = {
                    "id": body.get('id') or f"c{int(__import__('time').time() * 1000)}",
                    "subject": str(body.get('subject', '')).strip(),
                    "reporter": str(body.get('reporter', '')).strip() or 'Unknown reporter',
                    "email": str(body.get('email', '')).strip(),
                    "opened": body.get('opened') or 'Today',
                    "category": body.get('category') or 'Other',
                    "priority": body.get('priority') or 'Medium',
                    "status": body.get('status') or 'Open',
                    "assignee": body.get('assignee') or 'Unassigned',
                    "description": str(body.get('description', '')).strip(),
                    "notes": body.get('notes') if isinstance(body.get('notes'), list) else [],
                    "createdAt": body.get('createdAt') or now,
                    "updatedAt": now
                }
                if not report['subject']:
                    return self._send_json({"error": "Subject is required"}, 400)
                db.setdefault('problems', []).insert(0, report)
                save_db(db)
                return self._send_json({"success": True, "data": report}, 201)

            elif url_path == '/api/problems/update':
                report_id = body.get('id')
                collections = [('problems', db.setdefault('problems', [])), ('solvedProblems', db.setdefault('solvedProblems', []))]
                target = None
                source_key = None
                for key, items in collections:
                    target = next((item for item in items if item.get('id') == report_id), None)
                    if target:
                        source_key = key
                        break
                if not target:
                    return self._send_json({"error": "Problem report not found"}, 404)
                for field in ('subject', 'category', 'priority', 'status', 'assignee', 'description', 'email', 'reporter'):
                    if field in body:
                        target[field] = body[field]
                if body.get('note'):
                    target.setdefault('notes', []).append({"text": str(body['note']).strip(), "by": body.get('updatedBy') or 'Admin', "at": __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat()})
                target['updatedAt'] = __import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat()
                if target.get('status') in ('Resolved', 'Closed') and source_key == 'problems':
                    db['problems'].remove(target)
                    db.setdefault('solvedProblems', []).insert(0, target)
                elif target.get('status') not in ('Resolved', 'Closed') and source_key == 'solvedProblems':
                    db['solvedProblems'].remove(target)
                    db.setdefault('problems', []).insert(0, target)
                save_db(db)
                return self._send_json({"success": True, "data": target})

            elif url_path == '/api/problems/support':
                entry = {
                    "id": body.get('id') or f"s{int(__import__('time').time() * 1000)}",
                    "name": str(body.get('name', '')).strip(),
                    "contact": str(body.get('contact', '')).strip(),
                    "date": body.get('date') or 'Today',
                    "help": str(body.get('help', '')).strip()
                }
                if not entry['name']:
                    return self._send_json({"error": "Name is required"}, 400)
                db.setdefault('supportLog', []).insert(0, entry)
                save_db(db)
                return self._send_json({"success": True, "data": entry}, 201)

            else:
                return self._send_json({"error": "Endpoint not found"}, 404)

        return self._send_json({"error": "Method not allowed"}, 405)


if __name__ == '__main__':
    os.chdir(ROOT)
    port = int(os.environ.get('PORT', '8080'))
    server = HTTPServer(('127.0.0.1', port), SPAHandler)
    print(f'M1 Admin Dashboard: http://127.0.0.1:{port}/admin/dashboard?admin=ad1')
    print('Role pages: ad1=Master /admin/dashboard | ad5=General /admin/general | ad6=Customer Care /admin/customer-care')
    print('              ad3=BD /admin/bd | ad2=Executive /admin/executive | ad4=Tech /admin/tech')
    server.serve_forever()

