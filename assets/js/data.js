(() => {
  const pages = [
    ["home", "index.html", "Home", "الرئيسية"],
    ["philosophy", "pages/philosophy.html", "Educational Philosophy", "الفلسفة التربوية"],
    ["cv", "pages/cv.html", "CV", "السيرة الذاتية"],
    ["unit-plan", "pages/unit-plan.html", "Unit Plan", "خطة الوحدة"],
    ["unit-1-intro", "pages/unit-1-intro.html", "1- Unit Introduction", "1- مقدمة الوحدة"],
    ["unit-2-framework", "pages/unit-2-framework.html", "2- Theoretical Framework", "2- الإطار النظري"],
    ["unit-3-objectives", "pages/unit-3-objectives.html", "3- General & Specific Objectives", "3- الأهداف العامة والخاصة"],
    ["unit-4-assessment", "pages/unit-4-assessment.html", "4- Measuring Student Learning", "4- طرق قياس تعلم الطلبة"],
    ["unit-5-lessons", "pages/unit-5-lessons.html", "5- Lesson Plans Preparation", "5- إعداد خطط الدروس"],
    ["unit-6-feedback", "pages/unit-6-feedback.html", "6- Feedback", "6- التغذية الراجعة"],
    ["unit-7-impact", "pages/unit-7-impact.html", "7- Measuring Learning Impact", "7- قياس أثر التعلم"],
    ["unit-8-reflection", "pages/unit-8-reflection.html", "8- Reflection on Teaching Practices", "8- التأمل في الممارسات التدريسية"],
    ["unit-9-references", "pages/unit-9-references.html", "9- References", "9- المراجع العلمية"],
    ["unit-10-appendices", "pages/unit-10-appendices.html", "10- Appendices", "10- الملاحق"],
    ["framework-axes", "pages/framework-axes.html", "Conceptual Framework Axes", "محاور الإطار المفاهيمي"],
    ["reflection-papers", "pages/reflection-papers.html", "Reflection Papers", "الأوراق التأملية"],
    ["graduation-project", "pages/graduation-project.html", "Graduation Project", "مشروع التخرج"],
    ["other", "pages/other.html", "Other", "أخرى"],
    ["other-values", "pages/other-values.html", "Professional Values Scenarios", "سيناريوهات القيم المهنية"],
    ["other-workshop", "pages/other-workshop.html", "Workshop", "الورشة"],
    ["other-growth", "pages/other-growth.html", "Professional Growth Evidence", "أدلة النمو المهني"],
    ["other-peer-visits", "pages/other-peer-visits.html", "Peer Visit Exchange Evidence", "أدلة تبادل الزيارات"]
  ];

  const unitChildren = pages.slice(4, 14).map((p) => p[0]);
  const otherChildren = pages.slice(18).map((p) => p[0]);
  const pageMap = Object.fromEntries(pages.map((p) => [p[0], p[1]]));
  const navEn = Object.fromEntries(pages.map((p) => [p[0], p[2]]));
  const navAr = Object.fromEntries(pages.map((p) => [p[0], p[3]]));

  const navStructure = [
    { id: "home" },
    { id: "philosophy" },
    { id: "cv" },
    { id: "unit-plan", children: unitChildren },
    { id: "framework-axes" },
    { id: "reflection-papers" },
    { id: "graduation-project" },
    { id: "other", children: otherChildren }
  ];

  const makePage = (lang, id, label) => {
    if (id === "home") {
      return {
        title: lang === "en" ? "CLI Portfolio Terminal" : "واجهة ملف شخصي بنمط الطرفية",
        subtitle:
          lang === "en"
            ? "A bilingual, command-driven portfolio with accessible navigation."
            : "ملف ثنائي اللغة يعتمد على الأوامر مع تنقل سهل الوصول.",
        prompt: "$ help",
        sections: [
          {
            title: lang === "en" ? "Profile Snapshot" : "لمحة سريعة",
            body:
              lang === "en"
                ? "I build practical educational workflows, assessment systems, and AI-enabled learning tools."
                : "أطوّر مسارات تعليمية عملية وأنظمة تقييم وأدوات تعلم مدعومة بالذكاء الاصطناعي."
          },
          {
            title: lang === "en" ? "Navigation" : "التنقل",
            body:
              lang === "en"
                ? "Use the terminal command bar or the navbar dropdowns to move across every section."
                : "استخدم شريط الأوامر أو القوائم المنسدلة للتنقل بين جميع الأقسام."
          },
          {
            title: lang === "en" ? "What You Will Find" : "ماذا ستجد",
            body:
              lang === "en"
                ? "Educational philosophy, unit planning artifacts, reflection papers, and project implementations."
                : "الفلسفة التربوية، عناصر خطة الوحدة، الأوراق التأملية، وتنفيذات المشاريع."
          }
        ]
      };
    }
    return {
      title: label,
      subtitle:
        lang === "en"
          ? "Professional placeholder content written in a concise and practical style."
          : "محتوى مهني تجريبي مكتوب بأسلوب واضح وعملي.",
      prompt: lang === "en" ? "$ open section" : "$ open section",
      sections: [
        {
          title: lang === "en" ? "Overview" : "نظرة عامة",
          body:
            lang === "en"
              ? `This page presents structured notes and evidence for ${label}.`
              : `تعرض هذه الصفحة ملاحظات منظمة وأدلة مرتبطة بقسم ${label}.`
        },
        {
          title: lang === "en" ? "Implementation Notes" : "ملاحظات التنفيذ",
          body:
            lang === "en"
              ? "Content is designed for direct reuse in portfolio review, interviews, and academic submission."
              : "تم إعداد المحتوى بحيث يمكن إعادة استخدامه مباشرة في التقييم المهني والمقابلات والتسليم الأكاديمي."
        },
        {
          title: lang === "en" ? "Next Action" : "الإجراء التالي",
          body:
            lang === "en"
              ? "Update this section with concrete artifacts, dates, and outcomes as your work progresses."
              : "حدّث هذا القسم بمواد فعلية وتواريخ ونتائج مع تقدم العمل."
        }
      ]
    };
  };

  const buildPages = (lang) =>
    Object.fromEntries(
      pages.map((p) => [p[0], makePage(lang, p[0], lang === "en" ? p[2] : p[3])])
    );

  const translations = {
    en: {
      meta: { siteName: "Muaiyad Portfolio" },
      ui: {
        skip: "Skip to content",
        locationHint: "~/portfolio",
        menu: "Menu",
        commandPlaceholder: "Type command (help)",
        commandLabel: "Command input",
        commandOutputLabel: "Command output",
        langButton: "AR",
        themeButton: "Theme",
        guidedButton: "Guided",
        close: "Close",
        open: "Open",
        noSuggestions: "No matching commands"
      },
      nav: navEn,
      pages: buildPages("en"),
      projects: {
        title: "Project Showcase",
        subtitle: "Filter and inspect selected technical projects.",
        searchLabel: "Search projects",
        searchPlaceholder: "Search by name, stack, tag...",
        sortLabel: "Sort by",
        sortFeatured: "Featured",
        sortNewest: "Newest",
        sortComplex: "Most complex",
        tagAll: "All",
        details: "Details",
        status: "Status",
        stack: "Stack",
        copyPitch: "Copy pitch",
        openLink: "Open link",
        noResults: "No projects match your current filters.",
        copied: "Pitch copied",
        statusDone: "Done",
        statusWip: "WIP"
      },
      guided: {
        title: "Guided Mode",
        subtitle: "Pick intent and style, then jump to the right project set.",
        purpose: "Purpose?",
        vibe: "Vibe?",
        show: "Show?",
        apply: "Apply",
        close: "Close",
        purposeHiring: "Hiring",
        purposeCollaboration: "Collaboration",
        purposeCuriosity: "Curiosity",
        vibeMinimal: "Minimal",
        vibeNeon: "Neon",
        vibeRetro: "Retro",
        showFeatured: "Featured",
        showRecent: "Recent",
        showAi: "AI Projects"
      },
      commands: {
        help: "Commands: help, home, philosophy, cv, unit, framework, reflections, graduation, other, unit1..unit10, other1..other4, theme [neon|amber|blue|light], lang [ar|en], cli [on|off], clear",
        unknown: "Unknown command",
        moved: "Navigating",
        themeChanged: "Theme changed",
        langChanged: "Language changed",
        cleared: "Cleared"
      },
      themes: { neon: "Neon Green", amber: "Amber Retro", blue: "Blue Night", light: "Light Orbit" }
    },
    ar: {
      meta: { siteName: "ملف معاياد الشخصي" },
      ui: {
        skip: "تخطي إلى المحتوى",
        locationHint: "~/الملف",
        menu: "القائمة",
        commandPlaceholder: "اكتب أمرا (help)",
        commandLabel: "شريط الأوامر",
        commandOutputLabel: "نتيجة الأمر",
        langButton: "EN",
        themeButton: "الثيم",
        guidedButton: "وضع مرشد",
        close: "إغلاق",
        open: "فتح",
        noSuggestions: "لا توجد أوامر مطابقة"
      },
      nav: navAr,
      pages: buildPages("ar"),
      projects: {
        title: "عرض المشاريع",
        subtitle: "تصفية ومراجعة المشاريع التقنية المختارة.",
        searchLabel: "ابحث في المشاريع",
        searchPlaceholder: "ابحث بالاسم أو التقنية أو الوسم...",
        sortLabel: "الترتيب حسب",
        sortFeatured: "مميزة",
        sortNewest: "الأحدث",
        sortComplex: "الأكثر تعقيدا",
        tagAll: "الكل",
        details: "التفاصيل",
        status: "الحالة",
        stack: "التقنيات",
        copyPitch: "نسخ الوصف",
        openLink: "فتح الرابط",
        noResults: "لا توجد مشاريع مطابقة للمرشحات الحالية.",
        copied: "تم نسخ الوصف",
        statusDone: "مكتمل",
        statusWip: "قيد العمل"
      },
      guided: {
        title: "الوضع المرشد",
        subtitle: "اختر الهدف والأسلوب ثم انتقل للمشاريع الأنسب.",
        purpose: "الهدف؟",
        vibe: "النمط؟",
        show: "اعرض؟",
        apply: "تطبيق",
        close: "إغلاق",
        purposeHiring: "توظيف",
        purposeCollaboration: "تعاون",
        purposeCuriosity: "فضول",
        vibeMinimal: "Minimal",
        vibeNeon: "Neon",
        vibeRetro: "Retro",
        showFeatured: "المميزة",
        showRecent: "الأحدث",
        showAi: "مشاريع الذكاء الاصطناعي"
      },
      commands: {
        help: "الأوامر: help, home, philosophy, cv, unit, framework, reflections, graduation, other, unit1..unit10, other1..other4, theme [neon|amber|blue|light], lang [ar|en], cli [on|off], clear",
        unknown: "أمر غير معروف",
        moved: "جاري الانتقال",
        themeChanged: "تم تغيير الثيم",
        langChanged: "تم تغيير اللغة",
        cleared: "تم المسح"
      },
      themes: { neon: "أخضر نيون", amber: "كهرماني كلاسيكي", blue: "ليلة زرقاء", light: "وضع فاتح" }
    }
  };

  const profile = {
    name_ar: "معاياد",
    name_en: "Muaiyad",
    role_ar: "مصمم تعلم وتقني تعليمي",
    role_en: "Instructional Designer & Educational Technologist",
    bio_ar: "أعمل على تطوير حلول تعلم وتقييم مدعومة بالتقنية والذكاء الاصطناعي.",
    bio_en: "I design practical learning and assessment systems powered by software and AI workflows.",
    location: "Jordan",
    links: { github: "#", linkedin: "#", email: "mailto:hello@example.com" }
  };

  const projects = [
    { id: "edupack", name: { en: "EduPack", ar: "EduPack" }, summary: { en: "AI-assisted SCORM/xAPI generator.", ar: "مولد SCORM/xAPI مدعوم بالذكاء الاصطناعي." }, details: { en: "Automates packaging, metadata, and export checks.", ar: "يؤتمت تجهيز الحزم والبيانات الوصفية وفحوصات التصدير." }, tags: ["ai", "education", "automation"], stack: ["Python", "xAPI", "SCORM", "CLI"], status: "wip", featured: true, complexity: 5, created: "2026-01-28", link: "#", pitch: { en: "EduPack turns instructional files into trackable SCORM/xAPI packages in minutes.", ar: "EduPack يحول ملفات المحتوى إلى حزم SCORM/xAPI قابلة للتتبع خلال دقائق." } },
    { id: "ias", name: { en: "IAS", ar: "IAS" }, summary: { en: "Exam OCR and grading pipeline.", ar: "منظومة OCR وتصحيح اختبارات." }, details: { en: "Combines ingestion, extraction, rubric matching, and review queues.", ar: "يجمع الإدخال والاستخراج وربط المعايير وقائمة المراجعة." }, tags: ["ai", "assessment", "ocr"], stack: ["Python", "OpenCV", "FastAPI"], status: "done", featured: true, complexity: 5, created: "2025-12-15", link: "#", pitch: { en: "IAS accelerates exam grading with rubric consistency.", ar: "IAS يسرع التصحيح مع الحفاظ على اتساق المعايير." } },
    { id: "local-ai-workflow", name: { en: "Local AI Workflow", ar: "سير عمل ذكاء اصطناعي محلي" }, summary: { en: "ComfyUI-based visual generation pipeline.", ar: "خط إنتاج توليدي بصري عبر ComfyUI." }, details: { en: "Runs prompt templates and render queues locally.", ar: "يشغل قوالب الأوامر وقوائم الرندر محليا." }, tags: ["ai", "creative", "workflow"], stack: ["ComfyUI", "Python", "FFmpeg"], status: "wip", featured: false, complexity: 4, created: "2026-02-10", link: "#", pitch: { en: "Local-first AI workflow for rapid visual iteration.", ar: "سير عمل ذكاء اصطناعي محلي لتكرار بصري سريع." } },
    { id: "cli-portfolio", name: { en: "CLI Portfolio", ar: "موقع ملف شخصي CLI" }, summary: { en: "This bilingual terminal-style portfolio website.", ar: "هذا الموقع الثنائي اللغة بنمط الطرفية." }, details: { en: "Static multi-page site with command navigation and themes.", ar: "موقع ثابت متعدد الصفحات مع تنقل بالأوامر وثيمات." }, tags: ["frontend", "portfolio", "cli"], stack: ["HTML", "CSS", "JavaScript"], status: "done", featured: true, complexity: 3, created: "2026-02-27", link: "#", pitch: { en: "A bilingual portfolio that feels like a usable terminal.", ar: "ملف شخصي ثنائي اللغة يعطي تجربة طرفية عملية." } },
    { id: "noise-cancellation-tool", name: { en: "Noise Cancellation Tool", ar: "أداة إزالة الضوضاء" }, summary: { en: "Desktop utility for audio denoising.", ar: "أداة مكتبية لتنقية الصوت." }, details: { en: "Wave preview, presets, and export options.", ar: "معاينة موجية وإعدادات جاهزة وخيارات تصدير." }, tags: ["audio", "desktop", "python"], stack: ["Python", "Tkinter", "NumPy"], status: "done", featured: false, complexity: 2, created: "2025-11-03", link: "#", pitch: { en: "A lightweight desktop tool for cleaning noisy recordings.", ar: "أداة مكتبية خفيفة لتنقية التسجيلات المزعجة." } },
    { id: "ai-study-web-app", name: { en: "AI Study Web App", ar: "تطبيق دراسة بالذكاء الاصطناعي" }, summary: { en: "Learning workspace with chat and adaptive helpers.", ar: "مساحة تعلم تضم محادثة ومساعدات متكيفة." }, details: { en: "Includes revision prompts, quiz generation, and notes.", ar: "يتضمن تذكيرات مراجعة وتوليد اختبارات وملاحظات." }, tags: ["ai", "education", "web"], stack: ["JavaScript", "Node.js", "SQLite"], status: "wip", featured: true, complexity: 4, created: "2026-02-18", link: "#", pitch: { en: "An AI study workspace combining planning and active recall.", ar: "منصة دراسة تجمع التخطيط والاسترجاع النشط بالذكاء الاصطناعي." } }
  ];

  window.PORTFOLIO_DATA = {
    translations,
    profile,
    projects,
    pageMap,
    navStructure,
    commandList: ["help", "home", "philosophy", "cv", "unit", "framework", "reflections", "graduation", "other", "unit1", "unit2", "unit3", "unit4", "unit5", "unit6", "unit7", "unit8", "unit9", "unit10", "other1", "other2", "other3", "other4", "theme", "lang", "clear"],
    themes: ["neon", "amber", "blue", "light"],
    defaultTheme: "neon"
  };
})();
