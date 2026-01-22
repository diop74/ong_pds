import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Target, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.REACT_APP_BACKEND_URL;

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`);
      if (res.ok) {
        setProject(await res.json());
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Projet non trouvé</h2>
        <Link to="/projets">
          <Button className="btn-primary">Retour aux projets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="project-detail-page">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${project.image_url || "https://images.unsplash.com/flagged/photo-1579133311477-9121405c78dd?w=1200"})`,
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom pb-12">
            <Link
              to="/projets"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux projets
            </Link>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                project.status === "en_cours" ? "badge-success" : "badge-info"
              }`}
            >
              {project.status === "en_cours" ? "En cours" : "Terminé"}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Description</h2>
              <div className="prose text-slate-600 leading-relaxed">
                <p>{project.description}</p>
              </div>

              {project.objectives && (
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Target className="w-6 h-6 text-emerald-600" />
                    Objectifs
                  </h2>
                  <div className="bg-emerald-50 rounded-xl p-6">
                    <p className="text-slate-700 leading-relaxed">{project.objectives}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-marketing sticky top-24">
                <h3 className="font-semibold text-slate-900 mb-4">Informations</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Statut</p>
                      <p className="font-medium text-slate-900">
                        {project.status === "en_cours" ? "En cours" : "Terminé"}
                      </p>
                    </div>
                  </div>
                  {project.date && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Date de début</p>
                        <p className="font-medium text-slate-900">
                          {new Date(project.date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t mt-6 pt-6">
                  <p className="text-slate-600 text-sm mb-4">
                    Vous souhaitez contribuer à ce projet ?
                  </p>
                  <Link to="/contact" className="block">
                    <Button className="btn-primary w-full">Nous contacter</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
