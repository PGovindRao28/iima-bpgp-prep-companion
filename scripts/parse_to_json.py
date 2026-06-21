import openpyxl
import json
import os

wb = openpyxl.load_workbook("d:/IIM A/Study Material/50-days-complete-plan_Quantifiers-1.xlsx")

# Ensure output directory exists
os.makedirs("d:/IIM A/src/data", exist_ok=True)

# ----------------- PARSE SHEET 1 (50-Day Plan) -----------------
sheet1 = wb['Sheet1']
days_data = []

# Global community/header links (rows 1-11)
community_links = []
for r in range(1, 15):
    for c in range(1, 10):
        cell = sheet1.cell(row=r, column=c)
        if cell.value:
            val = str(cell.value).strip()
            hl = cell.hyperlink.target if cell.hyperlink else None
            if hl or "http" in val:
                url = hl if hl else val
                title = val if not hl else str(sheet1.cell(row=r, column=c-1).value or val)
                if any(x in url.lower() for x in ["telegram", "whatsapp", "formula", "dilr book"]):
                    title = title.replace("Group for doubt solving", "").strip()
                    title = title.replace("Group", "").strip()
                    community_links.append({"title": title, "url": url})

# Remove duplicates in community links
seen_urls = set()
unique_community_links = []
for cl in community_links:
    if cl['url'] not in seen_urls:
        seen_urls.add(cl['url'])
        unique_community_links.append(cl)

# Parse the 50 days (Day 50 down to Day 1)
# Data starts at row 15. Each day is a block of 4 rows.
start_row = 15
max_row = sheet1.max_row

for r in range(start_row, max_row + 1, 4):
    day_cell = sheet1.cell(row=r, column=1).value
    if not day_cell or "Day" not in str(day_cell):
        continue
    
    day_name = str(day_cell).strip()
    topic = str(sheet1.cell(row=r, column=2).value or "").replace('\n', ' ').strip()
    
    # 1. Quant Tasks (Col 3 / C)
    quant_tasks = []
    for offset in range(4):
        if r+offset > max_row: break
        cell = sheet1.cell(row=r+offset, column=3)
        if cell.value:
            text = str(cell.value).replace('\n', ' ').strip()
            if text.lower() not in ["na", "none", "null"]:
                url = cell.hyperlink.target if cell.hyperlink else None
                quant_tasks.append({"text": text, "url": url})
                
    # 2. DILR Plan A Tasks (Col 4 / D)
    dilr_plan_a = []
    for offset in range(4):
        if r+offset > max_row: break
        cell = sheet1.cell(row=r+offset, column=4)
        if cell.value:
            text = str(cell.value).replace('\n', ' ').strip()
            if text.lower() not in ["na", "none", "null"]:
                url = cell.hyperlink.target if cell.hyperlink else None
                display_text = "DILR Booster Test Link" if url and text.startswith("http") else text
                url = url or (text if text.startswith("http") else None)
                dilr_plan_a.append({"text": display_text, "url": url})

    # 3. DILR Plan B Tasks (Col 5 / E)
    dilr_plan_b = []
    for offset in range(4):
        if r+offset > max_row: break
        cell = sheet1.cell(row=r+offset, column=5)
        if cell.value:
            text = str(cell.value).replace('\n', ' ').strip()
            if text.lower() not in ["na", "none", "null"]:
                url = cell.hyperlink.target if cell.hyperlink else None
                dilr_plan_b.append({"text": text, "url": url})

    # 4. VA Plan A Tasks (Col 6 / F)
    va_plan_a = []
    for offset in range(4):
        if r+offset > max_row: break
        cell = sheet1.cell(row=r+offset, column=6)
        if cell.value:
            text = str(cell.value).replace('\n', ' ').strip()
            if text.lower() not in ["na", "none", "null"]:
                url = cell.hyperlink.target if cell.hyperlink else None
                display_text = "VA Sectional Test" if url and text.startswith("http") else text
                url = url or (text if text.startswith("http") else None)
                va_plan_a.append({"text": display_text, "url": url})

    # 5. VA Plan B Tasks (Col 7 / G)
    va_plan_b = []
    for offset in range(4):
        if r+offset > max_row: break
        cell = sheet1.cell(row=r+offset, column=7)
        if cell.value:
            text = str(cell.value).replace('\n', ' ').strip()
            if text.lower() not in ["na", "none", "null"] and "super 75" not in text.lower():
                url = cell.hyperlink.target if cell.hyperlink else None
                va_plan_b.append({"text": text, "url": url})

    # 6. Additional Practice / Super 75 (Col 8 / H)
    additional_practice = []
    for offset in range(4):
        if r+offset > max_row: break
        cell = sheet1.cell(row=r+offset, column=8)
        if cell.value:
            text = str(cell.value).replace('\n', ' ').strip()
            if text.lower() not in ["na", "none", "null"] and "mock (free" not in text.lower():
                url = cell.hyperlink.target if cell.hyperlink else None
                if "super 75" in text.lower():
                    text = "Super 75 Playlist Quiz"
                additional_practice.append({"text": text, "url": url})

    days_data.append({
        "day": day_name,
        "topic": topic,
        "quant": quant_tasks,
        "dilrPlanA": dilr_plan_a,
        "dilrPlanB": dilr_plan_b,
        "vaPlanA": va_plan_a,
        "vaPlanB": va_plan_b,
        "additional": additional_practice
    })

# Sort Day 1 to Day 50
def get_day_num(day_dict):
    try:
        return int(day_dict['day'].replace('Day', '').strip())
    except:
        return 999

days_data.sort(key=get_day_num)


# ----------------- PARSE SHEET 2 (Topic Wise Tests) -----------------
sheet2 = wb['Topic wise tests']
verbal_tests = []
dilr_tests = []
quant_tests = []

for r in range(2, sheet2.max_row + 1):
    # Verbal: Col 1 & 2
    v_name = sheet2.cell(row=r, column=1).value
    v_url = sheet2.cell(row=r, column=2).hyperlink.target if sheet2.cell(row=r, column=2).hyperlink else sheet2.cell(row=r, column=2).value
    
    # DILR: Col 4 & 5
    d_name = sheet2.cell(row=r, column=4).value
    d_url = sheet2.cell(row=r, column=5).hyperlink.target if sheet2.cell(row=r, column=5).hyperlink else sheet2.cell(row=r, column=5).value

    # Quant: Col 7 & 8
    q_name = sheet2.cell(row=r, column=7).value
    q_url = sheet2.cell(row=r, column=8).hyperlink.target if sheet2.cell(row=r, column=8).hyperlink else sheet2.cell(row=r, column=8).value
    
    if v_name and str(v_name).strip() and str(v_name).lower() not in ["verbal mock test", "url"]:
        verbal_tests.append({"name": str(v_name).strip(), "url": str(v_url).strip() if v_url else None})
        
    if d_name and str(d_name).strip() and str(d_name).lower() not in ["dilr mock test", "url"]:
        dilr_tests.append({"name": str(d_name).strip(), "url": str(d_url).strip() if d_url else None})

    if q_name and str(q_name).strip() and str(q_name).lower() not in ["quant mock test", "url"]:
        quant_tests.append({"name": str(q_name).strip(), "url": str(q_url).strip() if q_url else None})


# ----------------- PARSE SHEET 3 (Important Sectionals) -----------------
sheet3 = wb['Important Sectionals']
mini_mocks = []

for r in range(3, sheet3.max_row + 1):
    mock_name = sheet3.cell(row=r, column=1).value
    if not mock_name or not str(mock_name).strip():
        continue
        
    overall = str(sheet3.cell(row=r, column=2).value or "").replace('\n', ' ').strip()
    va = str(sheet3.cell(row=r, column=3).value or "").replace('\n', ' ').strip()
    
    lrdi_cell = sheet3.cell(row=r, column=4)
    lrdi_text = str(lrdi_cell.value or "").replace('\n', ' ').strip()
    lrdi_url = lrdi_cell.hyperlink.target if lrdi_cell.hyperlink else None
    
    qa = str(sheet3.cell(row=r, column=5).value or "").replace('\n', ' ').strip()
    
    link_cell = sheet3.cell(row=r, column=6)
    link_text = str(link_cell.value or "").replace('\n', ' ').strip()
    link_url = link_cell.hyperlink.target if link_cell.hyperlink else None
    
    final_url = link_url
    if not final_url and link_text and "http" in link_text:
        final_url = link_text
    elif not final_url and link_text and "catprep." in link_text:
        final_url = "https://" + link_text

    mini_mocks.append({
        "name": str(mock_name).strip(),
        "overall": overall if overall.lower() != "na" else None,
        "va": va if va.lower() != "na" else None,
        "lrdi": {
            "text": lrdi_text,
            "url": lrdi_url
        } if lrdi_text.lower() != "na" else None,
        "qa": qa if qa.lower() != "na" else None,
        "url": final_url if final_url and "not found" not in final_url.lower() else None
    })

# Write to JSON
final_json = {
    "communityLinks": unique_community_links,
    "days": days_data,
    "topicWiseTests": {
        "verbal": verbal_tests,
        "dilr": dilr_tests,
        "quant": quant_tests
      },
    "miniMocks": mini_mocks
}

with open("d:/IIM A/src/data/study_material.json", "w", encoding="utf-8") as f:
    json.dump(final_json, f, indent=2, ensure_ascii=False)

print("JSON file successfully written to d:/IIM A/src/data/study_material.json!")
print(f"Stats: {len(days_data)} days, {len(verbal_tests)} verbal, {len(dilr_tests)} DILR, {len(quant_tests)} quant tests, {len(mini_mocks)} mini mocks.")
