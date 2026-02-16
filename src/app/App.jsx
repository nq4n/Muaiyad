import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";

export default function App() {
  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio_dir");
    if (saved === "rtl" || saved === "ltr") {
      document.documentElement.setAttribute("dir", saved);
    }
  }, []);

  return <RouterProvider router={router} />;
}
