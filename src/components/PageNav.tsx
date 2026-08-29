import { Link, useLocation } from "react-router-dom";

export default function PageNav() {
  const location = useLocation();

  return (
    <nav className="page-nav">
      <Link
        to="/"
        className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
      >
        Feedback
      </Link>
      <Link
        to="/dashboard"
        className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
      >
        Dashboard
      </Link>
    </nav>
  );
}
