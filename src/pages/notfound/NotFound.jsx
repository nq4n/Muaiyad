import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";

export default function NotFound() {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">404</p>
        <h1>Page Not Found</h1>
        <p className="lead">
          The route you requested does not exist in this portfolio version.
        </p>
        <div className="row">
          <Link className="btn primary" to="/">
            Back to Home
          </Link>
          <Link className="btn" to="/about">
            Open About
          </Link>
        </div>
      </Card>
    </main>
  );
}
