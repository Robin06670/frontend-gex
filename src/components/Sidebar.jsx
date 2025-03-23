import React from "react";
import { FaHome, FaBuilding, FaUsersCog, FaChartLine, FaCog, FaSignOutAlt, FaMoneyBillWave } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png"; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="w-52 h-screen bg-blue-900 bg-opacity-90 backdrop-blur-md text-white flex flex-col p-5 justify-between rounded-2xl shadow-2xl transition-all duration-300">
      
      {/* Logo & Nom */}
      <div>
        <div className="flex items-center mb-6">
          <img 
            src={logo} 
            alt="Logo GEX" 
            className="h-12 mr-3 filter invert brightness-0 contrast-200 transition-transform transform hover:scale-110" 
          />
          <h2 className="text-xl font-bold tracking-wide">GEX</h2>
        </div>

        {/* Menu */}
        <ul className="space-y-3">
          <SidebarItem to="/dashboard" icon={<FaHome />} label="Accueil" active={location.pathname === "/dashboard"} />
          <SidebarItem to="/clients" icon={<FaBuilding />} label="Clients" active={location.pathname === "/clients"} />
          <SidebarItem to="/collaborateurs" icon={<FaUsersCog />} label="Collaborateurs" active={location.pathname === "/collaborateurs"} />
          <SidebarItem to="/fixed-costs" icon={<FaMoneyBillWave />} label="Frais Fixes" active={location.pathname === "/fixed-costs"} /> {/* ✅ Déplacement du bouton Frais Fixes */}
          <SidebarItem to="/statistics" icon={<FaChartLine />} label="Statistiques" active={location.pathname === "/statistics"} />
          <SidebarItem to="/settings" icon={<FaCog />} label="Paramètres" active={location.pathname === "/settings"} />
        </ul>
      </div>

      {/* Bouton Déconnexion */}
      <button 
        onClick={handleLogout} 
        className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-900 p-3 rounded-xl w-full text-xs font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        <FaSignOutAlt className="text-base" />
        <span>Se Déconnecter</span>
      </button>

    </div>
  );
};

// Composant pour chaque item du menu
const SidebarItem = ({ to, icon, label, active }) => {
  return (
    <li className={`flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-200 transform hover:scale-105
      ${active ? "bg-blue-700 shadow-lg" : "hover:bg-blue-700"}`}>
      <Link to={to} className="flex items-center space-x-3 w-full h-full">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </Link>
    </li>
  );
};

export default Sidebar;
