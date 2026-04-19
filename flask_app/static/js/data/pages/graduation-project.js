(() => {
  window.PORTFOLIO_PAGE_DATA = window.PORTFOLIO_PAGE_DATA || {};

  const liveProjectHref = "https://nq4n.github.io/research-proejct/";
  const repoHref = "https://github.com/nq4n/research-proejct";
  const logoSrc = "https://raw.githubusercontent.com/nq4n/research-proejct/main/LOGO.png";

  window.PORTFOLIO_PAGE_DATA["graduation-project"] = {
    en: {
      hero: {
        kicker: "Graduation Project",
        title: "Virtual Lab For Computer Maintenance",
        logo_src: logoSrc,
        logo_alt: "Virtual Lab logo",
        subtitle: [
          "This page presents the graduation project through the platform itself rather than through generic description. The project is a digital learning environment called Virtual Lab, designed to simplify computer maintenance concepts and present them through guided lessons and practical interaction.",
          "The page focuses on the platform, the purpose behind it, the learning services it provides, and the reflection gained from building it as an educational product."
        ],
        actions_label: "Graduation project actions",
        actions: [
          {
            label: "Open Platform",
            href: liveProjectHref,
            kind: "primary"
          },
          {
            label: "View Source",
            href: repoHref,
            kind: "secondary"
          },
          {
            label: "Word Document",
            href: "#",
            kind: "document",
            pending: true
          },
          {
            label: "PDF Report",
            href: "#",
            kind: "document",
            pending: true
          }
        ],
        panel_label: "Project Identity",
        panel_title: "A web learning platform with a desktop classroom build",
        panel_body: [
          "The public version is delivered as a web platform, while the repository also contains an Electron desktop wrapper for classroom deployment and local tracking of student progress."
        ],
        stats: [
          {
            label: "Format",
            value: "Public web platform and Electron desktop build"
          },
          {
            label: "Learning scope",
            value: "Four lesson areas plus an interactive practice lab"
          },
          {
            label: "Technology",
            value: "HTML, CSS, JavaScript, Three.js, Electron"
          },
          {
            label: "Main audience",
            value: "Learners studying computer maintenance in a guided format"
          }
        ]
      },
      platform: {
        title: "Platform",
        body: [
          "Virtual Lab is an educational platform built around the idea that computer maintenance should be understood as a sequence of connected decisions rather than isolated definitions. The homepage of the platform organizes the learning journey into four lesson pages: introduction, hardware, software, and data protection, followed by a practice lab page.",
          "The repository also shows that the project is not only a static website. It includes configurable lesson data, visual motion settings, and an Electron desktop build that serves the same content inside a classroom-friendly application."
        ]
      },
      purpose: {
        title: "Purpose",
        body: [
          "The main purpose of the project is to make technical maintenance content more accessible and easier to practice. Instead of presenting the topic through long explanation alone, the platform guides the learner through short focused lessons, visual cues, and interactive activities that reduce cognitive overload.",
          "A second purpose is to connect theory with application. The platform turns maintenance ideas such as heat, power, upgrades, storage, and protection into learning tasks that can be explored visually and, in some cases, manipulated inside a simulated lab environment."
        ]
      },
      offers: {
        title: "What The Platform Offers",
        intro: [
          "The project offers more than a page sequence. Its structure shows a deliberate attempt to combine instructional clarity, interaction, and classroom usability."
        ],
        cards: [
          {
            title: "Structured lesson dashboard",
            body: [
              "The learner starts from a clear dashboard that leads into the four lesson areas in a direct and understandable order."
            ]
          },
          {
            title: "Interactive practice lab",
            body: [
              "The practice lab page extends the explanation into experimentation, so learners can test ideas instead of only reading them."
            ]
          },
          {
            title: "3D assembly and component logic",
            body: [
              "The hardware configuration includes a 3D model workflow that links motherboard, power supply, RAM, GPU, and case structure to maintenance decisions."
            ]
          },
          {
            title: "Teacher-editable configuration",
            body: [
              "Lesson visibility, motion behavior, and part of the instructional flow can be adjusted through configuration files without rebuilding the whole project structure."
            ]
          },
          {
            title: "Desktop classroom tracking",
            body: [
              "The Electron build adds local progress handling and student tracking, which makes the project more practical for guided classroom deployment."
            ]
          },
          {
            title: "Arabic-first instructional presentation",
            body: [
              "The live project is designed around Arabic learning flow and clear step guidance, which supports direct use with its target learners."
            ]
          }
        ]
      },
      reflection: {
        title: "Reflection",
        body: [
          "Building this project highlights that effective educational technology is not only about visual polish. The stronger achievement lies in turning complex maintenance content into a sequence that feels learnable, purposeful, and less intimidating for students.",
          "The project also shows the value of designing for more than one delivery context. Creating both a public web version and a desktop classroom build reflects awareness that real educational use depends on accessibility, control, and continuity of learner data."
        ],
        points: [
          "The project reinforced the need to simplify technical content without flattening its meaning.",
          "It demonstrated that interactivity becomes valuable when it supports a learning decision, not when it exists only for decoration.",
          "It confirmed that educational design improves when the platform is built around learner flow, not just around content storage."
        ]
      },
      resources: {
        title: "Project Links",
        body: [
          "The live platform and repository are available now. Dedicated Word and PDF report buttons are prepared in this page layout, but the linked repository does not currently expose public report files, so those two buttons are kept ready for final attachment."
        ],
        items: [
          {
            kind: "Live Project",
            title: "Open the public platform",
            note: "Launch the published web version of Virtual Lab.",
            href: liveProjectHref
          },
          {
            kind: "Source Code",
            title: "Open the GitHub repository",
            note: "Review the implementation, lesson configuration, and desktop wrapper files.",
            href: repoHref
          },
          {
            kind: "Word",
            title: "Word document link",
            note: "Attach the final Word report URL here when it is published.",
            href: "#",
            pending: true
          },
          {
            kind: "PDF",
            title: "PDF document link",
            note: "Attach the exported PDF report URL here when it is published.",
            href: "#",
            pending: true
          }
        ]
      }
    },
    ar: {
      hero: {
        kicker: "مشروع التخرج",
        title: "المختبر الافتراضي لصيانة الحاسوب",
        logo_src: logoSrc,
        logo_alt: "شعار المختبر الافتراضي",
        subtitle: [
          "تعرض هذه الصفحة مشروع التخرج من خلال المنصة نفسها لا من خلال وصف عام فقط. يتمثل المشروع في بيئة تعلم رقمية باسم المختبر الافتراضي، وقد صُممت لتبسيط مفاهيم صيانة الحاسوب وتقديمها عبر دروس موجهة وتفاعل عملي.",
          "يركز هذا العرض على المنصة، والغاية التعليمية منها، وما توفره من خدمات تعلمية، ثم التأملات التي نتجت عن بنائها بوصفها منتجاً تعليمياً."
        ],
        actions_label: "روابط مشروع التخرج",
        actions: [
          {
            label: "فتح المنصة",
            href: liveProjectHref,
            kind: "primary"
          },
          {
            label: "عرض المصدر",
            href: repoHref,
            kind: "secondary"
          },
          {
            label: "ملف وورد",
            href: "#",
            kind: "document",
            pending: true
          },
          {
            label: "ملف PDF",
            href: "#",
            kind: "document",
            pending: true
          }
        ],
        panel_label: "هوية المشروع",
        panel_title: "منصة تعلم ويب مع نسخة سطح مكتب للاستخدام الصفي",
        panel_body: [
          "تتوفر النسخة العامة بوصفها منصة ويب، كما يتضمن المستودع نسخة سطح مكتب مبنية بـ Electron للاستخدام داخل الصف مع تتبع محلي لتقدم الطلبة."
        ],
        stats: [
          {
            label: "الصيغة",
            value: "منصة ويب عامة ونسخة سطح مكتب عبر Electron"
          },
          {
            label: "نطاق التعلم",
            value: "أربعة دروس مع مختبر تفاعلي للتدريب"
          },
          {
            label: "التقنيات",
            value: "HTML وCSS وJavaScript وThree.js وElectron"
          },
          {
            label: "الفئة المستهدفة",
            value: "متعلمين يدرسون صيانة الحاسوب ضمن مسار موجه"
          }
        ]
      },
      platform: {
        title: "المنصة",
        body: [
          "المختبر الافتراضي منصة تعليمية تقوم على فكرة أن صيانة الحاسوب ينبغي أن تُفهم بوصفها سلسلة من القرارات المترابطة لا مجرد تعريفات منفصلة. وتنظم الصفحة الرئيسة رحلة التعلم في أربع صفحات درسية هي: المقدمة، والعتاد، والبرمجيات، وحماية البيانات، ثم صفحة للمختبر العملي.",
          "كما يبين المستودع أن المشروع ليس موقعاً ثابتاً فقط؛ بل يتضمن ملفات إعداد قابلة للتعديل للدروس، وإعدادات للحركة والعرض البصري، إلى جانب نسخة سطح مكتب تقدم المحتوى نفسه في تطبيق أكثر ملاءمة للتوظيف الصفي."
        ]
      },
      purpose: {
        title: "الغاية",
        body: [
          "تتمثل الغاية الرئيسة للمشروع في جعل محتوى الصيانة التقني أكثر سهولة في الفهم والممارسة. فبدلاً من تقديم الموضوع عبر شرح طويل فقط، تقود المنصة المتعلم خلال دروس قصيرة مركزة، ومؤشرات بصرية، وأنشطة تفاعلية تقلل العبء المعرفي.",
          "وتتمثل غاية ثانية في ربط الجانب النظري بالتطبيق. إذ تحول المنصة أفكاراً مثل الحرارة والطاقة والترقية والتخزين والحماية إلى مهام تعلمية يمكن استكشافها بصرياً، وفي بعض المواضع يمكن التعامل معها داخل مختبر محاكى."
        ]
      },
      offers: {
        title: "ما الذي تقدمه المنصة",
        intro: [
          "لا يقتصر المشروع على تسلسل صفحات فقط، بل يكشف بناؤه عن محاولة واضحة للجمع بين وضوح التصميم التعليمي، والتفاعل، وإمكانية الاستخدام داخل الصف."
        ],
        cards: [
          {
            title: "لوحة دروس منظمة",
            body: [
              "يبدأ المتعلم من لوحة واضحة تقوده إلى مجالات الدروس الأربعة بترتيب مباشر يسهل تتبعه."
            ]
          },
          {
            title: "مختبر تفاعلي للتدريب",
            body: [
              "تمتد صفحة المختبر من الشرح إلى التجريب، بحيث يختبر المتعلم الأفكار عملياً بدلاً من الاكتفاء بالقراءة."
            ]
          },
          {
            title: "تجميع ثلاثي الأبعاد ومنطق المكونات",
            body: [
              "يتضمن إعداد درس العتاد مساراً ثلاثي الأبعاد يربط اللوحة الأم ومزود الطاقة والذاكرة وبطاقة الشاشة والهيكل بقرارات الصيانة."
            ]
          },
          {
            title: "إعدادات قابلة للتعديل من قبل المعلم",
            body: [
              "يمكن تعديل ظهور أجزاء الدرس، وسلوك الحركة، وبعض مسار التعلم عبر ملفات إعداد دون الحاجة إلى إعادة بناء المشروع كاملاً."
            ]
          },
          {
            title: "تتبع صفي في نسخة سطح المكتب",
            body: [
              "تضيف نسخة Electron معالجة محلية لتقدم الطلبة، مما يجعل المشروع أكثر عملية عند استخدامه في التطبيق الصفي الموجه."
            ]
          },
          {
            title: "عرض تعليمي عربي موجه",
            body: [
              "صُممت النسخة المنشورة حول تدفق تعلم عربي واضح وخطوات إرشادية مباشرة، بما يدعم الاستخدام الفعلي مع الفئة المستهدفة."
            ]
          }
        ]
      },
      reflection: {
        title: "التأمل",
        body: [
          "يبين بناء هذا المشروع أن قيمة التقنية التعليمية لا تتحقق من خلال الشكل البصري فقط، بل من خلال القدرة على تحويل محتوى صيانة الحاسوب المعقد إلى مسار يبدو قابلاً للتعلم وأكثر وضوحاً للطالب.",
          "كما يكشف المشروع أهمية التصميم لأكثر من سياق استخدام. فوجود نسخة ويب عامة ونسخة سطح مكتب صفية يعكس وعياً بأن التوظيف التعليمي الواقعي يعتمد على سهولة الوصول، وإدارة الاستخدام، واستمرارية بيانات المتعلم."
        ],
        points: [
          "أكد المشروع ضرورة تبسيط المحتوى التقني من غير الإخلال بمعناه العلمي.",
          "وأظهر أن التفاعل يصبح ذا قيمة عندما يخدم قراراً تعلمياً، لا عندما يكون مجرد عنصر زخرفي.",
          "كما أكد أن التصميم التعليمي يتحسن عندما يُبنى حول تدفق المتعلم لا حول تخزين المحتوى فقط."
        ]
      },
      resources: {
        title: "روابط المشروع",
        body: [
          "المنصة المنشورة والمستودع البرمجي متاحان الآن. وقد جُهز في هذه الصفحة مكان مخصص لزر ملف الوورد وزر ملف PDF، لكن المستودع المرتبط لا يعرض حالياً ملفات تقرير عامة، لذلك تُرك الزران جاهزين لإرفاق الرابط النهائي لاحقاً."
        ],
        items: [
          {
            kind: "المنصة",
            title: "فتح النسخة المنشورة",
            note: "الانتقال إلى النسخة العامة المنشورة من المختبر الافتراضي.",
            href: liveProjectHref
          },
          {
            kind: "المصدر",
            title: "فتح مستودع GitHub",
            note: "مراجعة ملفات التنفيذ، وإعدادات الدروس، ونسخة سطح المكتب.",
            href: repoHref
          },
          {
            kind: "وورد",
            title: "رابط ملف وورد",
            note: "يمكن إرفاق رابط التقرير النهائي بصيغة وورد هنا عند نشره.",
            href: "#",
            pending: true
          },
          {
            kind: "PDF",
            title: "رابط ملف PDF",
            note: "يمكن إرفاق رابط نسخة PDF النهائية هنا عند توفرها.",
            href: "#",
            pending: true
          }
        ]
      }
    }
  };
})();
