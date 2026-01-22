import { useState, useEffect } from "react";
import { FileText, Download, BookOpen, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.REACT_APP_BACKEND_URL;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API}/api/documents`);
      setDocuments(await res.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const documentCategories = [
    {
      key: "statuts",
      title: "Statuts de l'ONG",
      description: "Document fondateur définissant l'objet, les objectifs et le fonctionnement de l'organisation.",
      icon: Scale,
      color: "sky",
    },
    {
      key: "reglement",
      title: "Règlement Intérieur",
      description: "Règles de fonctionnement interne, droits et devoirs des membres.",
      icon: BookOpen,
      color: "emerald",
    },
    {
      key: "autre",
      title: "Autres Documents",
      description: "Rapports d'activité, comptes rendus et autres documents officiels.",
      icon: FileText,
      color: "amber",
    },
  ];

  const getCategoryDocs = (category) => {
    return documents.filter((doc) => doc.category === category);
  };

  return (
    <div data-testid="documents-page">
      {/* Page Header */}
      <div className="page-header pt-32">
        <div className="container-custom">
          <h1 className="animate-fade-in-up">Documents Officiels</h1>
          <p className="animate-fade-in-up animate-delay-100">
            Consultez et téléchargez nos documents légaux et administratifs
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
          ) : (
            <div className="space-y-12">
              {documentCategories.map((category) => {
                const Icon = category.icon;
                const categoryDocs = getCategoryDocs(category.key);

                return (
                  <div key={category.key} data-testid={`category-${category.key}`}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-${category.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${category.color}-600`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                        <p className="text-slate-600 text-sm mt-1">{category.description}</p>
                      </div>
                    </div>

                    {categoryDocs.length === 0 ? (
                      <div className="card-marketing text-center py-10">
                        <p className="text-slate-500">Aucun document disponible dans cette catégorie</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryDocs.map((doc) => (
                          <div key={doc.id} className="card-marketing" data-testid={`document-${doc.id}`}>
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-slate-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{doc.description}</p>
                                <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded uppercase">
                                  {doc.file_type}
                                </span>
                              </div>
                            </div>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 block"
                            >
                              <Button className="btn-secondary w-full" data-testid={`download-${doc.id}`}>
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </Button>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-16 bg-sky-50 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <Scale className="w-8 h-8 text-sky-600" />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Transparence et légalité
                </h3>
                <p className="text-slate-600">
                  L'ONG Porte du Savoir s'engage à respecter la réglementation mauritanienne 
                  sur les associations et à maintenir une transparence totale dans sa gestion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
