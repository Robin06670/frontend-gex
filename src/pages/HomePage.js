import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Assure-toi que le logo est bien placé dans `src/assets/`

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] text-center text-gray-900">
      {/* Logo en haut à gauche */}
      <div className="absolute top-4 left-4 z-10">
        <img src={logo} alt="Logo GEX" className="h-12 md:h-16" />
      </div>

      {/* Texte d'accueil */}
      <h1 className="text-5xl font-extrabold mb-4 z-10">Bienvenue sur GEX</h1>
      <p className="text-lg max-w-2xl z-10">
        GEX est un logiciel de gestion dédié aux cabinets comptables pour une gestion efficace et intuitive des clients et des collaborateurs.
      </p>

      {/* Bouton "Commencer" avec couleur adaptée au logo */}
      <button
        onClick={() => navigate("/login")}
        className="mt-6 px-6 py-3 bg-[#1E40AF] text-white font-semibold rounded-lg shadow-md hover:bg-[#1B3A94] transition duration-300 cursor-pointer relative z-10"
      >
        Commencer
      </button>

      {/* Vague animée avec couleur adaptée au logo */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "5%" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-0 left-0 w-full z-0"
      >
        <svg
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[200px] md:h-[250px] lg:h-[300px]"
        >
          <path
            fill="#1E40AF"  // Bleu identique au logo
            fillOpacity="1"
            d="M0,224L48,208C96,192,192,160,288,144C384,128,480,128,576,144C672,160,768,192,864,186.7C960,181,1056,139,1152,144C1248,149,1344,203,1392,229.3L1440,256L1440,320L0,320Z"
          ></path>
        </svg>
      </motion.div>
    </div>
  );
}
