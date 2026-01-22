import { useState, useEffect } from "react";
import { FolderKanban, Newspaper, Users, Mail, UserPlus, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    articles: 0,
    members: 0,
    pending_members: 0,
    messages: 0,
    unread_messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Projets",
      value: stats.projects,
      icon: FolderKanban,
      color: "sky",
      link: "/admin/projets",
    },
    {
      title: "Articles",
      value: stats.articles,
      icon: Newspaper,
      color: "emerald",
      link: "/admin/articles",
    },
    {
      title: "Membres",
      value: stats.members,
      icon: Users,
      color: "purple",
      link: "/admin/membres",
    },
    {
      title: "Demandes en attente",
      value: stats.pending_members,
      icon: UserPlus,
      color: "amber",
      link: "/admin/membres",
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: Mail,
      color: "rose",
      link: "/admin/messages",
    },
    {
      title: "Non lus",
      value: stats.unread_messages,
      icon: MessageSquare,
      color: "orange",
      link: "/admin/messages",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600 mt-1">Vue d'ensemble de votre ONG</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="dashboard-card hover:shadow-md transition-shadow"
              data-testid={`stat-card-${card.title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{card.title}</p>
                  <p className="dashboard-stat mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/projets"
            className="flex items-center gap-3 p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            data-testid="quick-action-projects"
          >
            <FolderKanban className="w-5 h-5 text-sky-600" />
            <span className="text-slate-700 font-medium">Gérer les projets</span>
          </Link>
          <Link
            to="/admin/articles"
            className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            data-testid="quick-action-articles"
          >
            <Newspaper className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-700 font-medium">Gérer les articles</span>
          </Link>
          <Link
            to="/admin/membres"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            data-testid="quick-action-members"
          >
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-slate-700 font-medium">Gérer les membres</span>
          </Link>
          <Link
            to="/admin/messages"
            className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
            data-testid="quick-action-messages"
          >
            <Mail className="w-5 h-5 text-rose-600" />
            <span className="text-slate-700 font-medium">Voir les messages</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
