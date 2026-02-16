import Card from "../../components/Card/Card";

export default function Philosophy() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">Teaching Philosophy</p>
        <h1>My View and Practice</h1>
        <p className="lead">
          My philosophy is practical, reflective, and learner-centered.
        </p>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>My View of Learning</h2>
          <p>
            Students learn best when they are active participants, not passive
            receivers.
          </p>

          <h2>My Role as a Teacher</h2>
          <p>
            My responsibility is to guide, support, and design meaningful
            learning experiences that respect learner differences.
          </p>

          <h2>Classroom Environment</h2>
          <p>
            A safe, motivating space where curiosity is encouraged and mistakes
            are part of growth.
          </p>
        </Card>

        <Card className="stack">
          <h2>Assessment Belief</h2>
          <p>Assessment should guide improvement, not only measure performance.</p>

          <h2>Technology Perspective</h2>
          <p>
            Technology is a bridge that expands understanding, creativity, and
            access.
          </p>

          <h2>Belief to Application</h2>
          <p>
            In practice, I connect clear outcomes, active participation, and
            formative feedback to make learning visible and meaningful.
          </p>
        </Card>
      </section>
    </main>
  );
}
