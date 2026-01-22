import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Public Pages
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ArticlesPage from "@/pages/ArticlesPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import MembersPage from "@/pages/MembersPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ContactPage from "@/pages/ContactPage";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminArticles from "@/pages/admin/AdminArticles";
import AdminMembers from "@/pages/admin/AdminMembers";
import AdminDocuments from "@/pages/admin/AdminDocuments";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminSettings from "@/pages/admin/AdminSettings";

// Layout
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  useEffect(() => {
    // Seed initial data
    const seedData = async () => {
      try {
        const API = process.env.REACT_APP_BACKEND_URL;
        await fetch(`${API}/api/seed`, { method: "POST" });
      } catch (e) {
        console.log("Seed already done or error:", e);
      }
    };
    seedData();
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/projets" element={<ProjectsPage />} />
            <Route path="/projets/:id" element={<ProjectDetailPage />} />
            <Route path="/actualites" element={<ArticlesPage />} />
            <Route path="/actualites/:id" element={<ArticleDetailPage />} />
            <Route path="/membres" element={<MembersPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projets" element={<AdminProjects />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/membres" element={<AdminMembers />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/parametres" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
