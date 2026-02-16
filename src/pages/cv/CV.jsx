import Card from "../../components/Card/Card";

export default function CV() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">CV / Professional Profile</p>
        <h1>Official Credibility</h1>
        <p className="lead">
          Education, skills, and professional achievements presented in one
          clear profile.
        </p>
        <div className="row">
          <a className="btn primary" href="#">
            Download CV
          </a>
        </div>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>Education</h2>
          <p>
            Bachelor of Education - Instructional and Learning Technology,
            Sultan Qaboos University.
          </p>

          <h2>Skills</h2>
          <ul className="clean-list">
            <li>Lesson and unit planning</li>
            <li>Classroom assessment</li>
            <li>Educational research</li>
            <li>AI integration in education</li>
            <li>Web technologies</li>
            <li>Digital media production</li>
          </ul>
        </Card>

        <Card className="stack">
          <h2>Technical Tools</h2>
          <p>
            HTML, CSS, JavaScript, React, Python, LMS platforms, multimedia
            editing.
          </p>

          <h2>Workshops and Training</h2>
          <p>Add courses, seminars, and certifications.</p>

          <h2>Achievements</h2>
          <p>Add awards, recognitions, and participation records.</p>
        </Card>
      </section>
    </main>
  );
}
