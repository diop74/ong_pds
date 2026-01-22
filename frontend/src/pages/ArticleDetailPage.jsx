import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.REACT_APP_BACKEND_URL;

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`${API}/api/articles/${id}`);
      if (res.ok) {
        setArticle(await res.json());
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

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Article non trouvé</h2>
        <Link to="/actualites">
          <Button className="btn-primary">Retour aux actualités</Button>
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="article-detail-page">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[350px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${article.image_url || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200"})`,
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom pb-12">
            <Link
              to="/actualites"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux actualités
            </Link>
            <span className="badge-info mb-4 inline-block">{article.category}</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {article.category}
              </div>
            </div>

            {/* Article Content */}
            <div className="rich-content">
              <p className="text-lg text-slate-700 font-medium mb-6">{article.excerpt}</p>
              <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>

            {/* Share & CTA */}
            <div className="mt-12 pt-8 border-t">
              <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl p-8 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Vous souhaitez nous soutenir ?
                </h3>
                <p className="text-slate-600 mb-6">
                  Rejoignez notre communauté et contribuez à nos actions éducatives.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/membres">
                    <Button className="btn-primary">Devenir membre</Button>
                  </Link>
                  <Link to="/contact">
                    <Button className="btn-secondary">Nous contacter</Button>
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
