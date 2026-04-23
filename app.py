from flask import Flask, render_template, jsonify, redirect, url_for
import os

app = Flask(
    __name__,
    template_folder="flask_app/templates",
    static_folder="flask_app/static",
    static_url_path="/static",
)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-key-change-in-production")

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
    "framework-axes": {"path": "pages/framework-axes.html", "title_en": "Comprehensive Reflection Paper", "title_ar": "الورقة التأملية الشاملة"},
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


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
