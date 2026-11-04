"""
Seed dataset generator for CareData AI - Sydney GP Research Pilot (150 records).
Generates realistic provider records with realistic Sydney clinics, suburbs, phone formats,
intentional formatting issues (for cleaning), potential duplicates, and varied specialty descriptions.
Also exports physical CSV and XLSX files for upload testing.
"""

import os
import csv
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

SAMPLE_PROVIDERS = [
    # Clean standard records
    ("Dr. Liam Campbell", "General Practice / Family Medicine", "Surry Hills Medical Centre", "573 Crown St, Surry Hills", "NSW", "2010", "(02) 9319 1234", "https://surryhillsmedical.com.au"),
    ("Dr. Sarah Chen", "General Practice - Women's Health & Antenatal Care", "Bondi Health Collective", "142 Bondi Rd, Bondi", "NSW", "2026", "(02) 9130 5522", "https://bondihealth.com.au"),
    ("Dr. Marcus Vance", "GP - Skin Cancer Medicine & Minor Surgery", "Chatswood Healthcare Centre", "430 Victoria Ave, Chatswood", "NSW", "2067", "(02) 9411 8899", "https://chatswoodhealth.com.au"),
    ("Dr. Emily Zhao", "General Practitioner - Paediatrics & Child Health", "Newtown Family Practice", "288 King St, Newtown", "NSW", "2042", "(02) 9557 3344", "https://newtownfamilypractice.com.au"),
    ("Dr. Oliver Wright", "General Practice - Chronic Disease Management & Diabetes", "Parramatta Medical Hub", "12 Phillip St, Parramatta", "NSW", "2150", "(02) 9635 7711", "https://parramattamedical.com.au"),
    ("Dr. Priya Patel", "Family Medicine & Preventive Healthcare", "Strathfield Plaza Doctors", "11 The Boulevarde, Strathfield", "NSW", "2135", "(02) 9746 2200", "https://strathfielddoctors.com.au"),
    ("Dr. James MacLeod", "General Practitioner - Sports Medicine & Musculoskeletal", "Manly Coastal Clinic", "22 Darley Rd, Manly", "NSW", "2095", "(02) 9977 4433", "https://manlycoastalclinic.com.au"),
    ("Dr. Jessica Taylor", "GP & Mental Health Care Plans", "Randwick Medical Services", "124 Belmore Rd, Randwick", "NSW", "2031", "(02) 9399 6677", "https://randwickmedical.com.au"),
    ("Dr. David Nguyen", "General Practitioner - Occupational Medicine & Corporate", "North Sydney Doctors", "100 Miller St, North Sydney", "NSW", "2060", "(02) 9955 1122", "https://northsydneydoctors.com.au"),
    ("Dr. Fiona Gallagher", "Family Practice & Geriatric Care", "Liverpool Community Health Clinic", "180 George St, Liverpool", "NSW", "2170", "(02) 8738 5000", "https://liverpoolhealth.nsw.gov.au"),
    
    # Intended duplicate candidates (Same clinic phone / similar name)
    ("Dr Anthony Taylor", "General practice / Family health", "Randwick Medical Services", "124 Belmore Rd, Randwick", "NSW", "2031", "(02) 9399 6677", "https://randwickmedical.com.au"),
    ("Dr. A. Taylor", "GP", "Randwick Medical Services", "124 Belmore Rd, Randwick", "NSW", "2031", "(02) 9399 6677", ""),
    ("Dr. Jennifer Wang", "General Practitioner", "Chatswood Healthcare Centre", "430 Victoria Ave, Chatswood", "NSW", "2067", "(02) 9411 8899", "https://chatswoodhealth.com.au"),
    ("Dr Jenny Wang", "Family doctor", "Chatswood Healthcare Centre", "430 Victoria Ave, Chatswood", "NSW", "2067", "02 9411 8899", "http://chatswoodhealth.com.au"),
    ("Dr Michael O'Connor", "General Practice", "Surry Hills Medical Centre", "573 Crown St, Surry Hills", "NSW", "2010", "(02) 9319 1234", "https://surryhillsmedical.com.au"),
    ("Dr. M. O'Connor", "GP - Family Medicine", "Surry Hills Medical Centre", "573 Crown St, Surry Hills", "NSW", "2010", "(02) 9319 1234", ""),
    
    # Formatting cleaning cases (irregular spaces, unformatted phone, lowercased doctor name)
    ("dr. benjamin cross  ", "gp & skin checks", "  Bondi Junction Medical  ", "Level 2, 500 Oxford St, Bondi Junction", "NSW", "2022", "0293892211", "bondijunctionmed.com.au"),
    ("DR HELENA ROSTOVA", "General Practice / Antenatal Shared Care", "Marrickville Family Health", "312 Marrickville Rd, Marrickville", "NSW", "2044", "+61 2 9568 1144", "https://marrickvillefh.com.au"),
    ("Dr.   Samuel   Kim", "GP - Chronic Disease & Geriatrics", "Burwood Central Doctors", "45 Railway Pde, Burwood", "NSW", "2134", "0412 889 900", ""),
    ("A/Prof Robert Sterling", "General Practice & Academic Medicine", "Camperdown Health Hub", "Missenden Rd, Camperdown", "NSW", "2050", "(02) 9515 6111", "https://camperdownhub.com.au"),
    
    # Missing information cases (missing website, missing phone)
    ("Dr. Charlotte Evans", "General Practice", "Cronulla Seaside Clinic", "66 Cronulla St, Cronulla", "NSW", "2230", "", "https://cronullaseaside.com.au"),
    ("Dr. Tariq Al-Mansoor", "Family Medicine & Travel Vaccinations", "Parramatta Western Medical", "80 George St, Parramatta", "NSW", "2150", "(02) 9891 3344", ""),
    ("Dr. Hannah Goldberg", "General Practice / Adolescent Health", "Rose Bay Medical Practice", "509 Old South Head Rd, Rose Bay", "NSW", "2029", "(02) 9371 4455", ""),
    ("Dr. William Thorne", "Skin Cancer & General Medicine", "Hornsby Family Doctors", "12 Florence St, Hornsby", "NSW", "2077", "(02) 9477 2211", "https://hornsbydoctors.com.au"),

    # ── GLOBAL MULTI-JURISDICTION RECORDS (USA, INDIA, NEPAL, RUSSIA/INTERNATIONAL) ──
    # India (NMC / ABDM registry compliant)
    ("Dr. Rajesh Sharma", "Cardiology & General Medicine", "Apollo Health City", "Jubilee Hills, Hyderabad", "Telangana", "500033", "+91 98490 12345", "https://apollohospitals.com"),
    ("Dr. Sunita Rao", "Paediatrics & Child Health", "Max Super Speciality Hospital", "Saket, New Delhi", "Delhi", "110017", "+91 98111 67890", "https://maxhealthcare.in"),
    ("Dr. Amitav Banerjee", "Chronic Disease Management & Diabetes", "Fortis Memorial Research Institute", "Sector 44, Gurugram", "Haryana", "122002", "+91 124 4962200", "https://fortishealthcare.com"),

    # United States (CMS / NPI taxonomy compliant)
    ("Dr. Michael J. Miller", "General Practice / Family Medicine", "Mayo Clinic Care Center", "200 First St SW, Rochester", "MN", "55905", "+1 (507) 284-2511", "https://mayoclinic.org"),
    ("Dr. Jennifer Brooks", "Dermatology & Skin Cancer", "Johns Hopkins Medicine", "1800 Orleans St, Baltimore", "MD", "21287", "+1 (410) 955-5000", "https://hopkinsmedicine.org"),
    ("Dr. Robert Sterling", "Cardiovascular Medicine", "Cleveland Clinic Main Campus", "9500 Euclid Ave, Cleveland", "OH", "44195", "+1 (216) 444-2200", "https://clevelandclinic.org"),

    # Nepal (NMC / MoHP compliant)
    ("Dr. Bikram Thapa", "General Practice & Community Medicine", "Tribhuvan University Teaching Hospital", "Maharajgunj, Kathmandu", "Bagmati", "44600", "+977 1 4412404", "https://tuth.org.np"),
    ("Dr. Puja Adhikari", "Women's Health & Antenatal Care", "Patan Hospital", "Lagankhel, Lalitpur", "Bagmati", "44700", "+977 1 5522295", "https://patanhospital.org.np"),

    # International / Russia (WHO ICD-11 compliant)
    ("Dr. Dmitry Ivanov", "Sports Medicine & Musculoskeletal", "Botkin Hospital Center", "2nd Botkinskiy Proyezd 5, Moscow", "Moscow", "125284", "+7 495 945-0045", "https://botkinmoscow.ru"),
    ("Dr. Ekaterina Morozova", "General Practice & Preventive Medicine", "Pirogov National Medical Center", "Nizhnyaya Pervomayskaya 70, Moscow", "Moscow", "105203", "+7 499 464-0303", "https://pirogov-center.ru"),
]

# Suburbs and practice generator helpers to complete 150 realistic records
SYDNEY_CLINICS = [
    ("Surry Hills Medical Centre", "573 Crown St, Surry Hills", "2010", "(02) 9319 1234", "https://surryhillsmedical.com.au"),
    ("Bondi Health Collective", "142 Bondi Rd, Bondi", "2026", "(02) 9130 5522", "https://bondihealth.com.au"),
    ("Chatswood Healthcare Centre", "430 Victoria Ave, Chatswood", "2067", "(02) 9411 8899", "https://chatswoodhealth.com.au"),
    ("Newtown Family Practice", "288 King St, Newtown", "2042", "(02) 9557 3344", "https://newtownfamilypractice.com.au"),
    ("Parramatta Medical Hub", "12 Phillip St, Parramatta", "2150", "(02) 9635 7711", "https://parramattamedical.com.au"),
    ("Strathfield Plaza Doctors", "11 The Boulevarde, Strathfield", "2135", "(02) 9746 2200", "https://strathfielddoctors.com.au"),
    ("Manly Coastal Clinic", "22 Darley Rd, Manly", "2095", "(02) 9977 4433", "https://manlycoastalclinic.com.au"),
    ("Randwick Medical Services", "124 Belmore Rd, Randwick", "2031", "(02) 9399 6677", "https://randwickmedical.com.au"),
    ("North Sydney Doctors", "100 Miller St, North Sydney", "2060", "(02) 9955 1122", "https://northsydneydoctors.com.au"),
    ("Liverpool Community Health Clinic", "180 George St, Liverpool", "2170", "(02) 8738 5000", "https://liverpoolhealth.nsw.gov.au"),
    ("Marrickville Family Health", "312 Marrickville Rd, Marrickville", "2044", "(02) 9568 1144", "https://marrickvillefh.com.au"),
    ("Burwood Central Doctors", "45 Railway Pde, Burwood", "2134", "(02) 9747 5511", "https://burwoodcentraldoctors.com.au"),
    ("Blacktown Family Medical Hub", "10 Flushcombe Rd, Blacktown", "2148", "(02) 9671 2288", "https://blacktownmedicalhub.com.au"),
    ("Penrith Valley Doctors", "550 High St, Penrith", "2750", "(02) 4721 3300", "https://penrithvalleydoctors.com.au"),
    ("Ryde Medical Centre", "247 Blaxland Rd, Ryde", "2112", "(02) 9807 4422", "https://rydemedical.com.au"),
    ("Kogarah Town Centre Medical", "1 Railway Pde, Kogarah", "2217", "(02) 9588 3355", "https://kogarahmedical.com.au"),
    ("Bankstown City Health Centre", "60 The Mall, Bankstown", "2200", "(02) 9709 1100", "https://bankstownhealth.com.au"),
    ("Dee Why Grand Medical", "15 Pacific Pde, Dee Why", "2099", "(02) 9982 7700", "https://deewhygrandmedical.com.au"),
    ("Balmain Peninsula Practice", "298 Darling St, Balmain", "2041", "(02) 9810 2233", "https://balmainpractice.com.au"),
    ("Paddington Medical Practice", "238 Oxford St, Paddington", "2021", "(02) 9331 4400", "https://paddingtonmed.com.au"),
]

FIRST_NAMES = ["Alexander", "Benjamin", "Claire", "Daniel", "Emma", "Francis", "Grace", "Harrison", "Isabella", "James", "Karen", "Lucas", "Maya", "Nathan", "Olivia", "Patrick", "Rachel", "Simon", "Teresa", "Victor", "Wendy", "Xavier", "Yvonne", "Zachary", "Sophie", "Jonathan", "Catherine", "Matthew", "Stephanie", "Andrew", "Natalie", "Christopher", "Alison", "Nicholas", "Melanie", "Timothy", "Rebecca", "George", "Victoria", "Ryan"]
LAST_NAMES = ["Anderson", "Baker", "Clarke", "Davies", "Evans", "Ferguson", "Gibson", "Hughes", "Ibrahim", "Jones", "Kelly", "Lawson", "Miller", "Nakamura", "O'Reilly", "Parker", "Quinn", "Robertson", "Sinclair", "Tan", "Underwood", "Vassallo", "Walsh", "Xiao", "Young", "Zimmerman", "Kumar", "Lee", "Smith", "Wilson", "Taylor", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez"]

SPECIALTY_RAW_VARIANTS = [
    "General Practice",
    "General Practitioner",
    "GP - Family Medicine",
    "Family Doctor & Preventive Care",
    "General Practice / Women's Health",
    "GP / Antenatal Shared Care",
    "Skin Cancer Medicine & Checks",
    "GP with Skin Cancer Focus",
    "Paediatric Medicine & Child Immunisation",
    "General Practice & Child Health",
    "Chronic Disease Management & Diabetes",
    "GP - Geriatric & Aged Care",
    "Occupational Medicine & Corporate Health",
    "Sports Injury & Musculoskeletal GP",
    "General Practice / Mental Health Care",
    "GP - Travel Medicine & Vaccinations",
    "Family Health & Lifestyle Medicine",
    "General Practitioner - Men's Health",
    "Holistic Family GP",
    "General Practice / Minor Surgical Procedures",
]

def generate_150_sydney_gps():
    rows = []
    # Add curated anchor providers
    for item in SAMPLE_PROVIDERS:
        rows.append({
            "Doctor": item[0],
            "Specialty Description": item[1],
            "Clinic": item[2],
            "Suburb": item[3].split(",")[-1].strip(),
            "Address": item[3],
            "State": item[4],
            "Postcode": item[5],
            "Phone": item[6],
            "Website": item[7],
            "Source URL": "https://ahpra.gov.au/registers/medical-practitioners" if "A/Prof" in item[0] else "",
        })

    # Fill up to 150 records
    idx = 0
    used_names = set(r["Doctor"].lower() for r in rows)
    while len(rows) < 150:
        fn = FIRST_NAMES[idx % len(FIRST_NAMES)]
        ln = LAST_NAMES[(idx // len(FIRST_NAMES) * 7 + (idx % len(LAST_NAMES))) % len(LAST_NAMES)]
        # Ensure unique name combinations
        full_candidate = f"{fn} {ln}".lower()
        if full_candidate in used_names:
            idx += 1
            continue
        used_names.add(full_candidate)
        clinic_info = SYDNEY_CLINICS[idx % len(SYDNEY_CLINICS)]
        spec = SPECIALTY_RAW_VARIANTS[idx % len(SPECIALTY_RAW_VARIANTS)]
        
        # Add slight variations to phone or address for realism
        phone = clinic_info[3]
        if idx % 7 == 0:
            # mobile doctor phone or missing
            phone = f"04{idx:02d} 112 334" if idx % 14 != 0 else ""
        elif idx % 9 == 0:
            phone = phone.replace("(", "").replace(")", "").replace(" ", "")

        website = clinic_info[4] if idx % 5 != 0 else ""
        source_url = "https://www.healthdirect.gov.au/australian-health-services" if idx % 8 == 0 else ""
        
        doc_name = f"Dr. {fn} {ln}"
        if idx % 11 == 0:
            doc_name = f"Dr {fn.upper()} {ln.upper()}"
        elif idx % 13 == 0:
            doc_name = f"  Dr. {fn} {ln}  "

        suburb = clinic_info[1].split(",")[-1].strip()

        rows.append({
            "Doctor": doc_name,
            "Specialty Description": spec,
            "Clinic": clinic_info[0],
            "Suburb": suburb,
            "Address": clinic_info[1],
            "State": "NSW",
            "Postcode": clinic_info[2],
            "Phone": phone,
            "Website": website,
            "Source URL": source_url,
        })
        idx += 1

    return rows

def create_sample_files(dest_dir: str):
    os.makedirs(dest_dir, exist_ok=True)
    rows = generate_150_sydney_gps()
    
    # 1. Write CSV file
    csv_path = os.path.join(dest_dir, "sydney_gp_list.csv")
    headers = ["Doctor", "Specialty Description", "Clinic", "Suburb", "Address", "State", "Postcode", "Phone", "Website", "Source URL"]
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
            
    # 2. Write Excel XLSX file with styled header
    xlsx_path = os.path.join(dest_dir, "sydney_gp_list.xlsx")
    wb = Workbook()
    ws = wb.active
    ws.title = "Sydney GPs Pilot"
    
    ws.append(headers)
    
    # Style header row
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1B4332", end_color="1B4332", fill_type="solid") # Forest Green
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        
    for r in rows:
        ws.append([r[h] for h in headers])
        
    # Auto adjust column widths
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = col[0].column_letter
        ws.column_dimensions[col_letter].width = max(max_len + 3, 12)
        
    wb.save(xlsx_path)
    
    # 3. Write Global Multi-Jurisdiction Dataset (Australia, USA, India, Nepal, Russia)
    global_csv_path = os.path.join(dest_dir, "global_healthcare_dataset.csv")
    with open(global_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
            
    global_xlsx_path = os.path.join(dest_dir, "global_healthcare_dataset.xlsx")
    wb.save(global_xlsx_path)

    print(f"Generated {len(rows)} records in {csv_path}, {xlsx_path}, and {global_xlsx_path}")
    return len(rows), csv_path, xlsx_path

if __name__ == "__main__":
    count, c_path, x_path = create_sample_files("backend/data")
    print(f"Sample generation completed: {count} rows")
