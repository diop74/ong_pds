import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    file_type: "pdf",
    category: "statuts",
  });

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non autorisé. Utilisez PDF ou DOC.");
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
      const res = await fetch(`${API}/api/upload/document`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        // Detect file type from filename
        const ext = file.name.split(".").pop().toLowerCase();
        const fileType = ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : "doc";
        
        setFormData({ 
          ...formData, 
          file_url: `${API}${data.url}`,
          file_type: fileType,
          title: formData.title || file.name.replace(/\.[^/.]+$/, "")
        });
        toast.success("Document téléchargé");
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

    try {
      const res = await fetch(`${API}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Document ajouté");
        fetchDocuments();
        closeModal();
      } else {
        toast.error("Erreur lors de l'ajout");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Document supprimé");
        fetchDocuments();
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      file_url: "",
      file_type: "pdf",
      category: "statuts",
    });
  };

  const getCategoryLabel = (cat) => {
    const labels = { statuts: "Statuts", reglement: "Règlement", autre: "Autre" };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-documents">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-1">Gérez les documents officiels de l'ONG</p>
        </div>
        <Button className="btn-primary" onClick={() => setShowModal(true)} data-testid="add-document-btn">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau document
        </Button>
      </div>

      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  Aucun document
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id} data-testid={`document-row-${doc.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="badge-info">{getCategoryLabel(doc.category)}</span>
                  </TableCell>
                  <TableCell className="uppercase text-xs text-slate-500">{doc.file_type}</TableCell>
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-sky-600">
                        Voir
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-document-${doc.id}`}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="document-form">
            {/* File Upload */}
            <div>
              <Label>Fichier du document *</Label>
              <div className="mt-2">
                {formData.file_url ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800">Document téléchargé</p>
                      <p className="text-xs text-emerald-600 truncate">{formData.file_url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, file_url: "" })}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                      {uploading ? "Téléchargement..." : "Cliquez pour télécharger un document"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX (max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="document-file-upload"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
                data-testid="document-title-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="mt-1"
                data-testid="document-description-input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="document-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statuts">Statuts</SelectItem>
                    <SelectItem value="reglement">Règlement</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file_type">Type de fichier</Label>
                <Select
                  value={formData.file_type}
                  onValueChange={(value) => setFormData({ ...formData, file_type: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="document-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fallback URL input */}
            {!formData.file_url && (
              <div>
                <Label htmlFor="file_url" className="text-xs text-slate-500">Ou entrez une URL externe</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="mt-1"
                  data-testid="document-url-input"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="btn-primary" 
                disabled={!formData.file_url}
                data-testid="document-submit-btn"
              >
                Ajouter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
