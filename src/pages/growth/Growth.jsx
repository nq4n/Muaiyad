import Card from "../../components/Card/Card";

export default function Growth() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">Reflection and Growth Mindset</p>
        <h1>Professional Maturity</h1>
        <p className="lead">
          A dedicated space to document mistakes, lessons, and evolution.
        </p>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>Mistakes</h2>
          <ul className="clean-list">
            <li>What did not work and why</li>
            <li>Where instructional decisions were weak</li>
          </ul>
        </Card>

        <Card className="stack">
          <h2>Lessons and Evolution</h2>
          <ul className="clean-list">
            <li>How feedback changed practice</li>
            <li>How planning, teaching, and assessment improved over time</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
