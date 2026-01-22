import { useState, useEffect } from "react";
import { Target, Eye, Heart, Users, Award, BookOpen } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AboutPage() {
  const [content, setContent] = useState({});
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, membersRes] = await Promise.all([
        fetch(`${API}/api/content`),
        fetch(`${API}/api/members?member_type=fondateur`),
      ]);
      
      const contentData = await contentRes.json();
      const contentMap = {};
      contentData.forEach((c) => (contentMap[c.key] = c.value));
      setContent(contentMap);
      
      setMembers(await membersRes.json());
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const values = [
    { icon: BookOpen, title: "Éducation", description: "L'accès au savoir pour tous est notre priorité absolue" },
    { icon: Heart, title: "Solidarité", description: "Nous croyons en l'entraide et le soutien mutuel" },
    { icon: Users, title: "Inclusion", description: "Chaque personne mérite sa chance, sans discrimination" },
    { icon: Award, title: "Excellence", description: "Nous visons la qualité dans toutes nos actions" },
  ];

  const organs = [
    {
      title: "Assemblée Générale",
      description: "Instance suprême de l'ONG, elle regroupe tous les membres et définit les grandes orientations.",
    },
    {
      title: "Conseil d'Administration",
      description: "Organe de gestion stratégique, composé de membres élus par l'Assemblée Générale.",
    },
    {
      title: "Bureau Exécutif",
      description: "Assure la gestion quotidienne et la mise en œuvre des décisions du Conseil.",
    },
  ];

  return (
    <div data-testid="about-page">
      {/* Page Header */}
      <div className="page-header pt-32">
        <div className="container-custom">
          <h1 className="animate-fade-in-up">À propos de nous</h1>
          <p className="animate-fade-in-up animate-delay-100">
            Découvrez notre histoire, notre mission et notre équipe
          </p>
        </div>
      </div>

      {/* History Section */}
      <section className="py-20 bg-white" data-testid="history-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-medium mb-4 block">Notre histoire</span>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Une aventure humaine depuis 2020
              </h2>
              <div className="prose text-slate-600 space-y-4">
                <p>
                  {content.about || "L'ONG Porte du Savoir (Udditaare Ganndal) a été fondée en 2020 par un groupe d'enseignants et de professionnels engagés de Nouadhibou, convaincus que l'éducation est le moteur du développement."}
                </p>
                <p>
                  Face aux défis éducatifs de notre région, nous avons décidé d'agir concrètement en créant des programmes d'alphabétisation, de formation professionnelle et de soutien scolaire accessibles à tous.
                </p>
                <p>
                  Aujourd'hui, notre ONG compte plus de 50 membres actifs et a déjà accompagné plus de 1000 bénéficiaires dans leur parcours d'apprentissage.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1555069855-e580a9adbf43?w=800"
                alt="Notre équipe"
                className="rounded-2xl shadow-floating"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50" data-testid="mission-vision-section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-marketing">
              <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Notre Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                {content.mission || "Promouvoir l'éducation et l'accès au savoir pour tous les citoyens de Nouadhibou et de la Mauritanie. Nous croyons que l'éducation est la clé du développement durable."}
              </p>
            </div>
            <div className="card-marketing">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Notre Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                {content.vision || "Une Mauritanie où chaque personne a accès à une éducation de qualité, quel que soit son origine sociale ou économique."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white" data-testid="values-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium mb-4 block">Ce qui nous guide</span>
            <h2 className="text-3xl font-bold text-slate-900">Nos valeurs</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {values.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="card-marketing text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-sky-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">{value.title}</h4>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-20 bg-slate-50" data-testid="governance-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium mb-4 block">Organisation</span>
            <h2 className="text-3xl font-bold text-slate-900">Organes de direction</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {organs.map((organ, idx) => (
              <div key={idx} className="card-marketing">
                <div className="w-10 h-10 rounded-full bg-sky-900 text-white flex items-center justify-center font-bold mb-4">
                  {idx + 1}
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-3">{organ.title}</h4>
                <p className="text-slate-600 text-sm">{organ.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-20 bg-white" data-testid="founders-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium mb-4 block">Notre équipe</span>
            <h2 className="text-3xl font-bold text-slate-900">Membres fondateurs</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {members.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <h4 className="font-semibold text-slate-900 text-lg">{member.name}</h4>
                <span className="badge-info mt-2 inline-block">Fondateur</span>
                {member.bio && (
                  <p className="text-slate-600 text-sm mt-3">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
