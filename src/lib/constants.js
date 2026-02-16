export const NAV_ITEMS = [
  { id: "about", label: "About", to: "/about" },
  { id: "cv", label: "CV", to: "/cv" },
  { id: "philosophy", label: "Teaching Philosophy", to: "/philosophy" },
  { id: "axes", label: "Axes", to: "/axes/1" },
  { id: "research", label: "Research", to: "/research" },
  { id: "growth", label: "Growth", to: "/growth" },
  { id: "projects", label: "Projects", to: "/projects" },
  { id: "contact", label: "Contact", to: "/contact" }
];

export const AXES = [
  {
    axis: 1,
    title: "Academic and Subject Mastery",
    description:
      "This section demonstrates my competence in subject knowledge and curriculum understanding.",
    evidence: [
      "Unit plan",
      "Lesson materials",
      "Instructional resources",
      "Student outcomes"
    ],
    reflection:
      "Through planning and implementation, I improved my ability to connect theoretical knowledge with classroom practice.",
    futureDevelopment:
      "I plan to deepen my specialization and explore innovative methods to explain complex ideas.",
    evaluator: "Strong in subject.",
    prev: null,
    next: 2
  },
  {
    axis: 2,
    title: "Teaching and Learner Diversity",
    description:
      "This axis highlights my ability to address differences among learners.",
    evidence: [
      "Differentiated instruction",
      "Classroom management strategies",
      "Communication with families",
      "Peer feedback"
    ],
    reflection:
      "I learned that flexibility and empathy are essential for successful teaching.",
    futureDevelopment:
      "I will continue developing inclusive strategies to reach every learner.",
    evaluator: "Can survive school life.",
    prev: 1,
    next: 3
  },
  {
    axis: 3,
    title: "Professional Values and Ethics",
    description:
      "Focus on responsibility, commitment, and professional behavior.",
    evidence: [
      "Scenario responses",
      "Attendance and punctuality",
      "Feedback from supervisors",
      "Collaboration"
    ],
    reflection:
      "Professional ethics build trust and create positive educational communities.",
    futureDevelopment: "Maintain integrity and strengthen leadership qualities.",
    evaluator: "Professional personality.",
    prev: 2,
    next: 4
  },
  {
    axis: 4,
    title: "Research and Lifelong Learning",
    description: "Shows how I use inquiry to improve my teaching.",
    evidence: [
      "Action research",
      "Professional readings",
      "Workshops",
      "Data-informed decisions"
    ],
    reflection:
      "Research transforms daily challenges into opportunities for growth.",
    futureDevelopment:
      "Continue academic study and contribute to educational innovation.",
    evaluator: "Future leader material.",
    prev: 3,
    next: 5
  },
  {
    axis: 5,
    title: "Technology Skills",
    description:
      "Demonstrates integration of digital tools in teaching and learning.",
    evidence: [
      "Interactive content",
      "AI-supported systems",
      "Digital assessments",
      "Media projects"
    ],
    reflection:
      "Technology increases engagement and provides new pathways for understanding.",
    futureDevelopment: "Develop smarter learning environments powered by AI.",
    evaluator: "We need this teacher in our school yesterday.",
    prev: 4,
    next: null
  }
];
