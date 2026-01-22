import { useState, useEffect } from "react";
import { MapPin, Mail, Phone, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function ContactPage() {
  const [content, setContent] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch(`${API}/api/content`);
      const data = await res.json();
      const contentMap = {};
      data.forEach((c) => (contentMap[c.key] = c.value));
      setContent(contentMap);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Message envoyé avec succès ! Nous vous répondrons rapidement.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Erreur lors de l'envoi du message");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page">
      {/* Page Header */}
      <div className="page-header pt-32">
        <div className="container-custom">
          <h1 className="animate-fade-in-up">Contactez-nous</h1>
          <p className="animate-fade-in-up animate-delay-100">
            Une question ? Un projet ? N'hésitez pas à nous écrire
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card-marketing" data-testid="contact-info">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Nos coordonnées</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Adresse</h4>
                      <p className="text-slate-600 text-sm mt-1">
                        {content.address || "Quartier Numerowatt, Nouadhibou, Mauritanie"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Email</h4>
                      <a
                        href={`mailto:${content.email || "thiamabdoulaye2245@gmail.com"}`}
                        className="text-sky-600 text-sm hover:underline"
                      >
                        {content.email || "thiamabdoulaye2245@gmail.com"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Téléphone</h4>
                      <a
                        href={`tel:${content.phone || "+22244450366"}`}
                        className="text-sky-600 text-sm hover:underline"
                      >
                        {content.phone || "+222 44 45 03 66"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donate Box */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white" data-testid="donate-box">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Faire un don</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  Votre soutien nous aide à poursuivre notre mission éducative.
                </p>
                <p className="text-white/80 text-xs">
                  Pour faire un don, contactez-nous directement par email ou téléphone. Nous vous fournirons les informations nécessaires.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card-marketing" data-testid="contact-form-card">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">
                  Envoyez-nous un message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="input-style mt-2"
                        placeholder="Votre nom"
                        data-testid="contact-name-input"
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
                        className="input-style mt-2"
                        placeholder="votre@email.com"
                        data-testid="contact-email-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="input-style mt-2"
                      placeholder="L'objet de votre message"
                      data-testid="contact-subject-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="input-style mt-2"
                      placeholder="Votre message..."
                      data-testid="contact-message-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                    data-testid="contact-submit-btn"
                  >
                    {submitting ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
