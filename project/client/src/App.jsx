import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Market from "./pages/Market.jsx";
import EcoRoute from "./pages/EcoRoute.jsx";
import NerdStats from "./pages/NerdStats.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/market/:id" element={<Market />} />
      <Route path="/route/:id" element={<EcoRoute />} />
      <Route path="/nerd" element={<NerdStats />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}