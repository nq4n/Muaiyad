from __future__ import annotations

import re
import sys
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager


NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


def ar_text(text: str) -> str:
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display

        return get_display(arabic_reshaper.reshape(text))
    except Exception:
        return text


def col_index(cell_ref: str) -> int:
    letters = re.match(r"[A-Z]+", cell_ref).group(0)
    index = 0
    for char in letters:
        index = index * 26 + (ord(char) - 64)
    return index - 1


def shared_strings(zf: zipfile.ZipFile) -> list[str]:
    try:
        data = zf.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(data)
    values = []
    for item in root.findall("a:si", NS):
        parts = [node.text or "" for node in item.findall(".//a:t", NS)]
        values.append("".join(parts))
    return values


def sheet_path(zf: zipfile.ZipFile) -> str:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
    sheet = workbook.find(".//a:sheet", NS)
    rel_id = sheet.attrib[f"{{{NS['r']}}}id"]
    return "xl/" + rel_map[rel_id].lstrip("/")


def read_sheet(path: Path) -> list[list[str]]:
    with zipfile.ZipFile(path) as zf:
        strings = shared_strings(zf)
        root = ET.fromstring(zf.read(sheet_path(zf)))
    rows = []
    for row in root.findall(".//a:sheetData/a:row", NS):
        values = []
        for cell in row.findall("a:c", NS):
            idx = col_index(cell.attrib.get("r", "A1"))
            while len(values) <= idx:
                values.append("")
            value_node = cell.find("a:v", NS)
            inline_node = cell.find("a:is/a:t", NS)
            if inline_node is not None:
                value = inline_node.text or ""
            elif value_node is None:
                value = ""
            elif cell.attrib.get("t") == "s":
                value = strings[int(value_node.text)]
            else:
                value = value_node.text or ""
            values[idx] = value.strip()
        rows.append(values)
    return rows


def split_axis(header: str) -> tuple[str, str]:
    match = re.match(r"\s*(.*?)\s*\[(.*?)\]\s*$", header)
    if not match:
        return header.strip(), header.strip()
    axis = re.sub(r"\s+", " ", match.group(1)).strip()
    item = re.sub(r"\s+", " ", match.group(2)).strip()
    return axis, item


def short_axis(axis: str) -> str:
    axis = axis.replace("المحور الأول:", "").replace("المحور الثاني :", "")
    axis = axis.replace("المحور الثالث:", "").replace("المحور الرايع:", "")
    axis = axis.replace("المحور الرابع:", "").replace("المحور الخامس:", "")
    axis = axis.replace("المحور السادس:", "").replace("المحور السابع:", "")
    return re.sub(r"\s+", " ", axis).strip()


def need_score(value: str) -> int:
    value = value.strip()
    return 1 if "أحتاج" in value and "لا" not in value else 0


def setup_font() -> None:
    candidates = [
        r"C:\Windows\Fonts\tahoma.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\seguiemj.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            font_manager.fontManager.addfont(candidate)
            plt.rcParams["font.family"] = font_manager.FontProperties(fname=candidate).get_name()
            break
    plt.rcParams["axes.unicode_minus"] = False


def save_axis_chart(axis_rows: list[dict], output: Path, respondents: int) -> None:
    labels = [ar_text(row["axis"]) for row in axis_rows]
    values = [row["need_pct"] for row in axis_rows]
    colors = ["#d6b16d" if index == 0 else "#5a8f8e" for index in range(len(values))]

    fig, ax = plt.subplots(figsize=(13, 7), dpi=180)
    fig.patch.set_facecolor("#0d1718")
    ax.set_facecolor("#121f21")
    bars = ax.barh(range(len(values)), values, color=colors, edgecolor="#ead59e", linewidth=0.8)
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels(labels, fontsize=12, color="#f6f0df")
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xlabel(ar_text("نسبة الاحتياج التدريبي (%)"), color="#d8cfb7", fontsize=12)
    ax.set_title(ar_text(f"تحليل الاحتياجات التدريبية للمعلمين - عدد الردود: {respondents}"), color="#f6f0df", fontsize=17, pad=18, weight="bold")
    ax.grid(axis="x", color="#d6b16d", alpha=0.14)
    ax.tick_params(axis="x", colors="#d8cfb7")
    ax.tick_params(axis="y", colors="#f6f0df")
    for spine in ax.spines.values():
        spine.set_color("#3a4a48")
    for bar, value in zip(bars, values):
        ax.text(value + 1.2, bar.get_y() + bar.get_height() / 2, f"{value:.0f}%", va="center", color="#f6f0df", fontsize=11, weight="bold")
    fig.tight_layout()
    fig.savefig(output, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def save_specialty_chart(rows: list[list[str]], output: Path) -> None:
    specialties = Counter(row[3] for row in rows if len(row) > 3 and row[3])
    labels = [ar_text(label) for label, _ in specialties.most_common()]
    values = [value for _, value in specialties.most_common()]

    fig, ax = plt.subplots(figsize=(11, 7), dpi=180)
    fig.patch.set_facecolor("#0d1718")
    ax.set_facecolor("#121f21")
    wedges, texts, autotexts = ax.pie(
        values,
        labels=labels,
        autopct=lambda pct: f"{pct:.0f}%",
        startangle=90,
        colors=["#d6b16d", "#5a8f8e", "#915375", "#8a9b68", "#c58f65", "#6f7fa4", "#a36f8d"],
        textprops={"color": "#f6f0df", "fontsize": 10},
        wedgeprops={"edgecolor": "#0d1718", "linewidth": 1},
    )
    for autotext in autotexts:
        autotext.set_color("#0d1718")
        autotext.set_fontweight("bold")
    ax.set_title(ar_text("تخصصات المشاركين في الاستبانة"), color="#f6f0df", fontsize=17, pad=18, weight="bold")
    fig.tight_layout()
    fig.savefig(output, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def main() -> int:
    workbook = Path(sys.argv[1])
    image_dir = Path("flask_app/static/img/training-needs")
    image_dir.mkdir(parents=True, exist_ok=True)

    rows = read_sheet(workbook)
    headers = rows[0]
    data = rows[1:]
    respondents = len(data)

    axis_scores = defaultdict(list)
    item_rows = []
    for col_idx, header in enumerate(headers[5:], start=5):
        axis, item = split_axis(header)
        scores = [need_score(row[col_idx]) for row in data if col_idx < len(row) and row[col_idx]]
        need_pct = (sum(scores) / len(scores) * 100) if scores else 0
        axis_name = short_axis(axis)
        axis_scores[axis_name].extend(scores)
        item_rows.append({"axis": axis_name, "item": item, "need_pct": need_pct, "responses": len(scores)})

    axis_rows = []
    for axis, scores in axis_scores.items():
        axis_rows.append({"axis": axis, "need_pct": sum(scores) / len(scores) * 100, "responses": len(scores)})
    axis_rows.sort(key=lambda row: row["need_pct"], reverse=True)
    item_rows.sort(key=lambda row: row["need_pct"], reverse=True)

    setup_font()
    save_axis_chart(axis_rows, image_dir / "needs-by-axis.png", respondents)
    save_specialty_chart(data, image_dir / "respondents-by-specialty.png")

    print("Generated charts:")
    print(image_dir / "needs-by-axis.png")
    print(image_dir / "respondents-by-specialty.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
