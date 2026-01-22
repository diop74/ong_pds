import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

const categories = ["Événements", "Actualités", "Annonces", "Partenariats"];

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Actualités",
    image_url: "",
    published: true,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API}/api/articles?published_only=false`);
      setArticles(await res.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Maximum 10MB.");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch(`${API}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, image_url: `${API}${data.url}` });
        toast.success("Image téléchargée");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Erreur lors du téléchargement");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingArticle
      ? `${API}/api/articles/${editingArticle.id}`
      : `${API}/api/articles`;
    const method = editingArticle ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingArticle ? "Article modifié" : "Article créé");
        fetchArticles();
        closeModal();
      } else {
        toast.error("Erreur lors de l'opération");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Article supprimé");
        fetchArticles();
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const openModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        image_url: article.image_url || "",
        published: article.published,
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "Actualités",
        image_url: "",
        published: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArticle(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-articles">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Articles</h1>
          <p className="text-slate-600 mt-1">Gérez vos actualités et publications</p>
        </div>
        <Button className="btn-primary" onClick={() => openModal()} data-testid="add-article-btn">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  Aucun article
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} data-testid={`article-row-${article.id}`}>
                  <TableCell>
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                        <Image className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <span className="badge-info">{article.category}</span>
                  </TableCell>
                  <TableCell>
                    <span className={article.published ? "badge-success" : "badge-warning"}>
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(article.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(article)}
                      data-testid={`edit-article-${article.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-article-${article.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? "Modifier l'article" : "Nouvel article"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="article-form">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
                data-testid="article-title-input"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Résumé *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                required
                rows={2}
                className="mt-1"
                placeholder="Un court résumé de l'article..."
                data-testid="article-excerpt-input"
              />
            </div>
            <div>
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={8}
                className="mt-1"
                placeholder="Le contenu complet de l'article..."
                data-testid="article-content-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="article-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  data-testid="article-published-switch"
                />
                <Label>Publier</Label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Image de l'article</Label>
              <div className="mt-2">
                {formData.image_url ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image_url}
                      alt="Aperçu"
                      className="w-full max-w-xs h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                      {uploading ? "Téléchargement..." : "Cliquez pour télécharger une image"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF (max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="article-image-upload"
                />
              </div>
              <div className="mt-2">
                <Label htmlFor="image_url" className="text-xs text-slate-500">Ou URL externe</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                  data-testid="article-image-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" className="btn-primary" data-testid="article-submit-btn">
                {editingArticle ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
