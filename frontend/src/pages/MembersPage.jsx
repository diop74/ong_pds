import { useState, useEffect } from "react";
import { Users, Award, Star, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    motivation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API}/api/members`);
      setMembers(await res.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/members/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Demande envoyée avec succès ! Nous vous contacterons bientôt.");
        setFormData({ name: "", email: "", phone: "", motivation: "" });
        setShowForm(false);
      } else {
        toast.error("Erreur lors de l'envoi de la demande");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  const memberTypes = [
    {
      icon: Star,
      type: "fondateur",
      title: "Membres Fondateurs",
      description: "Les visionnaires qui ont créé l'ONG et guidé ses premiers pas.",
      color: "amber",
    },
    {
      icon: Users,
      type: "actif",
      title: "Membres Actifs",
      description: "Les bénévoles engagés qui participent régulièrement aux activités.",
      color: "emerald",
    },
    {
      icon: Award,
      type: "honneur",
      title: "Membres d'Honneur",
      description: "Personnalités reconnues pour leur contribution exceptionnelle.",
      color: "sky",
    },
  ];

  const conditions = [
    "Adhérer aux valeurs et objectifs de l'ONG",
    "S'engager à participer activement aux activités",
    "Payer la cotisation annuelle (montant symbolique)",
    "Respecter le règlement intérieur",
  ];

  return (
    <div data-testid="members-page">
      {/* Page Header */}
      <div className="page-header pt-32">
        <div className="container-custom">
          <h1 className="animate-fade-in-up">Nos Membres</h1>
          <p className="animate-fade-in-up animate-delay-100">
            Rejoignez notre communauté engagée pour l'éducation
          </p>
        </div>
      </div>

      {/* Member Types */}
      <section className="py-16 bg-white" data-testid="member-types-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium mb-4 block">Types de membres</span>
            <h2 className="text-3xl font-bold text-slate-900">Catégories d'adhésion</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {memberTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.type} className="card-marketing text-center">
                  <div className={`w-16 h-16 rounded-xl bg-${type.color}-100 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 text-${type.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{type.title}</h3>
                  <p className="text-slate-600 text-sm">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Members */}
      <section className="py-16 bg-slate-50" data-testid="current-members-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium mb-4 block">Notre équipe</span>
            <h2 className="text-3xl font-bold text-slate-900">Membres approuvés</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="spinner"></div>
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-slate-500">Aucun membre pour le moment</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {members.map((member) => (
                <div key={member.id} className="member-card" data-testid={`member-${member.id}`}>
                  <div className="member-avatar">
                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h4 className="font-semibold text-slate-900">{member.name}</h4>
                  <span
                    className={`inline-block mt-2 ${
                      member.member_type === "fondateur"
                        ? "badge-warning"
                        : member.member_type === "honneur"
                        ? "badge-info"
                        : "badge-success"
                    }`}
                  >
                    {member.member_type === "fondateur"
                      ? "Fondateur"
                      : member.member_type === "honneur"
                      ? "Honneur"
                      : "Actif"}
                  </span>
                  {member.bio && <p className="text-slate-600 text-sm mt-3">{member.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join Section */}
      <section className="py-16 bg-white" data-testid="join-section">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Conditions */}
              <div>
                <span className="text-emerald-600 font-medium mb-4 block">Adhésion</span>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Conditions d'adhésion
                </h2>
                <ul className="space-y-4">
                  {conditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-emerald-600 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-slate-600">{condition}</span>
                    </li>
                  ))}
                </ul>
                {!showForm && (
                  <Button
                    className="btn-primary mt-8"
                    onClick={() => setShowForm(true)}
                    data-testid="show-join-form-btn"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Demander l'adhésion
                  </Button>
                )}
              </div>

              {/* Form */}
              {showForm && (
                <div className="card-marketing" data-testid="join-form">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    Formulaire d'adhésion
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="input-style mt-1"
                        data-testid="join-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="input-style mt-1"
                        data-testid="join-email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="input-style mt-1"
                        data-testid="join-phone-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="motivation">Motivation *</Label>
                      <Textarea
                        id="motivation"
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        required
                        rows={4}
                        className="input-style mt-1"
                        placeholder="Pourquoi souhaitez-vous rejoindre notre ONG ?"
                        data-testid="join-motivation-input"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={submitting}
                        data-testid="submit-join-btn"
                      >
                        {submitting ? "Envoi..." : "Envoyer"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
