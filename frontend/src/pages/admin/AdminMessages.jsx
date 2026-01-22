import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(await res.json());
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/api/contact/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages();
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Message supprimé");
        fetchMessages();
        setSelectedMessage(null);
      }
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      handleMarkAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-messages">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600 mt-1">Messages reçus via le formulaire de contact</p>
      </div>

      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>De</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  Aucun message
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={`cursor-pointer ${!message.read ? "bg-sky-50" : ""}`}
                  onClick={() => openMessage(message)}
                  data-testid={`message-row-${message.id}`}
                >
                  <TableCell>
                    {message.read ? (
                      <MailOpen className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Mail className="w-4 h-4 text-sky-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className={`${!message.read ? "font-semibold" : ""}`}>
                        {message.name}
                      </span>
                      <p className="text-xs text-slate-500">{message.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className={`${!message.read ? "font-semibold" : ""}`}>
                    {message.subject}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(message.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMessage(message);
                      }}
                      data-testid={`view-message-${message.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-message-${message.id}`}
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

      {/* Message Detail Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4" data-testid="message-detail">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900">{selectedMessage.name}</p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sky-600 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <span className="text-slate-500">
                  {new Date(selectedMessage.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="border-t pt-4">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                  <Button className="btn-primary">
                    <Mail className="w-4 h-4 mr-2" />
                    Répondre
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
