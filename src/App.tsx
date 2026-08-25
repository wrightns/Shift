import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { PlansPage } from "./pages/PlansPage";
import { DrillsPage } from "./pages/DrillsPage";
import { PlanBuilderPage } from "./pages/PlanBuilderPage";
import { RunnerPage } from "./pages/RunnerPage";

function App() {
  return (
    <div className="min-h-full">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/plans" replace />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plans/:planId" element={<PlanBuilderPage />} />
          <Route path="/drills" element={<DrillsPage />} />
          <Route path="/run/:planId" element={<RunnerPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
