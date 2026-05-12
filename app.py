from flask import Flask, render_template, jsonify, redirect, request, url_for
import html
import mimetypes
import os
import re
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

mimetypes.add_type("image/webp", ".webp")

app = Flask(
    __name__,
    template_folder="flask_app/templates",
    static_folder="flask_app/static",
    static_url_path="/static",
)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-key-change-in-production")
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 31536000


def resolve_asset_version():
    for env_key in ("RAILWAY_GIT_COMMIT_SHA", "SOURCE_VERSION", "RAILWAY_DEPLOYMENT_ID"):
        value = os.environ.get(env_key, "").strip()
        if value:
            return value[:16]

    watched_paths = [
        "app.py",
        "flask_app/templates/base.html",
        "flask_app/templates/pages/home.html",
        "flask_app/static/css/shell.css",
        "flask_app/static/css/content.css",
        "flask_app/static/css/effects.css",
        "flask_app/static/css/restored-layouts.css",
        "flask_app/static/css/style.css",
        "flask_app/static/js/app.js",
        "flask_app/static/js/app/core.js",
        "flask_app/static/js/app/header.js",
        "flask_app/static/js/app/page-renderers.js",
        "flask_app/static/js/app/conceptual-axes.js",
        "flask_app/static/js/data/site.js",
        "flask_app/static/js/data/pages/home.js",
    ]

    existing_paths = [path for path in watched_paths if os.path.exists(path)]

    if not existing_paths:
        return "dev"

    latest_mtime = max(int(os.path.getmtime(path)) for path in existing_paths)
    return str(latest_mtime)


ASSET_VERSION = resolve_asset_version()


@app.after_request
def add_static_cache_headers(response):
    if request.path.startswith(f"{app.static_url_path}/"):
        if "v" in request.args:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["Cache-Control"] = "public, max-age=3600"

    return response


PAGES = {
    "home": {"path": "pages/home.html", "title_en": "Portfolio Introduction", "title_ar": "مقدمة الملف"},
    "philosophy": {"path": "pages/philosophy.html", "title_en": "Educational Philosophy", "title_ar": "الفلسفة التربوية"},
    "cv": {"path": "pages/cv.html", "title_en": "CV", "title_ar": "السيرة الذاتية"},
    "unit-plan": {"path": "pages/unit-plan.html", "title_en": "Unit Plan", "title_ar": "خطة الوحدة"},

    "unit-1-intro": {"path": "pages/unit-1-intro.html", "title_en": "1- Unit Introduction", "title_ar": "1- مقدمة الوحدة"},
    "unit-2-framework": {"path": "pages/unit-2-framework.html", "title_en": "2- Theoretical Framework", "title_ar": "2- الإطار النظري"},
    "unit-3-objectives": {"path": "pages/unit-3-objectives.html", "title_en": "3- General & Specific Objectives", "title_ar": "3- الأهداف العامة والخاصة"},
    "unit-4-assessment": {"path": "pages/unit-4-assessment.html", "title_en": "4- Measuring Student Learning", "title_ar": "4- طرق قياس تعلم الطلبة"},
    "unit-5-lessons": {"path": "pages/unit-5-lessons.html", "title_en": "5- Lesson Plans Preparation", "title_ar": "5- إعداد خطط الدروس"},
    "unit-6-feedback": {"path": "pages/unit-6-feedback.html", "title_en": "6- Feedback", "title_ar": "6- التغذية الراجعة"},
    "unit-7-impact": {"path": "pages/unit-7-impact.html", "title_en": "7- Measuring Learning Impact", "title_ar": "7- قياس أثر التعلم"},
    "unit-8-reflection": {"path": "pages/unit-8-reflection.html", "title_en": "8- Reflection on Teaching Practices", "title_ar": "8- التأمل في الممارسات التدريسية"},
    "unit-9-references": {"path": "pages/unit-9-references.html", "title_en": "9- References", "title_ar": "9- المراجع العلمية"},
    "unit-10-appendices": {"path": "pages/unit-10-appendices.html", "title_en": "10- Appendices", "title_ar": "10- الملاحق"},

    "conceptual-axes": {"path": "pages/conceptual-axes.html", "title_en": "Conceptual Framework Axes", "title_ar": "محاور الإطار المفاهيمي"},
    "reflection-papers": {"path": "pages/reflection-papers.html", "title_en": "Reflection Papers", "title_ar": "الأوراق التأملية"},
    "graduation-project": {"path": "pages/graduation-project.html", "title_en": "Research Project", "title_ar": "مشروع البحث"},
    "other": {"path": "pages/other.html", "title_en": "Other", "title_ar": "أخرى"},

    "other-values": {"path": "pages/other-values.html", "title_en": "Professional Values Scenarios", "title_ar": "سيناريوهات القيم المهنية"},
    "other-workshop": {"path": "pages/other-workshop.html", "title_en": "Workshop", "title_ar": "الورشة"},
    "other-growth": {"path": "pages/other-growth.html", "title_en": "Professional Development Activities Evidence", "title_ar": "أدلة أنشطة النمو المهني"},
    "other-peer-visits": {"path": "pages/other-peer-visits.html", "title_en": "Peer Visit Exchange Evidence", "title_ar": "أدلة تبادل الزيارات"},
    "other-parent-communication": {"path": "pages/other-parent-communication.html", "title_en": "Parent Communication Form", "title_ar": "استمارة تواصل مع أولياء أمور المتعلمين"},
}


NAV_STRUCTURE = [
    {"id": "home"},
    {"id": "philosophy"},
    {"id": "cv"},
    {
        "id": "unit-plan",
        "children": [
            "unit-1-intro",
            "unit-2-framework",
            "unit-3-objectives",
            "unit-4-assessment",
            "unit-5-lessons",
            "unit-6-feedback",
            "unit-7-impact",
            "unit-8-reflection",
            "unit-9-references",
            "unit-10-appendices",
        ],
    },
    {"id": "conceptual-axes"},
    {"id": "reflection-papers"},
    {"id": "graduation-project"},
    {
        "id": "other",
        "children": [
            "other-values",
            "other-workshop",
            "other-growth",
            "other-peer-visits",
            "other-parent-communication",
        ],
    },
]


NAV_ICONS = {
    "home": "&#8962;",
    "philosophy": "&#9673;",
    "cv": "&#9638;",
    "unit-plan": "&#9635;",
    "conceptual-axes": "&#8859;",
    "framework-axes": "&#8998;",
    "reflection-papers": "&#9998;",
    "graduation-project": "&#11041;",
    "other": "&#8230;",
}


ROUTE_MAP = {
    "home": "home",
    "philosophy": "philosophy",
    "cv": "cv",
    "unit": "unit-plan",
    "axes": "conceptual-axes",
    "reflections": "reflection-papers",
    "graduation": "graduation-project",
    "other": "other",
    "unit1": "unit-1-intro",
    "unit2": "unit-2-framework",
    "unit3": "unit-3-objectives",
    "unit4": "unit-4-assessment",
    "unit5": "unit-5-lessons",
    "unit6": "unit-6-feedback",
    "unit7": "unit-7-impact",
    "unit8": "unit-8-reflection",
    "unit9": "unit-9-references",
    "unit10": "unit-10-appendices",
    "other1": "other-values",
    "other2": "other-workshop",
    "other3": "other-growth",
    "other4": "other-peer-visits",
    "other5": "other-parent-communication",
}


THEMES = ["arabesque", "light"]
DEFAULT_THEME = "arabesque"


def get_page_context(page_id, lang="ar"):
    return {
        "page_id": page_id,
        "lang": lang,
        "dir": "rtl" if lang == "ar" else "ltr",
        "asset_version": ASSET_VERSION,
        "pages": PAGES,
        "nav_structure": NAV_STRUCTURE,
        "nav_icons": NAV_ICONS,
        "themes": THEMES,
        "default_theme": DEFAULT_THEME,
        "route_map": ROUTE_MAP,
    }


@app.route("/")
def home():
    return render_template(PAGES["home"]["path"], **get_page_context("home"))


@app.route("/health")
def health():
    return "OK", 200


@app.route("/<page_id>")
def page(page_id):
    if page_id not in PAGES:
        return redirect(url_for("home"))

    return render_template(PAGES[page_id]["path"], **get_page_context(page_id))


@app.route("/api/data")
def api_data():
    return jsonify(
        {
            "pages": PAGES,
            "nav_structure": NAV_STRUCTURE,
            "nav_icons": NAV_ICONS,
            "themes": THEMES,
            "default_theme": DEFAULT_THEME,
            "route_map": ROUTE_MAP,
        }
    )


@app.route("/api/lang/<lang>")
def api_lang(lang):
    if lang not in ["en", "ar"]:
        return jsonify({"error": "Invalid language"}), 400

    return jsonify({"lang": lang})


@app.route("/api/drive-folder/<folder_id>")
def api_drive_folder(folder_id):
    if not re.fullmatch(r"[A-Za-z0-9_-]+", folder_id):
        return jsonify({"error": "Invalid folder id"}), 400

    resource_key = request.args.get("resourcekey", "").strip()

    if resource_key and not re.fullmatch(r"[A-Za-z0-9_-]+", resource_key):
        return jsonify({"error": "Invalid resource key"}), 400

    folder_url = f"https://drive.google.com/embeddedfolderview?id={quote(folder_id)}"

    if resource_key:
        folder_url += f"&resourcekey={quote(resource_key)}"

    folder_url += "#grid"

    folder_request = Request(
        folder_url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; PortfolioDriveFolderViewer/1.0)"
        },
    )

    try:
        with urlopen(folder_request, timeout=10) as response:
            markup = response.read().decode("utf-8", "replace")
    except (HTTPError, URLError, TimeoutError) as error:
        return jsonify({"error": f"Unable to load Drive folder: {error}"}), 502

    entries = []

    entry_pattern = re.compile(
        r'<div class="flip-entry" id="entry-([^"]+)".*?'
        r'<a href="([^"]+)"[^>]*>.*?'
        r'<div class="flip-entry-title">(.*?)</div>',
        re.DOTALL,
    )

    for match in entry_pattern.finditer(markup):
        entry_id = match.group(1)
        href = html.unescape(match.group(2))
        title = html.unescape(re.sub(r"<[^>]+>", "", match.group(3))).strip()
        preview_url = href
        entry_type = "file"

        drive_file = re.search(r"drive\.google\.com/file/d/([^/]+)", href)
        docs_file = re.search(
            r"docs\.google\.com/(document|presentation|spreadsheets)/d/([^/]+)",
            href,
        )
        drive_folder = re.search(r"drive\.google\.com/drive/folders/([^/?#]+)", href)
        embedded_folder = re.search(
            r"drive\.google\.com/embeddedfolderview\?[^#]*\bid=([^&#]+)",
            href,
        )
        resource_key_match = re.search(r"[?&]resourcekey=([^&#]+)", href)
        entry_resource_key = resource_key_match.group(1) if resource_key_match else ""

        if drive_file:
            file_id = drive_file.group(1)
            preview_url = f"https://drive.google.com/file/d/{file_id}/preview"

        elif docs_file:
            doc_type, file_id = docs_file.groups()
            preview_url = f"https://docs.google.com/{doc_type}/d/{file_id}/preview"

        elif drive_folder or embedded_folder:
            entry_type = "folder"
            file_id = (drive_folder or embedded_folder).group(1)
            preview_url = f"https://drive.google.com/embeddedfolderview?id={file_id}"

            if entry_resource_key:
                preview_url += f"&resourcekey={entry_resource_key}"

            preview_url += "#grid"

        else:
            file_id = entry_id

        entries.append(
            {
                "id": file_id,
                "title": title or entry_id,
                "href": href,
                "preview_url": preview_url,
                "resource_key": entry_resource_key,
                "type": entry_type,
            }
        )

    return jsonify({"folder_id": folder_id, "entries": entries})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))

    app.run(
        debug=False,
        host="0.0.0.0",
        port=port,
    )