import Card from "../../components/Card/Card";

export default function Projects() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">Projects and Innovations</p>
        <h1>Beyond Required Coursework</h1>
        <p className="lead">
          This section presents extra initiatives, experiments, and practical
          innovations.
        </p>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>Overview</h2>
          <p>
            Projects here show my ability to create useful educational systems,
            not only consume existing tools.
          </p>

          <h2>Possible Items</h2>
          <ul className="clean-list">
            <li>Educational systems</li>
            <li>AI applications</li>
            <li>Digital platforms</li>
            <li>Prototypes</li>
          </ul>
        </Card>

        <Card className="stack">
          <h2>Reflection</h2>
          <p>
            Building solutions helped me move from theory to real-world impact.
          </p>

          <h2>Evaluator Perspective</h2>
          <p className="lead">Creator, not consumer.</p>
        </Card>
      </section>
    </main>
  );
}
