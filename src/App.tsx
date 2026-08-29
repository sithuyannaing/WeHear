import { Routes, Route } from "react-router-dom";
import CustomerFlow from "./components/customer/CustomerFlow";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<CustomerFlow />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}

export default App;
