import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.REACT_APP_BACKEND_URL;

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API}/api/projects`);
      setProjects(await res.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = filter === "all" 
    ? projects 
    : projects.filter(p => p.status === filter);

  return (
    <div data-testid="projects-page">
      {/* Page Header */}
      <div className="page-header pt-32">
        <div className="container-custom">
          <h1 className="animate-fade-in-up">Nos Projets</h1>
          <p className="animate-fade-in-up animate-delay-100">
            Découvrez toutes nos initiatives pour promouvoir l'éducation
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10" data-testid="project-filters">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              className={`rounded-full ${filter === "all" ? "bg-sky-900" : ""}`}
              onClick={() => setFilter("all")}
            >
              <Filter className="w-4 h-4 mr-2" />
              Tous les projets
            </Button>
            <Button
              variant={filter === "en_cours" ? "default" : "outline"}
              className={`rounded-full ${filter === "en_cours" ? "bg-emerald-600" : ""}`}
              onClick={() => setFilter("en_cours")}
            >
              En cours
            </Button>
            <Button
              variant={filter === "termine" ? "default" : "outline"}
              className={`rounded-full ${filter === "termine" ? "bg-sky-600" : ""}`}
              onClick={() => setFilter("termine")}
            >
              Terminés
            </Button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500">Aucun projet trouvé</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projets/${project.id}`}
                  className="project-card group"
                  data-testid={`project-card-${project.id}`}
                >
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
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                      {project.description}
                    </p>
                    {project.date && (
                      <p className="text-slate-400 text-xs mb-3">
                        Démarré le {new Date(project.date).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                    <div className="flex items-center text-sky-600 font-medium text-sm">
                      Voir le projet
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
