#!/usr/bin/env python3
"""SPA fallback server & REST API for M1 Admin Dashboard."""

import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SPA_ENTRY = '/m1-admin-dashboard.html'
DB_FILE = os.path.join(ROOT, 'db.json')


def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
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

