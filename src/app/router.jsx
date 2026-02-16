import { createBrowserRouter } from "react-router-dom";
import HomeLayout from "../layouts/HomeLayout";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/home/Home";
import About from "../pages/about/About";
import CV from "../pages/cv/CV";
import Philosophy from "../pages/philosophy/Philosophy";
import Axis1 from "../pages/axes/Axis1";
import Axis2 from "../pages/axes/Axis2";
import Axis3 from "../pages/axes/Axis3";
import Axis4 from "../pages/axes/Axis4";
import Axis5 from "../pages/axes/Axis5";
import Research from "../pages/research/Research";
import Growth from "../pages/growth/Growth";
import Projects from "../pages/projects/Projects";
import Contact from "../pages/contact/Contact";
import NotFound from "../pages/notfound/NotFound";

const router = createBrowserRouter([
  {
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      }
    ]
  },
  {
    element: <RootLayout />,
    children: [
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/cv",
        element: <CV />
      },
      {
        path: "/philosophy",
        element: <Philosophy />
      },
      {
        path: "/axes/1",
        element: <Axis1 />
      },
      {
        path: "/axes/2",
        element: <Axis2 />
      },
      {
        path: "/axes/3",
        element: <Axis3 />
      },
      {
        path: "/axes/4",
        element: <Axis4 />
      },
      {
        path: "/axes/5",
        element: <Axis5 />
      },
      {
        path: "/research",
        element: <Research />
      },
      {
        path: "/growth",
        element: <Growth />
      },
      {
        path: "/projects",
        element: <Projects />
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);

export default router;
