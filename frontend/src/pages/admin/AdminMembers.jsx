import { useState, useEffect } from "react";
import { Check, X, Trash2, Users, UserPlus, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    member_type: "actif",
    bio: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [membersRes, pendingRes] = await Promise.all([
        fetch(`${API}/api/members`),
        fetch(`${API}/api/members/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setMembers(await membersRes.json());
      setPendingMembers(await pendingRes.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, memberType) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/members/${id}/approve?member_type=${memberType}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Membre approuvé");
        fetchData();
      }
    } catch (e) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Rejeter cette demande ?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/members/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Demande rejetée");
        fetchData();
      }
    } catch (e) {
      toast.error("Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce membre ?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Membre supprimé");
        fetchData();
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = editingMember
      ? `${API}/api/members/${editingMember.id}`
      : `${API}/api/members`;
    const method = editingMember ? "PUT" : "POST";

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
        toast.success(editingMember ? "Membre modifié" : "Membre ajouté");
        fetchData();
        closeModal();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Erreur lors de l'opération");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        member_type: member.member_type,
        bio: member.bio || "",
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        member_type: "actif",
        bio: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-members">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Membres</h1>
          <p className="text-slate-600 mt-1">Gérez les membres et les demandes d'adhésion</p>
        </div>
        <Button className="btn-primary" onClick={() => openModal()} data-testid="add-member-btn">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      <Tabs defaultValue="approved" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approved" className="gap-2" data-testid="tab-approved">
            <Users className="w-4 h-4" />
            Membres ({members.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
            <UserPlus className="w-4 h-4" />
            Demandes ({pendingMembers.length})
          </TabsTrigger>
        </TabsList>

        {/* Approved Tab */}
        <TabsContent value="approved">
          <div className="dashboard-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Aucun membre
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} data-testid={`member-row-${member.id}`}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <span
                          className={
                            member.member_type === "fondateur"
                              ? "badge-warning"
                              : member.member_type === "honneur"
                              ? "badge-info"
                              : "badge-success"
                          }
                        >
                          {member.member_type === "fondateur"
                            ? "Fondateur"
                            : member.member_type === "honneur"
                            ? "Honneur"
                            : "Actif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(member)}
                          data-testid={`edit-member-${member.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-member-${member.id}`}
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
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <div className="dashboard-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Motivation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Aucune demande en attente
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingMembers.map((member) => (
                    <TableRow key={member.id} data-testid={`pending-row-${member.id}`}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">{member.motivation}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue="actif"
                          onValueChange={(value) => handleApprove(member.id, value)}
                        >
                          <SelectTrigger className="w-32" data-testid={`type-select-${member.id}`}>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="actif">Actif</SelectItem>
                            <SelectItem value="fondateur">Fondateur</SelectItem>
                            <SelectItem value="honneur">Honneur</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(member.id, "actif")}
                          className="text-green-600 hover:text-green-700"
                          data-testid={`approve-${member.id}`}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(member.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`reject-${member.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Member Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Modifier le membre" : "Ajouter un membre"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="member-form">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
                data-testid="member-name-input"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1"
                data-testid="member-email-input"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-1"
                placeholder="+222 XX XX XX XX"
                data-testid="member-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="member_type">Type de membre</Label>
              <Select
                value={formData.member_type}
                onValueChange={(value) => setFormData({ ...formData, member_type: value })}
              >
                <SelectTrigger className="mt-1" data-testid="member-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="fondateur">Fondateur</SelectItem>
                  <SelectItem value="honneur">Honneur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="mt-1"
                placeholder="Courte description du membre..."
                data-testid="member-bio-input"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit" className="btn-primary" data-testid="member-submit-btn">
                {editingMember ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
