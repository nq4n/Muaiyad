import Card from "../../components/Card/Card";

export default function Research() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">Research Project</p>
        <h1>Deep Thinking Ability</h1>
        <p className="lead">
          A structured inquiry from observed classroom challenge to tested
          educational solution.
        </p>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>Problem</h2>
          <p>Describe the issue observed.</p>

          <h2>Importance</h2>
          <p>Explain why solving this problem matters.</p>

          <h2>Method</h2>
          <p>Document tools, participants, and procedures.</p>
        </Card>

        <Card className="stack">
          <h2>Results</h2>
          <p>Summarize what changed after intervention.</p>

          <h2>Reflection</h2>
          <p>What I learned about teaching and learners.</p>

          <h2>Evaluator Perspective</h2>
          <p className="lead">Analytical educator.</p>
        </Card>
      </section>
    </main>
  );
}
