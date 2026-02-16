import Card from "../../components/Card/Card";

export default function About() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">About Me</p>
        <h1>Professional Identity</h1>
        <p className="lead">
          I am a pre-service teacher in the College of Education at Sultan
          Qaboos University. My interests lie at the intersection of teaching,
          technology, and intelligent systems that enhance learning
          experiences.
        </p>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>My Mission</h2>
          <p>
            I aim to design learning environments that are engaging, inclusive,
            and supported by data and educational technology.
          </p>
        </Card>

        <Card className="stack">
          <h2>What Makes Me Different</h2>
          <ul className="clean-list">
            <li>Building tools, not only collecting files</li>
            <li>Analyzing learning evidence and outcomes</li>
            <li>Reflecting on practice continuously</li>
            <li>Improving through iterative action</li>
          </ul>
        </Card>
      </section>

      <Card className="stack">
        <h2>Career Vision</h2>
        <p>
          To become a teacher who leads digital transformation in schools and
          contributes to the future of education.
        </p>
      </Card>
    </main>
  );
}
