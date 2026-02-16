import { Link } from "react-router-dom";
import { getCurrentYear } from "../../lib/utils";

export default function Home() {
  return (
    <main className="home-wrap fade-in">
      <section className="home-main">
        <section className="card stack home-hero" aria-label="Welcome">
          <p className="kicker">Welcome</p>
          <h1>Muaiyad Al Hasani</h1>
          <p className="lead">
            Pre-service Teacher | Instructional Technologist | AI Builder
          </p>
          <p className="home-subtitle">
            A digital space that documents my journey toward becoming a
            reflective, innovative, and impact-driven educator.
          </p>

          <div className="actions">
            <Link className="btn primary" to="/about">
              Enter Portfolio
            </Link>
            <Link className="btn" to="/cv">
              Download CV
            </Link>
            <Link className="btn" to="/contact">
              Contact
            </Link>
          </div>
        </section>

        <section className="home-panels">
          <Link className="card stack home-panel-link" to="/axes/1">
            <h2>Evidence</h2>
            <p>Explore axis pages with evidence, reflection, and growth plans.</p>
          </Link>

          <Link className="card stack home-panel-link" to="/research">
            <h2>Research</h2>
            <p>See how inquiry and data-informed decisions shape my teaching.</p>
          </Link>

          <Link className="card stack home-panel-link" to="/projects">
            <h2>Innovation</h2>
            <p>Review projects and digital solutions built for learning impact.</p>
          </Link>
        </section>
      </section>

      <footer className="mini home-mini">
        <span>&copy; {getCurrentYear()} Muaiyad Al Hasani</span>
      </footer>
    </main>
  );
}
