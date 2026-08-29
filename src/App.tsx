import { Routes, Route } from "react-router-dom";
import FeedbackPage from "./pages/FeedbackPage";
import DashboardPage from "./pages/DashboardPage";
import PageNav from "./components/PageNav";
import "./App.css";

function App() {
  return (
    <div className="app">
      <PageNav />
      <Routes>
        <Route path="/" element={<FeedbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}

export default App;
