import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminSettings() {
  const [content, setContent] = useState({
    mission: "",
    vision: "",
    about: "",
    address: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch(`${API}/api/content`);
      const data = await res.json();
      const contentMap = {};
      data.forEach((c) => (contentMap[c.key] = c.value));
      setContent((prev) => ({ ...prev, ...contentMap }));
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        toast.success("Contenu mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const contentFields = [
    { key: "mission", label: "Mission", type: "textarea", rows: 3 },
    { key: "vision", label: "Vision", type: "textarea", rows: 3 },
    { key: "about", label: "À propos", type: "textarea", rows: 4 },
    { key: "address", label: "Adresse", type: "input" },
    { key: "email", label: "Email", type: "input" },
    { key: "phone", label: "Téléphone", type: "input" },
  ];

  return (
    <div data-testid="admin-settings">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600 mt-1">Modifiez le contenu du site</p>
      </div>

      <div className="space-y-6">
        {contentFields.map((field) => (
          <div key={field.key} className="dashboard-card" data-testid={`setting-${field.key}`}>
            <Label htmlFor={field.key} className="text-lg font-medium">
              {field.label}
            </Label>
            <div className="mt-3 flex gap-3">
              {field.type === "textarea" ? (
                <Textarea
                  id={field.key}
                  value={content[field.key] || ""}
                  onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                  rows={field.rows}
                  className="flex-1"
                  data-testid={`input-${field.key}`}
                />
              ) : (
                <Input
                  id={field.key}
                  value={content[field.key] || ""}
                  onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                  className="flex-1"
                  data-testid={`input-${field.key}`}
                />
              )}
              <Button
                onClick={() => handleSave(field.key, content[field.key])}
                disabled={saving}
                className="btn-primary self-end"
                data-testid={`save-${field.key}`}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
