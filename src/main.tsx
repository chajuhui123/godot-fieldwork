import "./styles/styles.css";
import "./styles/refined.css";
import "./styles/seed-content.css";
import "./styles/godot-content.css";
import "./styles/learning-depth.css";
import "./styles/workshops.css";
import "./styles/live-workshop.css";
import "./styles/home.css";
import "./styles/home-editorial.css";
import "./styles/lesson-spacing.css";
import "./styles/studio.css";
import "./styles/loading.css";
import "./styles/workshop-results.css";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import { App } from "./App";
// Vercel Web Analytics: 쿠키 없이 방문자 수만 집계한다. 로컬 개발에서는 전송하지 않는다.
inject();
createRoot(document.getElementById("root")!).render(<App />);
