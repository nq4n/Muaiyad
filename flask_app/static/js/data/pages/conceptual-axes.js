(() => {
  window.PORTFOLIO_PAGE_DATA = window.PORTFOLIO_PAGE_DATA || {};
  window.PORTFOLIO_PAGE_DATA["conceptual-axes"] = {
    shared: {
      linkCatalog: {
        academic_courseware: { href: "#", type: "placeholder" },
        academic_instructional_design_project: { href: "#", type: "placeholder" },
        academic_instructional_design_intro: { href: "#", type: "placeholder" },
        academic_distance_learning_1: { href: "#", type: "placeholder" },
        academic_distance_learning_2: { href: "#", type: "placeholder" },
        academic_full_course_lesson: { href: "#", type: "placeholder" },
        academic_mol: { href: "#", type: "placeholder" },
        academic_tutorial_csharp: { href: "#", type: "placeholder" },
        academic_maintenance_job_aid: { href: "#", type: "placeholder" },
        academic_reflection_paper: { pageId: "reflection-papers", type: "internal" },
        diversity_reflection_paper: { pageId: "reflection-papers", type: "internal" },
        values_reflection_paper: { pageId: "reflection-papers", type: "internal" },
        research_great_learning_certificate: { href: "#", type: "placeholder" },
        research_case_study: { href: "#", type: "placeholder" },
        research_video_participation_certificate: { href: "#", type: "placeholder" },
        research_can_research_study: { href: "#", type: "placeholder" },
        research_reflection_paper: { pageId: "reflection-papers", type: "internal" },
        technology_edupack: { pageId: "graduation-project", type: "internal" },
        technology_exhibition_video: { href: "#", type: "placeholder" },
        technology_packet_tracer: { href: "#", type: "placeholder" },
        technology_ias_analysis: { href: "#", type: "placeholder" },
        technology_medad: { href: "#", type: "placeholder" },
        technology_edumap: { href: "#", type: "placeholder" },
        technology_reflection_paper: { pageId: "reflection-papers", type: "internal" }
      }
    },
    en: {
      hero: {
        title: "Conceptual Framework Axes",
        subtitle: "Unified overview of the framework, its evidence, and the main access point for the page.",
        body: [
          "This page organizes the conceptual framework axes of the College of Education as one coherent overview that brings together academic preparation, teaching practice, reflection, and selected evidence. The sections below are arranged so the reviewer can move through the framework from one unified entry point while still reading each axis as a distinct area of professional growth."
        ],
        access_label: "Unified Access",
        access_hint: "Use this single navigator to move directly to any section on the page.",
        prompt: "$ map conceptual-axes --overview"
      },
      framework: {
        id: "college-framework",
        body: [
          "The college conceptual framework functions as an organizing lens that brings together academic mastery, diversity in teaching, professional values, research culture, and technological skills as interdependent dimensions in teacher preparation. It helps the reviewer read the artifacts as connected indicators of growth rather than isolated tasks."
        ]
      },
      axes: [
        {
          id: "academic-mastery",
          kicker: "Axis 01",
          title: "Academic Mastery",
          body: [
            "This axis reflects deep academic grounding in instructional and learning technology, alongside the ability to translate theoretical knowledge into intentional instructional design decisions. The artifacts demonstrate a clear connection between theory and practice through educational products built on sound academic foundations and prepared for real teaching use."
          ],
          buttons: [
            { ref: "academic_courseware", label: "Courseware Project" },
            { ref: "academic_instructional_design_project", label: "Instructional Design Project" },
            { ref: "academic_instructional_design_intro", label: "Introduction to Instructional Design" },
            { ref: "academic_distance_learning_1", label: "Distance Learning Project 1" },
            { ref: "academic_distance_learning_2", label: "Distance Learning Project 2" },
            { ref: "academic_full_course_lesson", label: "Full Course Lesson Project" },
            { ref: "academic_mol", label: "MOL Project" },
            { ref: "academic_tutorial_csharp", label: "Tutorial C# Video" },
            { ref: "academic_maintenance_job_aid", label: "Maintenance Job Aid" },
            { ref: "academic_reflection_paper", label: "Axis Reflection Paper" }
          ]
        },
        {
          id: "diversity-in-teaching",
          kicker: "Axis 02",
          title: "Diversity in Teaching",
          body: [
            "This axis highlights attention to learner differences and the use of varied teaching strategies that create fair and flexible opportunities for learning. It reflects the ability to adapt instruction to student needs, backgrounds, and characteristics in ways that support meaningful participation across the classroom."
          ],
          buttons: [
            { ref: "diversity_reflection_paper", label: "Axis Reflection Paper" }
          ]
        },
        {
          id: "professional-values",
          kicker: "Axis 03",
          title: "Professional Values and Attitudes",
          body: [
            "This axis represents the professional ethics, responsibility, and commitment that guide educational practice, together with respect for learners and positive relationships within the school environment. It also reflects a reflective professional identity that continually reviews educational decisions and refines practice."
          ],
          buttons: [
            { ref: "values_reflection_paper", label: "Axis Reflection Paper" }
          ]
        },
        {
          id: "research-culture",
          kicker: "Axis 04",
          title: "Research Culture and Lifelong Learning",
          body: [
            "This axis emphasizes the role of research in improving educational practice through observation, evidence, and informed decision making. It also shows how critical and analytical thinking support the interpretation of educational situations while continuous learning remains central to ongoing professional growth."
          ],
          buttons: [
            { ref: "research_great_learning_certificate", label: "Great Learning Certificate" },
            { ref: "research_case_study", label: "Case Study" },
            { ref: "research_video_participation_certificate", label: "Video Participation Certificate" },
            { ref: "research_can_research_study", label: "Research Study from CAN Research Course" },
            { ref: "research_reflection_paper", label: "Axis Reflection Paper" }
          ]
        },
        {
          id: "technological-skills",
          kicker: "Axis 05",
          title: "Technological Skills",
          body: [
            "This axis presents technology as a productive educational tool that goes beyond basic use toward designing, building, and refining digital learning solutions. The included work highlights the move from user to creator, showing how digital tools can support learning, interaction, and the development of purposeful educational resources."
          ],
          buttons: [
            { ref: "technology_edupack", label: "EduPack Graduation Project" },
            { ref: "technology_exhibition_video", label: "Exhibition Video" },
            { ref: "technology_packet_tracer", label: "Packet Tracer Website" },
            { ref: "technology_ias_analysis", label: "IAS Analysis Website" },
            { ref: "technology_medad", label: "Medad Arabic Writing Website" },
            { ref: "technology_edumap", label: "EduMap College Map Website" },
            { ref: "technology_reflection_paper", label: "Axis Reflection Paper" }
          ]
        }
      ]
    },
    ar: {
      hero: {
        title: "محاور الإطار المفاهيمي",
        subtitle: "",
        body: [
          "تنظم هذه الصفحة محاور الإطار المفاهيمي لكلية التربية ضمن عرض واحد مترابط يجمع بين الإعداد الأكاديمي، والممارسة التعليمية، والتأمل، والشواهد المختارة. وقد بُنيت بحيث يبدأ القارئ من مدخل موحد واضح، ثم ينتقل إلى كل محور بوصفه مجالًا مستقلاً يعكس جانبًا محددًا من جوانب النمو المهني."
        ],
        access_label: "الوصول الموحد",
        access_hint: "استخدم نقطة التنقل هذه للوصول مباشرة إلى أي قسم داخل الصفحة.",
        prompt: "$ map conceptual-axes --overview"
      },
      framework: {
        id: "college-framework",
        body: [
          "يمثل الإطار المفاهيمي للكلية مرجعية تنظيمية تجمع بين التمكن الأكاديمي، والتنوع في التدريس، والقيم والتوجهات المهنية، والثقافة البحثية، والمهارات التكنولوجية بوصفها أبعادًا متكاملة في إعداد المعلم. ويساعد هذا التنظيم على قراءة الشواهد لا كأعمال متفرقة، بل كمؤشرات مترابطة على النمو المهني والتطور في الممارسة."
        ]
      },
      axes: [
        {
          id: "academic-mastery",
          kicker: "المحور الأول",
          title: "التمكن الأكاديمي",
          body: [
            "يعكس هذا المحور مستوى التمكن الأكاديمي الذي بُني عبر فهم متعمق للأسس النظرية في تقنيات التعليم والتعلم، والقدرة على تحويل المعرفة التخصصية إلى تصميمات تعليمية مدروسة تستجيب للأهداف والمحتوى وخصائص المتعلمين. وتبرز الأعمال المدرجة فيه الربط بين النظرية والتطبيق، من خلال تطوير موارد ومشروعات تعليمية تستند إلى مبادئ أكاديمية راسخة، وتترجم الفهم المفاهيمي إلى ممارسات ومنتجات قابلة للتوظيف في السياق التعليمي."
          ],
          buttons: [
            { ref: "academic_courseware", label: "مشروع Courseware" },
            { ref: "academic_instructional_design_project", label: "مشروع Instructional Design" },
            { ref: "academic_instructional_design_intro", label: "Introduction to Instructional Design" },
            { ref: "academic_distance_learning_1", label: "مشروع Distance Learning" },
            { ref: "academic_full_course_lesson", label: "مشروع الدرس الكامل للكورس" },
            { ref: "academic_mol", label: "مشروع MOL" },
            { ref: "academic_tutorial_csharp", label: "فيديو Tutorial C#" },
            { ref: "academic_maintenance_job_aid", label: "Job Aid للصيانة" },
            { ref: "academic_reflection_paper", label: "الورقة التأملية للمحور" }
          ]
        },
        {
          id: "diversity-in-teaching",
          kicker: "المحور الثاني",
          title: "التنوع في التدريس",
          body: [
            "يركز هذا المحور على الوعي بالفروق الفردية بين المتعلمين، وعلى توظيف استراتيجيات تدريس متنوعة تتيح فرصًا عادلة ومرنة للتعلم. كما يعكس القدرة على تكييف الممارسات التعليمية وفق احتياجات الطلبة وخلفياتهم وخصائصهم المختلفة، بما يدعم المشاركة الفاعلة ويراعي التنوع داخل البيئة الصفية."
          ],
          buttons: [
            { ref: "diversity_reflection_paper", label: "الورقة التأملية للمحور" }
          ]
        },
        {
          id: "professional-values",
          kicker: "المحور الثالث",
          title: "القيم والتوجهات المهنية",
          body: [
            "يجسد هذا المحور القيم والتوجهات المهنية التي تحكم الممارسة التعليمية، من التزام بالمسؤولية وأخلاقيات المهنة، واحترام للمتعلمين، وبناء علاقات إيجابية داخل البيئة المدرسية. كما يعكس وعيًا بالهوية المهنية التأملية التي تدفع نحو المراجعة المستمرة للمواقف والقرارات التربوية وتحسين أثرها."
          ],
          buttons: [
            { ref: "values_reflection_paper", label: "الورقة التأملية للمحور" }
          ]
        },
        {
          id: "research-culture",
          kicker: "المحور الرابع",
          title: "الثقافة البحثية والتعلم مدى الحياة",
          body: [
            "يبرز هذا المحور أهمية الثقافة البحثية في تطوير الممارسة التعليمية، من خلال الاستناد إلى البيانات والملاحظة والتحليل في فهم المواقف واتخاذ القرارات. كما يعكس توظيف التفكير النقدي والتحليلي في قراءة المشكلات التعليمية، وربط ذلك بالتعلم المستمر والنمو المهني بوصفهما مسارًا دائمًا لتحسين الأداء."
          ],
          buttons: [
            { ref: "research_great_learning_certificate", label: "شهادة Great Learning" },
            { ref: "research_case_study", label: "دراسة حالة" },
            { ref: "research_video_participation_certificate", label: "شهادة مشاركة فيديو" },
            { ref: "research_can_research_study", label: "دراسة بحثية من كورس CAN Research" },
            { ref: "research_reflection_paper", label: "الورقة التأملية للمحور" }
          ]
        },
        {
          id: "technological-skills",
          kicker: "المحور الخامس",
          title: "المهارات التكنولوجية",
          body: [
            "يعرض هذا المحور توظيف التكنولوجيا بوصفها أداة تعليمية منتجة لا تقتصر على الاستخدام، بل تمتد إلى التصميم والبناء والتطوير. وتوضح الأعمال المرتبطة به القدرة على إنشاء موارد وحلول تعلم رقمية تدعم التفاعل والفهم، وتنقل الممارسة من مجرد الاستفادة من الأدوات إلى ابتكار منتجات رقمية تخدم الموقف التعليمي."
          ],
          buttons: [
            { ref: "technology_edupack", label: "مشروع التخرج EduPack" },
            { ref: "technology_exhibition_video", label: "فيديو Exhibition" },
            { ref: "technology_packet_tracer", label: "موقع Packet Tracer" },
            { ref: "technology_ias_analysis", label: "موقع تحليل IAS" },
            { ref: "technology_medad", label: "موقع Medad للكتابة باللغة العربية" },
            { ref: "technology_edumap", label: "موقع EduMap خريطة الكلية" },
            { ref: "technology_reflection_paper", label: "الورقة التأملية للمحور" }
          ]
        }
      ]
    }
  };
})();
