from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}


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


def sheet_names(zf: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
    names = []
    for sheet in workbook.findall(".//a:sheet", NS):
        rel_id = sheet.attrib[f"{{{NS['r']}}}id"]
        target = rel_map[rel_id]
        names.append((sheet.attrib["name"], "xl/" + target.lstrip("/")))
    return names


def read_sheet(zf: zipfile.ZipFile, sheet_path: str, strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(zf.read(sheet_path))
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


def main() -> int:
    path = Path(sys.argv[1])
    with zipfile.ZipFile(path) as zf:
        strings = shared_strings(zf)
        sheets = sheet_names(zf)
        print(f"Workbook: {path.name}")
        print(f"Sheets: {len(sheets)}")
        for name, sheet_path in sheets:
            rows = read_sheet(zf, sheet_path, strings)
            headers = rows[0] if rows else []
            print(f"\nSheet: {name}")
            print(f"Rows: {max(len(rows) - 1, 0)}")
            print("Columns:")
            for index, header in enumerate(headers, 1):
                non_empty = sum(1 for row in rows[1:] if index - 1 < len(row) and row[index - 1])
                print(f"{index}. {header} [{non_empty}]")
            print("Sample rows:")
            for row in rows[1:4]:
                print(row[: min(len(headers), 6)])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
