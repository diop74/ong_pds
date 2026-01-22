import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, BookOpen, Award, Target, Heart, GraduationCap, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.REACT_APP_BACKEND_URL;

export default function HomePage() {
  const [stats, setStats] = useState({ projects_count: 0, articles_count: 0, members_count: 0 });
  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [content, setContent] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, projectsRes, articlesRes, contentRes] = await Promise.all([
        fetch(`${API}/api/stats`),
        fetch(`${API}/api/projects`),
        fetch(`${API}/api/articles`),
        fetch(`${API}/api/content`),
      ]);
      setStats(await statsRes.json());
      setProjects((await projectsRes.json()).slice(0, 3));
      setArticles((await articlesRes.json()).slice(0, 2));
      
      const contentData = await contentRes.json();
      const contentMap = {};
      contentData.forEach((c) => (contentMap[c.key] = c.value));
      setContent(contentMap);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        <div
          className="hero-background"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1521493959102-bdd6677fdd81?w=1600)`,
          }}
        />
        <div className="container-custom relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-300 text-sm font-medium mb-6 animate-fade-in-up">
              ONG basée à Nouadhibou, Mauritanie
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up animate-delay-100">
              Porte du Savoir
              <span className="block text-emerald-400 mt-2 font-accent text-3xl sm:text-4xl">
                Udditaare Ganndal
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
              {content.mission || "Promouvoir l'éducation et l'accès au savoir pour tous les citoyens de Nouadhibou et de la Mauritanie."}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
              <Link to="/projets">
                <Button className="btn-primary text-base">
                  Découvrir nos projets
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/membres">
                <Button className="btn-outline border-white text-white hover:bg-white/10">
                  Nous rejoindre
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-20 relative z-20" data-testid="stats-section">
        <div className="container-custom">
          <div className="stats-grid stagger-children">
            <div className="stat-card">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-sky-600" />
              </div>
              <div className="stat-number">{stats.projects_count || 12}+</div>
              <div className="stat-label">Projets réalisés</div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="stat-number">{stats.members_count || 50}+</div>
              <div className="stat-label">Membres actifs</div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6 text-amber-600" />
              </div>
              <div className="stat-number">1000+</div>
              <div className="stat-label">Bénéficiaires</div>
            </div>
            <div className="stat-card">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="stat-number">5</div>
              <div className="stat-label">Années d'expérience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32 bg-white" data-testid="mission-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="text-emerald-600 font-medium mb-4 block">Notre mission</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                L'éducation, clé du développement durable
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                {content.about || "Fondée en 2020, l'ONG Porte du Savoir œuvre pour la promotion de l'éducation à Nouadhibou. Notre équipe de bénévoles dévoués travaille chaque jour pour offrir des opportunités d'apprentissage à ceux qui en ont le plus besoin."}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Alphabétisation</h4>
                    <p className="text-slate-600 text-sm">Programmes de lecture et écriture pour tous les âges</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Formation professionnelle</h4>
                    <p className="text-slate-600 text-sm">Compétences numériques et métiers d'avenir</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Soutien social</h4>
                    <p className="text-slate-600 text-sm">Accompagnement des familles et jeunes en difficulté</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/a-propos">
                  <Button className="btn-secondary">
                    En savoir plus
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1555069855-e580a9adbf43?w=800"
                alt="Communauté"
                className="rounded-2xl shadow-floating w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-floating hidden lg:block">
                <p className="font-accent text-2xl text-sky-900">
                  "L'éducation est l'arme la plus puissante"
                </p>
                <p className="text-slate-500 text-sm mt-1">— Nelson Mandela</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 lg:py-32 bg-slate-50" data-testid="projects-section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium mb-4 block">Nos actions</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Projets en cours
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Découvrez nos initiatives pour promouvoir l'éducation et le développement à Nouadhibou
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {projects.map((project) => (
              <Link key={project.id} to={`/projets/${project.id}`} className="project-card group">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image_url || "https://images.unsplash.com/flagged/photo-1579133311477-9121405c78dd?w=600"}
                    alt={project.title}
                    className="project-card-image transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "en_cours" ? "badge-success" : "badge-info"
                    }`}
                  >
                    {project.status === "en_cours" ? "En cours" : "Terminé"}
                  </span>
                </div>
                <div className="project-card-content">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{project.description}</p>
                  <div className="mt-4 flex items-center text-sky-600 font-medium text-sm">
                    En savoir plus
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/projets">
              <Button className="btn-primary">
                Voir tous les projets
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 lg:py-32 bg-white" data-testid="news-section">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <span className="text-emerald-600 font-medium mb-4 block">Actualités</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Dernières nouvelles
              </h2>
            </div>
            <Link to="/actualites">
              <Button variant="outline" className="btn-outline">
                Toutes les actualités
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8 stagger-children">
            {articles.map((article) => (
              <Link key={article.id} to={`/actualites/${article.id}`} className="article-card group">
                <div className="relative overflow-hidden">
                  <img
                    src={article.image_url || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600"}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 badge-info">{article.category}</span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 flex-1">{article.excerpt}</p>
                  <div className="mt-4 flex items-center text-sky-600 font-medium text-sm">
                    Lire l'article
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-sky-900 to-emerald-800" data-testid="cta-section">
        <div className="container-custom text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Rejoignez notre mission
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Ensemble, construisons un avenir meilleur par l'éducation. Votre soutien fait la différence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/membres">
              <Button className="btn-accent text-base">
                <Users className="w-5 h-5 mr-2" />
                Devenir membre
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-white text-sky-900 hover:bg-slate-100 rounded-full px-8 py-3 font-medium transition-all">
                <Heart className="w-5 h-5 mr-2" />
                Faire un don
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
