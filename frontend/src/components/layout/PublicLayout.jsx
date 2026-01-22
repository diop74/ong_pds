import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, Heart, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "À propos", path: "/a-propos" },
  { name: "Projets", path: "/projets" },
  { name: "Actualités", path: "/actualites" },
  { name: "Membres", path: "/membres" },
  { name: "Documents", path: "/documents" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-header py-3" : "bg-transparent py-5"
      }`}
      data-testid="header"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-900 to-emerald-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className={`${isScrolled ? "text-slate-900" : "text-white"}`}>
              <h1 className="text-lg font-bold leading-tight">Porte du Savoir</h1>
              <p className="text-xs opacity-80">Udditaare Ganndal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? isScrolled
                      ? "bg-sky-100 text-sky-900"
                      : "bg-white/20 text-white"
                    : isScrolled
                    ? "text-slate-600 hover:text-sky-900 hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/contact">
              <Button
                variant="ghost"
                className={`rounded-full ${
                  isScrolled ? "text-sky-900 hover:bg-sky-50" : "text-white hover:bg-white/10"
                }`}
                data-testid="contact-btn-header"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="btn-accent" data-testid="donate-btn">
                <Heart className="w-4 h-4 mr-2" />
                Faire un don
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? "text-slate-900" : "text-white"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? "text-slate-900" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-900 to-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sky-900">Porte du Savoir</span>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? "bg-sky-100 text-sky-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.name}
                <ChevronRight className="w-4 h-4" />
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t">
            <Link to="/contact" className="block">
              <Button className="btn-accent w-full" data-testid="mobile-donate-btn">
                <Heart className="w-4 h-4 mr-2" />
                Faire un don
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="footer" data-testid="footer">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Porte du Savoir</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              ONG dédiée à la promotion de l'éducation et l'accès au savoir à Nouadhibou, Mauritanie.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/a-propos">À propos</Link></li>
              <li><Link to="/projets">Nos projets</Link></li>
              <li><Link to="/actualites">Actualités</Link></li>
              <li><Link to="/membres">Devenir membre</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Documents</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/documents">Statuts de l'ONG</Link></li>
              <li><Link to="/documents">Règlement intérieur</Link></li>
              <li><Link to="/contact">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Quartier Numerowatt</li>
              <li>Nouadhibou, Mauritanie</li>
              <li>thiamabdoulaye2245@gmail.com</li>
              <li>+222 44 45 03 66</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Porte du Savoir (Udditaare Ganndal). Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/documents" className="hover:text-white">Mentions légales</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
