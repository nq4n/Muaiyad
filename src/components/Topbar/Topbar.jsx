import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../lib/constants";
import { cx } from "../../lib/utils";

export default function Topbar() {
  const location = useLocation();
  const [isRtl, setIsRtl] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("portfolio_dir");
    if (saved) return saved === "rtl";
    return document.documentElement.getAttribute("dir") === "rtl";
  });

  useEffect(() => {
    const dir = isRtl ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    window.localStorage.setItem("portfolio_dir", dir);
  }, [isRtl]);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link className="brand" to="/">
          <span className="brand-main">muaiyad://portfolio</span>
          <span className="brand-sub">Teaching x Technology</span>
        </Link>

        <div className="topbar-controls">
          <button
            type="button"
            className="mode-btn"
            onClick={() => setIsRtl((value) => !value)}
            aria-label="Toggle text direction"
          >
            {isRtl ? "LTR Layout" : "RTL Layout"}
          </button>

          <nav className="nav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === "axes"
                  ? location.pathname.startsWith("/axes/")
                  : location.pathname === item.to;

              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={cx("nav-link", isActive && "active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
