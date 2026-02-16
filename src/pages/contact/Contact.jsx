import Card from "../../components/Card/Card";

export default function Contact() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">Contact</p>
        <h1>Get in Touch</h1>
        <p className="lead">
          Thank you for visiting my portfolio. I look forward to contributing to
          future learning communities.
        </p>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>Channels</h2>
          <ul className="clean-list">
            <li>Email: your-email@example.com</li>
            <li>LinkedIn: add profile link</li>
            <li>GitHub: add repository link</li>
          </ul>
        </Card>

        <Card className="stack">
          <h2>Quick Actions</h2>
          <div className="row">
            <a className="btn primary" href="mailto:your-email@example.com">
              Send Email
            </a>
            <a className="btn" href="/cv">
              Open CV
            </a>
          </div>
        </Card>
      </section>
    </main>
  );
}
