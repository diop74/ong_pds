import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Connexion réussie");
        navigate("/admin");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Email ou mot de passe incorrect");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 to-emerald-800 flex items-center justify-center p-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-floating p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-900 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Porte du Savoir</h1>
            <p className="text-slate-600 text-sm mt-1">Espace Administration</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-style mt-2"
                placeholder="admin@portedusavoir.org"
                data-testid="login-email-input"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-style pr-10"
                  placeholder="••••••••"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            
          </div>
        </div>
      </div>
    </div>
  );
}
