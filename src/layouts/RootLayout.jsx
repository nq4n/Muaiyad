import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "../components/Topbar/Topbar";

export default function RootLayout() {
  const { pathname } = useLocation();

  const progress = useMemo(() => {
    const sequence = [
      "/about",
      "/cv",
      "/philosophy",
      "/axes/1",
      "/axes/2",
      "/axes/3",
      "/axes/4",
      "/axes/5",
      "/research",
      "/growth",
      "/projects",
      "/contact"
    ];

    const axisMatch = pathname.match(/^\/axes\/([1-5])$/);
    if (axisMatch) {
      const axisIndex = Number(axisMatch[1]);
      return Math.round(((3 + axisIndex) / sequence.length) * 100);
    }

    const idx = sequence.indexOf(pathname);
    if (idx === -1) return 4;
    return Math.round(((idx + 1) / sequence.length) * 100);
  }, [pathname]);

  return (
    <>
      <Topbar />
      <div className="route-progress" aria-hidden="true">
        <div className="route-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <Outlet />
    </>
  );
}
