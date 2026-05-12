(() => {
  window.PORTFOLIO_PAGE_DATA = window.PORTFOLIO_PAGE_DATA || {};

  const docs = {
    announcement: "/static/docs/workshop-announcement.html",
    planning: "/static/docs/workshop-planning.html",
    survey: "https://docs.google.com/forms/d/e/1FAIpQLSfLF0wO8Ym1sNDjkdTVgGzKxpF2ICn-lx9G67YBjPhx6-Aplg/viewform?usp=header",
    guide: "/static/docs/workshop-guide.html",
    presentation: "https://canva.link/j1bf3j4f9fwkanl",
    publication: "/static/docs/workshop-publication-report.html",
    video: "/static/docs/workshop-video.html",
    evaluation: "https://docs.google.com/forms/d/e/1FAIpQLSdG2xqG6b-7q6yf1MnMsbk7QhhQnh3aIrkb_SvjuQ_5OjxuEw/viewform?usp=publish-editor",
    summary: "/static/docs/workshop-summary.html"
  };

  const workshopSnippets = {
    href: "https://drive.google.com/drive/folders/1DU0Hb5nztl2QzUzL8Fzbelt0z7JStOGk?usp=drive_link",
    driveFolderId: "1DU0Hb5nztl2QzUzL8Fzbelt0z7JStOGk"
  };

  const resourceGrid = (items) => `
    <div class="workshop-resource-grid">
      ${items.map((item) => {
        if (item.href) {
          const driveAttr = item.driveFolderId ? ` data-drive-folder-id="${item.driveFolderId}"` : "";
          return `
            <a class="workshop-resource-card workshop-resource-card--link" href="${item.href}" data-embed-title="${item.embedTitle || item.label}"${driveAttr}>
              <span class="workshop-resource-dot" aria-hidden="true"></span>
              <span class="workshop-resource-label">${item.label}</span>
            </a>
          `;
        }
        return `
          <button class="workshop-resource-card" type="button" aria-label="${item.label}" data-workshop-modal="${item.modal}">
            <span class="workshop-resource-dot" aria-hidden="true"></span>
            <span class="workshop-resource-label">${item.label}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;

  const modal = ({ slug, title, eyebrow, body, href, linkLabel, lang = "ar" }) => {
    const isAr = lang === "ar";
    const sourceAction = href
      ? `
          <div class="resource-actions resource-actions--single">
            <a class="resource-action" href="${href}" target="_blank" rel="noopener noreferrer" data-bypass-embed="true">
              <span class="resource-action__icon" aria-hidden="true">&#8599;</span>
              <span class="resource-action__label">${linkLabel}</span>
            </a>
          </div>
        `
      : "";
    return `
      <div class="workshop-inline-modal" id="workshop-modal-${slug}" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="workshop-modal-title-${slug}">
        <div class="workshop-inline-modal__backdrop" data-workshop-modal-close></div>
        <div class="workshop-inline-modal__dialog terminal-card" lang="${isAr ? "ar" : "en"}" dir="${isAr ? "rtl" : "ltr"}">
          <div class="workshop-inline-modal__header">
            <div>
              <p class="workshop-inline-modal__eyebrow">${eyebrow}</p>
              <h3 id="workshop-modal-title-${slug}">${title}</h3>
            </div>
            <button class="icon-btn workshop-inline-modal__close" type="button" data-workshop-modal-close aria-label="${isAr ? "إغلاق" : "Close"}">&times;</button>
          </div>
          <div class="workshop-planning-paper">${body}</div>
          ${sourceAction}
        </div>
      </div>
    `;
  };

  const planningBody = `
    <section class="workshop-planning-cover">
      <h2>تخطيط الورشة</h2>
      <p>عمل: مؤيد سليمان الحسني</p>
      <p>الرقم الجامعي: 136629</p>
      <p>مشرف المقرر: د. سامح سعيد</p>
      <p>المقرر: التدريب الميداني</p>
    </section>
    <section>
      <h4>عنوان الورشة</h4>
      <p>التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms</p>
    </section>
    <section>
      <h4>نبذه عن الورشة</h4>
      <p>تهدف ورشة "التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms" إلى تعريف المعلمين بكيفية استخدام أدوات التقويم الإلكتروني في تصميم الاختبارات والأنشطة التعليمية بصورة رقمية تساعد على تسهيل عملية جمع البيانات وتحليل نتائج المتعلمين. تركز الورشة على منصة Google Forms التي تتيح للمعلم إنشاء نماذج تقويم إلكترونية بسهولة، وإدارة الاستجابات، وتحليل الأداء من خلال الرسوم البيانية والإحصائيات المتوفرة داخل المنصة، مما يساعد في تحسين عملية التدريس واتخاذ قرارات تعليمية أكثر فاعلية.</p>
      <p>كما تتضمن الورشة خطوات عملية لاستخدام المنصة بدءًا من إنشاء النموذج وحتى مشاركة الرابط وتحليل النتائج، بالإضافة إلى استعراض أهمية التقويم الإلكتروني في البيئة التعليمية الحديثة، وتقديم تطبيقات عملية تساعد المعلمين على توظيف الأداة داخل الصف الدراسي.</p>
    </section>
    <section>
      <h4>نموذج التصميم التعليمي</h4>
      <p>تم استخدام نموذج ADDIE في تصميم الورشة، ويتضمن خمس مراحل كما يلي:</p>
    </section>
    <section>
      <h4>مرحلة التحليل</h4>
      <h5>1. تحليل احتياجات الورشة</h5>
      <p>معمل حاسوب – جهاز عرض – شبكة إنترنت – كراسي وطاولات – سبورة – أجهزة حاسوب – عرض تقديمي – المادة التدريبية – حساب Gmail نشط – متصفح جوجل كروم.</p>
      <h5>2. المتعلمون</h5>
      <p>الفئة المستهدفة هم المعلمون في المدرسة من مختلف التخصصات. تختلف مستويات خبرتهم التقنية، حيث يوجد من يمتلك خبرة جيدة في استخدام الأدوات الرقمية، ومن هم بحاجة إلى دعم إضافي في استخدام أدوات التقويم الإلكتروني وتحليل البيانات التعليمية.</p>
      <p><strong>خصائص خاصة:</strong> معلمون تتراوح أعمارهم بين 25 – 50 سنة.</p>
      <p><strong>الخصائص العامة للمتعلمين:</strong></p>
      <ul>
        <li>تتراوح خبراتهم التقنية بين المبتدئة والمتوسطة.</li>
        <li>لديهم دافعية لتطوير أساليب التدريس والتقويم باستخدام التقنيات الحديثة.</li>
        <li>يمتلك معظمهم مهارات أساسية في استخدام الحاسوب وتصفح الإنترنت.</li>
        <li>لديهم رغبة في توظيف الأدوات الرقمية لتحسين العملية التعليمية.</li>
        <li>يتمتعون بدافعية لتجريب أدوات وتقنيات جديدة في التعليم.</li>
      </ul>
      <h5>3. الأهداف التعليمية</h5>
      <p>بعد الانتهاء من الورشة سوف يكون المعلم قادرًا على أن:</p>
      <ol>
        <li>يعرّف مفهوم التقويم الإلكتروني ودوره في العملية التعليمية.</li>
        <li>يشرح أهمية استخدام Google Forms في تصميم أدوات التقويم.</li>
        <li>يميز خصائص ومزايا Google Forms في إنشاء النماذج الإلكترونية.</li>
        <li>ينشئ نموذج تقويم إلكتروني باستخدام Google Forms بصورة صحيحة.</li>
        <li>يطبق خطوات إضافة الأسئلة وإعدادات النموذج المختلفة.</li>
        <li>يحلل نتائج الاستجابات والرسوم البيانية داخل Google Forms.</li>
        <li>يوظف نتائج التقويم الإلكتروني في تحسين التدريس واتخاذ القرارات التعليمية.</li>
      </ol>
      <h5>4. البيئة التعليمية</h5>
      <p>سوف يتم تنفيذ الورشة في مركز مصادر التعلم أو في معمل الحاسوب بالمدرسة.</p>
      <h5>5. محتوى الورشة</h5>
      <p>سيتم تقديم الورشة من خلال عرض تقديمي يتضمن الجانب النظري للتقويم الإلكتروني، ثم الانتقال إلى التطبيق العملي عبر منصة Google Forms، حيث يقوم المعلمون بإنشاء نماذج تقويم إلكترونية وتجربة تحليل نتائج الاستجابات بصورة عملية.</p>
      <div class="training-needs-gallery">
        <p class="training-needs-note">توضح الرسوم الآتية نتائج استبانة الاحتياجات التدريبية، وتعرض مستوى الاحتياج في كل محور وتخصصات المشاركين الذين استجابوا للاستبانة.</p>
        <figure class="training-needs-chart training-needs-chart--animated">
          <img src="/static/img/training-needs/needs-by-axis.webp" alt="رسم بياني يوضح الاحتياجات التدريبية حسب المحاور." loading="lazy">
          <figcaption>الاحتياجات التدريبية حسب المحاور</figcaption>
        </figure>
        <figure class="training-needs-chart training-needs-chart--animated">
          <img src="/static/img/training-needs/respondents-by-specialty.webp" alt="رسم دائري يوضح تخصصات المشاركين في الاستبانة." loading="lazy">
          <figcaption>تخصصات المشاركين في الاستبانة</figcaption>
        </figure>
      </div>
    </section>
    <section>
      <h4>مرحلة التصميم</h4>
      <p><strong>الهدف العام من الورشة:</strong> تمكين المعلمين من تصميم أدوات تقويم إلكترونية وتحليل نتائج الأداء باستخدام Google Forms لدعم عملية التدريس وتحسين اتخاذ القرارات التعليمية.</p>
      <p><strong>الوسائل المستخدمة في الورشة:</strong> عرض تقديمي – منصة Google Forms – إعلان الورشة – صور توضيحية – نماذج تقويم إلكترونية – جهاز عرض – متصفح جوجل كروم – أجهزة حاسوب – شبكة إنترنت.</p>
      <p>إعلان الورشة</p>
    </section>
    <section>
      <h4>مرحلة التطوير</h4>
      <p>قمت بإعداد محتوى شامل للورشة بعنوان "التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms"، حيث تم تجهيز العرض التقديمي والأنشطة العملية والأمثلة التطبيقية التي تساعد المعلمين على إنشاء نماذج تقويم إلكترونية وتحليل نتائج الاستجابات بصورة عملية.</p>
      <p>كما تم إعداد نماذج تطبيقية توضح كيفية إنشاء الأسئلة، وتفعيل إعدادات النموذج، وقراءة الرسوم البيانية ونتائج الأداء داخل Google Forms.</p>
      <div class="resource-actions resource-actions--single">
        <a class="resource-action" href="https://canva.link/j1bf3j4f9fwkanl" target="_blank" rel="noopener noreferrer" data-bypass-embed="true">
          <span class="resource-action__icon" aria-hidden="true">&#8599;</span>
          <span class="resource-action__label">فتح العرض التقديمي في Canva</span>
        </a>
      </div>
    </section>
    <section>
      <h4>مرحلة التطبيق</h4>
      <p>قام المعلمون بإنشاء نماذج تقويم إلكترونية باستخدام Google Forms تضمنت أنواعًا مختلفة من الأسئلة بما يتناسب مع تخصصاتهم الدراسية. كما قاموا بتجربة إرسال النماذج وتحليل الاستجابات والاطلاع على الرسوم البيانية والإحصائيات المتوفرة داخل المنصة، ثم مناقشة كيفية الاستفادة من نتائج التقويم في تحسين التدريس وتقديم التغذية الراجعة للمتعلمين.</p>
    </section>
    <section>
      <h4>مرحلة التقييم</h4>
      <p>يهدف التقييم إلى معرفة مدى استفادة المعلمين من استخدام Google Forms في تصميم أدوات التقويم الإلكتروني وتحليل نتائج الأداء، بالإضافة إلى تحديد الجوانب التي يمكن تطويرها وتحسينها مستقبلاً. بعد انتهاء الورشة، تمت مشاركة نموذج تقييم إلكتروني مع المشاركين لجمع آرائهم وملاحظاتهم حول محتوى الورشة والتطبيق العملي ومدى الاستفادة منها.</p>
    </section>
  `;

  const simpleBody = {
    announcement: `
      <section>
        <h4>إعلان الورشة</h4>
        <p>يتضمن الإعلان عنوان الورشة، الهدف منها، الفئة المستهدفة، ومحاور التدريب الأساسية. يعرض الإعلان موضوع التقويم الإلكتروني وتحليل الأداء بطريقة مختصرة تساعد المعلمين على معرفة قيمة الحضور.</p>
        <figure class="training-needs-chart training-needs-chart--animated">
          <img src="/static/img/workshop.webp" alt="إعلان الورشة التدريبية" loading="lazy">
          <figcaption>إعلان الورشة التدريبية</figcaption>
        </figure>
      </section>
    `,
    survey: `
      <section>
        <h4>استطلاع الورشة</h4>
        <p>يعرض هذا المرفق بيانات استبانة تحديد الاحتياجات التدريبية للمعلمين، وهي البيانات التي تم الاعتماد عليها في اختيار موضوع الورشة وتحديد أولوياتها.</p>
        <p>تم استخدام نتائج الاستبانة لإبراز الحاجة إلى موضوعات مثل تصميم العروض التفاعلية، توظيف الذكاء الاصطناعي، والتقويم الإلكتروني وتحليل الأداء.</p>
      </section>
    `,
    guide: `
      <section>
        <h4>دليل الورشة</h4>
        <p>يوضح الدليل خطوات إنشاء نموذج تقويم إلكتروني باستخدام Google Forms، وإضافة الأسئلة، وضبط الإعدادات، ومشاركة النموذج، وتحليل الاستجابات.</p>
        <p>يركز الدليل على تحويل التقويم من نشاط ورقي محدود إلى أداة رقمية تساعد المعلم على جمع الاستجابات بسرعة، ومراجعة النتائج بصورة منظمة، ثم اتخاذ قرارات تعليمية مبنية على بيانات واضحة.</p>
      </section>
      <section>
        <h5>محاور الدليل</h5>
        <ul>
          <li>تعريف التقويم الإلكتروني.</li>
          <li>إنشاء نموذج جديد.</li>
          <li>إضافة أنواع مختلفة من الأسئلة.</li>
          <li>قراءة الرسوم البيانية وملخص الردود.</li>
          <li>توظيف النتائج في تحسين التدريس.</li>
        </ul>
      </section>
      <section>
        <h5>خطوات التطبيق داخل الورشة</h5>
        <ol>
          <li>الدخول إلى Google Forms من حساب Gmail نشط.</li>
          <li>اختيار نموذج جديد وتحديد عنوان واضح يرتبط بهدف التقويم.</li>
          <li>إضافة أسئلة متنوعة مثل الاختيار من متعدد، الإجابة القصيرة، ومربعات الاختيار.</li>
          <li>ضبط إعدادات النموذج، وجعل الأسئلة المهمة إلزامية، وتحديد آلية جمع الردود.</li>
          <li>مشاركة رابط النموذج مع المشاركين وتجربة تعبئته بصورة عملية.</li>
          <li>قراءة ملخص الاستجابات والرسوم البيانية، ثم مناقشة دلالة النتائج تربويا.</li>
        </ol>
      </section>
      <section>
        <h5>مخرجات متوقعة من الدليل</h5>
        <ul>
          <li>قدرة المعلم على بناء أداة تقويم إلكترونية بسيطة ومنظمة.</li>
          <li>فهم طريقة متابعة الاستجابات وتحليلها دون الحاجة إلى معالجة يدوية طويلة.</li>
          <li>توظيف البيانات في تحديد مواطن القوة والاحتياج لدى المتعلمين.</li>
          <li>تحسين التغذية الراجعة وربطها بنتائج التقويم الفعلية.</li>
        </ul>
      </section>
    `,
    presentation: `
      <section>
        <h4>العرض التقديمي للورشة</h4>
        <p>ينظم العرض التقديمي محتوى الورشة في شرائح تبدأ بمفهوم التقويم الإلكتروني، ثم مزايا Google Forms، ثم خطوات التطبيق العملي وتحليل النتائج.</p>
        <p>صمم العرض لدعم الشرح المباشر والتطبيق العملي داخل معمل الحاسوب.</p>
      </section>
    `,
    publication: `
      <section>
        <h4>تقرير نشر الورشة</h4>
        <p>يوثق هذا التقرير تنفيذ ورشة التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms، ويعرض هدف الورشة والفئة المستهدفة ومحاور التنفيذ وتفاعل المشاركين والنتائج المهنية المتوقعة.</p>
        <p>ركزت الورشة على التطبيق العملي، حيث قام المشاركون بإنشاء نماذج إلكترونية وتحليل الاستجابات والرسوم البيانية الناتجة.</p>
      </section>
      <section>
        <h5>بيانات الورشة</h5>
        <ul>
          <li><strong>عنوان الورشة:</strong> التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms.</li>
          <li><strong>الفئة المستهدفة:</strong> معلمو المدرسة من تخصصات مختلفة.</li>
          <li><strong>نمط التنفيذ:</strong> عرض موجز، شرح تطبيقي، تدريب عملي، ومناقشة ختامية.</li>
          <li><strong>الأدوات المستخدمة:</strong> أجهزة الحاسوب، جهاز العرض، شبكة الإنترنت، حسابات Gmail، ومنصة Google Forms.</li>
        </ul>
      </section>
      <section>
        <h5>هدف النشر</h5>
        <p>يهدف نشر الورشة إلى توثيق نشاط النمو المهني وإبراز أثره في تطوير ممارسات التقويم لدى المعلمين، إضافة إلى مشاركة تجربة قابلة للتطبيق في بيئات صفية مختلفة.</p>
        <p>كما يوضح التقرير أن الورشة لم تكن مجرد عرض تعريفي بالأداة، بل كانت ممارسة تدريبية مرتبطة باحتياج مهني واضح وبمخرجات يمكن ملاحظتها في تصميم أدوات التقويم وتحليل نتائجها.</p>
      </section>
      <section>
        <h5>محاور التنفيذ</h5>
        <ol>
          <li>التمهيد لمفهوم التقويم الإلكتروني وأهميته في التعليم.</li>
          <li>عرض مزايا Google Forms في جمع البيانات وتنظيمها.</li>
          <li>شرح خطوات إنشاء نموذج تقويم إلكتروني.</li>
          <li>تنفيذ نشاط عملي لإنشاء نموذج وتجربة الإجابة عنه.</li>
          <li>تحليل الاستجابات ومناقشة كيفية الاستفادة من الرسوم البيانية.</li>
          <li>ربط النتائج بقرارات التدريس والتغذية الراجعة.</li>
        </ol>
      </section>
      <section>
        <h5>الأثر المهني المتوقع</h5>
        <p>أسهمت الورشة في دعم توجه المعلمين نحو استخدام أدوات رقمية بسيطة وفعالة في التقويم، وساعدت على توضيح العلاقة بين تصميم السؤال، وجودة البيانات، ودقة القرار التعليمي.</p>
        <p>ومن المتوقع أن ينعكس أثر الورشة في قدرة المشاركين على إعداد نماذج تقويم إلكترونية أكثر تنظيما، ومتابعة استجابات المتعلمين بصورة أسرع، وتقديم تغذية راجعة مبنية على نتائج واضحة.</p>
      </section>
    `,
    video: `
      <section>
        <h4>فيديو الورشة</h4>
        <p>يوثق فيديو الورشة أهم لحظات التنفيذ، ويعرض فكرة الورشة ومحاورها والتطبيق العملي الخاص بإنشاء نماذج التقويم وتحليل الاستجابات.</p>
      </section>
    `,
    evaluation: `
      <section>
        <h4>نموذج تقييم الورشة</h4>
        <p>يستخدم نموذج التقييم لجمع آراء المشاركين حول وضوح أهداف الورشة، جودة المحتوى، فائدة التطبيق العملي، ومدى إمكانية توظيف ما تعلموه في الممارسة الصفية.</p>
      </section>
    `,
    summary: `
      <section>
        <h4>ملخص الورشة</h4>
        <p>تناولت الورشة توظيف Google Forms في تصميم أدوات التقويم الإلكتروني وتحليل نتائج الأداء. ساعدت الورشة المعلمين على إنشاء نماذج تقويم رقمية، ومتابعة الاستجابات، وقراءة الرسوم البيانية، والاستفادة من النتائج في تحسين التدريس.</p>
        <p>تبرز أهمية الورشة في ربط التقويم بالبيانات، وتحويل نتائج المتعلمين إلى مؤشرات تساعد المعلم على اتخاذ قرارات تعليمية أكثر فاعلية.</p>
      </section>
      <section>
        <h5>فكرة الورشة</h5>
        <p>انطلقت الورشة من حاجة المعلمين إلى أدوات تقويم مرنة وسهلة الاستخدام، تساعدهم على جمع البيانات وتحليلها بسرعة. لذلك ركزت على Google Forms بوصفها أداة متاحة يمكن توظيفها في الاختبارات القصيرة، الاستبانات، أنشطة التحقق من الفهم، والتغذية الراجعة.</p>
      </section>
      <section>
        <h5>أبرز ما تم تناوله</h5>
        <ul>
          <li>مفهوم التقويم الإلكتروني ودوره في تحسين التعلم.</li>
          <li>تصميم نموذج تقويم واضح الهدف ومناسب للفئة المستهدفة.</li>
          <li>إضافة أنواع متعددة من الأسئلة وربطها بمخرجات التعلم.</li>
          <li>مشاركة النموذج مع المتعلمين أو المشاركين بطريقة منظمة.</li>
          <li>قراءة ملخص الردود والرسوم البيانية داخل Google Forms.</li>
          <li>استخدام النتائج لتحديد نقاط القوة والاحتياج ووضع إجراءات تحسين.</li>
        </ul>
      </section>
      <section>
        <h5>القيمة التعليمية</h5>
        <p>تظهر قيمة الورشة في أنها جعلت التقويم أكثر ارتباطا بالقرار التعليمي؛ فالمعلم لا يكتفي بجمع الإجابات، بل يقرأ النتائج، ويقارن بين أنماط الأداء، ثم يحدد ما يحتاج إلى إعادة شرح أو تعزيز أو نشاط علاجي.</p>
        <p>كما دعمت الورشة جانب النمو المهني من خلال تدريب عملي قابل للتكرار، يمكن للمعلم نقله مباشرة إلى الصف أو استخدامه في أنشطة مدرسية أخرى.</p>
      </section>
      <section>
        <h5>خلاصة التأمل</h5>
        <p>أكدت الورشة أن الأدوات الرقمية تصبح أكثر فاعلية عندما تستخدم ضمن هدف تربوي واضح، وعندما ترتبط بنتائج قابلة للقراءة والتحليل. لذلك فإن Google Forms لم يكن مجرد منصة لجمع الردود، بل وسيلة لتنظيم التقويم وتحويله إلى ممارسة تعليمية مبنية على الأدلة.</p>
      </section>
    `
  };

  const modals = (lang) => {
    const isAr = lang === "ar";
    const eyebrow = isAr ? "مرفقات الورشة" : "Workshop Attachment";
    const linkLabel = isAr ? "فتح المصدر الأصلي" : "Open Original Source";
    return [
      modal({ slug: "announcement", title: isAr ? "إعلان الورشة" : "Workshop Announcement", eyebrow, body: simpleBody.announcement, href: docs.announcement, linkLabel, lang }),
      modal({ slug: "planning", title: isAr ? "تخطيط الورشة" : "Workshop Planning", eyebrow, body: planningBody, href: docs.planning, linkLabel, lang }),
      modal({ slug: "survey", title: isAr ? "استطلاع الورشة" : "Workshop Survey", eyebrow, body: simpleBody.survey, href: docs.survey, linkLabel, lang }),
      modal({ slug: "guide", title: isAr ? "دليل الورشة" : "Workshop Guide", eyebrow, body: simpleBody.guide, linkLabel, lang }),
      modal({ slug: "presentation", title: isAr ? "العرض التقديمي للورشة" : "Workshop Presentation", eyebrow, body: simpleBody.presentation, href: docs.presentation, linkLabel, lang }),
      modal({ slug: "publication", title: isAr ? "تقرير نشر الورشة" : "Workshop Publication Report", eyebrow, body: simpleBody.publication, linkLabel, lang }),
      modal({ slug: "evaluation", title: isAr ? "نموذج تقييم الورشة" : "Workshop Evaluation Form", eyebrow, body: simpleBody.evaluation, href: docs.evaluation, linkLabel, lang }),
      modal({ slug: "summary", title: isAr ? "ملخص الورشة" : "Workshop Summary", eyebrow, body: simpleBody.summary, linkLabel, lang })
    ].join("");
  };

  const enItems = [
    { label: "Workshop Announcement", modal: "announcement" },
    { label: "Workshop Planning", modal: "planning" },
    { label: "Workshop Survey", modal: "survey" },
    { label: "Workshop Guide", modal: "guide" },
    { label: "Workshop Presentation", modal: "presentation" },
    { label: "Workshop Publication Report", modal: "publication" },
    { label: "Workshop Excerpts", href: workshopSnippets.href, driveFolderId: workshopSnippets.driveFolderId, embedTitle: "Workshop Excerpts" },
    { label: "Workshop Evaluation Form", modal: "evaluation" },
    { label: "Workshop Summary", modal: "summary" }
  ];

  const arItems = [
    { label: "إعلان الورشة", modal: "announcement" },
    { label: "تخطيط الورشة", modal: "planning" },
    { label: "استطلاع الورشة", modal: "survey" },
    { label: "دليل الورشة", modal: "guide" },
    { label: "العرض التقديمي للورشة", modal: "presentation" },
    { label: "تقرير نشر الورشة", modal: "publication" },
    { label: "مقتطفات الورشة", href: workshopSnippets.href, driveFolderId: workshopSnippets.driveFolderId, embedTitle: "مقتطفات الورشة" },
    { label: "نموذج تقييم الورشة", modal: "evaluation" },
    { label: "ملخص الورشة", modal: "summary" }
  ];

  window.PORTFOLIO_PAGE_DATA["other-workshop"] = {
    en: {
      hero: {
        title: "Training Workshop",
        subtitle:
          "Evidence from a professional development workshop on electronic assessment and performance analysis using Google Forms.",
        prompt: "$ open other-workshop"
      },
      introduction: {
        title: "Workshop Introduction",
        body: [
          "The training workshop focused on electronic assessment and performance analysis through Google Forms as part of a digital skills development series.",
          "The workshop aimed to support teachers in building effective assessment forms, collecting learner responses, reading the resulting data, and using the analysis to improve instructional decisions."
        ]
      },
      poster: {
        title: "Workshop Poster",
        type: "image",
        imageSrc: "/static/img/workshop.webp",
        imageAlt: "Arabic workshop poster about electronic assessment and performance analysis using Google Forms.",
        imageCaption: "Workshop announcement poster."
      },
      learning_focus: {
        title: "Professional Learning Focus",
        body: [
          "Using Google Forms to design clear and organized electronic assessments.",
          "Reading response summaries and charts to identify learner performance patterns.",
          "Connecting assessment data to practical improvement decisions in teaching and feedback."
        ]
      },
      attachments: {
        title: "Workshop Attachments",
        type: "html",
        html: resourceGrid(enItems) + modals("en")
      },
      reflection: {
        title: "Reflection",
        body: [
          "This workshop strengthened the connection between digital assessment tools and evidence-based teaching practice.",
          "The experience also supported my professional growth in designing digital learning activities that are practical, measurable, and connected to learner needs."
        ]
      }
    },
    ar: {
      hero: {
        title: "الورشة التدريبية",
        subtitle:
          "توثيق لورشة نمو مهني حول التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms.",
        prompt: "$ open other-workshop"
      },
      introduction: {
        title: "مقدمة الورشة",
        body: [
          "تناولت الورشة التدريبية موضوع التقويم الإلكتروني وتحليل الأداء باستخدام نماذج Google Forms ضمن سلسلة ورش تطوير المهارات الرقمية.",
          "هدفت الورشة إلى دعم المعلمين في بناء نماذج تقييم فعالة، وجمع استجابات المتعلمين، وقراءة البيانات الناتجة، وتوظيف التحليل في تحسين قرارات التدريس."
        ]
      },
      poster: {
        title: "ملصق الورشة",
        type: "image",
        imageSrc: "/static/img/workshop.webp",
        imageAlt: "ملصق عربي لورشة التقويم الإلكتروني وتحليل الأداء باستخدام Google Forms.",
        imageCaption: "ملصق إعلان الورشة."
      },
      learning_focus: {
        title: "محور التعلم المهني",
        body: [
          "استخدام Google Forms في تصميم أدوات تقويم إلكترونية واضحة ومنظمة.",
          "قراءة ملخصات الاستجابات والرسوم البيانية لتحديد أنماط أداء المتعلمين.",
          "ربط بيانات التقويم بقرارات عملية لتحسين التدريس والتغذية الراجعة."
        ]
      },
      attachments: {
        title: "مرفقات الورشة التدريبية",
        type: "html",
        html: resourceGrid(arItems) + modals("ar")
      },
      reflection: {
        title: "التأمل",
        body: [
          "عززت هذه الورشة الربط بين أدوات التقويم الرقمية والممارسة التدريسية المبنية على الأدلة؛ إذ أوضحت كيف يمكن لأداة بسيطة أن تتحول إلى مصدر بيانات مفيد عندما يكون التقويم مخططا بوضوح وتتم مراجعة نتائجه بهدف تربوي.",
          "كما دعمت التجربة نموي المهني في تصميم أنشطة تعلم رقمية عملية، قابلة للقياس، ومرتبطة باحتياجات المتعلمين."
        ]
      }
    }
  };
})();
