import { Link } from "react-router-dom";
import Card from "../../components/Card/Card";
import { AXES } from "../../lib/constants";
import { cx } from "../../lib/utils";

const steps = [1, 2, 3, 4, 5];

export default function AxisTemplate({
  axis,
  title,
  description,
  evidence,
  reflection,
  futureDevelopment,
  evaluator,
  prev,
  next
}) {
  return (
    <main className="page container page-shell fade-in">
      <Card className="stack hero-card">
        <p className="kicker">Axis {axis}</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>

        <div className="axis-steps">
          {steps.map((step) => (
            <Link
              key={step}
              className={cx("axis-step", step === axis && "active")}
              to={`/axes/${step}`}
            >
              Axis {step}
            </Link>
          ))}
        </div>
      </Card>

      <section className="panel-grid two">
        <Card className="stack">
          <h2>Evidence Examples</h2>
          <ul className="clean-list">
            {evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card className="stack">
          <h2>Reflection</h2>
          <p>{reflection}</p>

          <h2>Future Development</h2>
          <p>{futureDevelopment}</p>

          <h2>Evaluator Perspective</h2>
          <p className="lead">{evaluator}</p>
        </Card>
      </section>

      <Card className="stack">
        <h2>Navigate Axes</h2>
        <div className="axis-nav">
          {prev ? (
            <Link className="btn" to={`/axes/${prev}`}>
              Previous Axis
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link className="btn primary" to={`/axes/${next}`}>
              Next Axis
            </Link>
          ) : (
            <Link className="btn primary" to="/research">
              Continue to Research
            </Link>
          )}
        </div>
      </Card>
    </main>
  );
}

export function getAxisByNumber(number) {
  return AXES.find((item) => item.axis === number);
}
