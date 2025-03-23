import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 📌 Utiliser Axios pour les requêtes HTTP
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      console.log("📤 Envoi des données de connexion :", { email, password });

      // ✅ Envoi de la requête au backend
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, { email, password });

      console.log("✅ Réponse du serveur :", response.data);

      // ✅ Stocker le token en local
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // ✅ Redirection après connexion réussie
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Erreur de connexion :", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center">
        
        {/* Logo Cliquable */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo GEX" className="h-16 cursor-pointer" onClick={() => navigate("/")} />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Connexion</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]"
        />

        <button
          onClick={handleLogin}
          className="w-full px-6 py-3 mt-6 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1B3A94] transition"
        >
          Se connecter
        </button>

        <div className="mt-4 text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <span
            className="text-[#1E40AF] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Inscrivez-vous
          </span>
        </div>
      </div>
    </div>
  );
}
