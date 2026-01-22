import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API}/api/articles`);
      setArticles(await res.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="articles-page">
      {/* Page Header */}
      <div className="page-header pt-32">
        <div className="container-custom">
          <h1 className="animate-fade-in-up">Actualités</h1>
          <p className="animate-fade-in-up animate-delay-100">
            Suivez nos dernières nouvelles et événements
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500">Aucun article publié pour le moment</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/actualites/${article.id}`}
                  className="article-card group"
                  data-testid={`article-card-${article.id}`}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image_url || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600"}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 badge-info">{article.category}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3 flex-1">{article.excerpt}</p>
                    <div className="mt-4 flex items-center text-sky-600 font-medium text-sm">
                      Lire la suite
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
