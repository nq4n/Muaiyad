(() => {
  window.PORTFOLIO_PAGE_DATA = window.PORTFOLIO_PAGE_DATA || {};
  window.PORTFOLIO_PAGE_DATA["other-parent-communication"] = {
    en: {
      hero: {
        title: "Parent Communication Form",
        subtitle:
          "A page for documenting communication tools that support constructive partnership with parents and guardians.",
        prompt: "$ open other-parent-communication"
      },
      introduction: {
        title: "Page Introduction",
        body: [
          "This page presents evidence related to communicating with parents and guardians as part of the field training experience.",
          "The purpose of these tools is to strengthen the relationship between school and home, collect useful information about learners, and support decisions that improve learning, follow-up, and student well-being."
        ]
      },
      communication_purpose: {
        title: "Purpose Of Parent Communication",
        body: [
          "Parent communication helps the teacher understand learner needs beyond the classroom and build a clearer picture of the student's learning context.",
          "It also supports professional responsibility because communication with families should be organized, respectful, and connected to improving the learner's academic and personal growth."
        ]
      },
      surveys: {
        title: "Surveys",
        type: "html",
        html: `
          <div class="resource-actions resource-actions--single">
            <a class="resource-action" href="#parent-surveys">
              <span class="resource-action__icon" aria-hidden="true">&#8599;</span>
              <span class="resource-action__label">Surveys</span>
            </a>
          </div>
        `
      }
    },
    ar: {
      hero: {
        title: "استمارة تواصل مع أولياء أمور المتعلمين",
        subtitle:
          "صفحة لتوثيق أدوات التواصل التي تدعم الشراكة البنّاءة مع أولياء أمور المتعلمين.",
        prompt: "$ open other-parent-communication"
      },
      introduction: {
        title: "مقدمة الصفحة",
        body: [
          "تعرض هذه الصفحة الأدلة المرتبطة بالتواصل مع أولياء أمور المتعلمين ضمن تجربة التدريب الميداني.",
          "تهدف هذه الأدوات إلى تعزيز العلاقة بين المدرسة والبيت، وجمع معلومات مفيدة عن المتعلمين، ودعم القرارات التي تسهم في تحسين التعلم والمتابعة والرعاية التربوية."
        ]
      },
      communication_purpose: {
        title: "هدف التواصل مع أولياء الأمور",
        body: [
          "يساعد التواصل مع أولياء الأمور المعلم على فهم احتياجات المتعلمين خارج حدود الصف، وبناء صورة أوضح عن سياق تعلم الطالب.",
          "كما يعزز المسؤولية المهنية؛ لأن التواصل مع الأسرة ينبغي أن يكون منظما، ومحترما، ومرتبطا بتحسين نمو المتعلم أكاديميا وشخصيا."
        ]
      },
      surveys: {
        title: "الاستبانات",
        type: "html",
        html: `
          <div class="resource-actions resource-actions--single">
            <a class="resource-action" href="#parent-surveys">
              <span class="resource-action__icon" aria-hidden="true">&#8599;</span>
              <span class="resource-action__label">الاستبانات</span>
            </a>
          </div>
        `
      }
    }
  };
})();
