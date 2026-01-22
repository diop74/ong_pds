import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    status: "en_cours",
    image_url: "",
    date: "",
  });

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
    const url = editingProject
      ? `${API}/api/projects/${editingProject.id}`
      : `${API}/api/projects`;
    const method = editingProject ? "PUT" : "POST";

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
        toast.success(editingProject ? "Projet modifié" : "Projet créé");
        fetchProjects();
        closeModal();
      } else {
        toast.error("Erreur lors de l'opération");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce projet ?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Projet supprimé");
        fetchProjects();
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        objectives: project.objectives,
        status: project.status,
        image_url: project.image_url || "",
        date: project.date || "",
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        objectives: "",
        status: "en_cours",
        image_url: "",
        date: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-projects">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projets</h1>
          <p className="text-slate-600 mt-1">Gérez vos projets et initiatives</p>
        </div>
        <Button className="btn-primary" onClick={() => openModal()} data-testid="add-project-btn">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  Aucun projet
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} data-testid={`project-row-${project.id}`}>
                  <TableCell>
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                        <Image className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <span className={project.status === "en_cours" ? "badge-success" : "badge-info"}>
                      {project.status === "en_cours" ? "En cours" : "Terminé"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {project.date ? new Date(project.date).toLocaleDateString("fr-FR") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(project)}
                      data-testid={`edit-project-${project.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-project-${project.id}`}
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Modifier le projet" : "Nouveau projet"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="project-form">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
                data-testid="project-title-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="mt-1"
                data-testid="project-description-input"
              />
            </div>
            <div>
              <Label htmlFor="objectives">Objectifs *</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                required
                rows={2}
                className="mt-1"
                data-testid="project-objectives-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="project-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date de début</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                  data-testid="project-date-input"
                />
              </div>
            </div>
            
            {/* Image Upload */}
            <div>
              <Label>Image du projet</Label>
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
                  data-testid="project-image-upload"
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
                  data-testid="project-image-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" className="btn-primary" data-testid="project-submit-btn">
                {editingProject ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
