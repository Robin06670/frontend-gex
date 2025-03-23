import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setError(""); // Réinitialise les erreurs
    setSuccess("");

    if (!nom || !prenom || !email || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // 🔹 Envoyer les données au backend
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: prenom, name: nom, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue.");
      }

      setSuccess("Inscription réussie ! Redirection en cours...");
      setTimeout(() => navigate("/login"), 2000); // Redirige après 2 sec
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center">

        {/* Logo Cliquable */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo GEX" className="h-16 cursor-pointer" onClick={() => navigate("/")} />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-gray-900">Inscription</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        <div className="flex gap-4">
          <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)}
            className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
          <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)}
            className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
        </div>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />
        <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mt-4 border rounded-lg focus:ring-2 focus:ring-[#1E40AF]" />

        <button onClick={handleRegister}
          className="w-full px-6 py-3 mt-6 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1B3A94] transition">
          S'inscrire
        </button>

        <div className="mt-4 text-sm text-gray-600">
          Déjà un compte ? <span className="text-[#1E40AF] font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}>Connectez-vous</span>
        </div>
      </div>
    </div>
  );
}
