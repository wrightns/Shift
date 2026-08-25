import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

// HashRouter keeps client-side routes (e.g. "#/plans") working on GitHub
// Pages, which serves static files with no server-side rewrite rules.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
