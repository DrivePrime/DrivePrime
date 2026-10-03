import { MessageCircle, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.png";

// Custom TikTok icon since lucide doesn't have one
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="#00F2EA" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#flotte", label: "Notre Flotte" },
  { href: "#services", label: "Services" },
  { href: "#pourquoi", label: "Pourquoi Nous" },
  { href: "#temoignages", label: "Témoignages" },
  { href: "#contact", label: "Contact" },
];

export default function Footer() {
  const { isRTL } = useLanguage();
  
  return (
    <footer className={`bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column - Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={logo} 
                alt="Drive Prime Logo" 
                className="w-14 h-14 rounded-full object-cover"
              />
              <span className="font-display text-2xl font-semibold text-primary">
                Drive Prime
              </span>
            </div>
            
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              Location de voitures haut de gamme à Marrakech. Confort, élégance et excellence pour une expérience de conduite inoubliable dans la ville ocre.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mb-10">
              <a
                href="https://www.instagram.com/location_drive_prime_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" style={{ color: '#E4405F' }} />
              </a>
              <a
                href="https://www.tiktok.com/@drive.prime?_r=1&_t=ZN-92UXsBrZTFe"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors duration-300"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://wa.me/212612132748"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors duration-300"
              >
                <Phone className="w-5 h-5" style={{ color: '#22C55E' }} />
              </a>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href="tel:+212612132748" className="hover:text-primary transition-colors">+212 612-132748</a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:contact.drive.prime@gmail.com" className="hover:text-primary transition-colors">contact.drive.prime@gmail.com</a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Marrakech, Maroc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Navigation */}
          <div className="md:pl-12">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">
              Navigation
            </h3>
            <nav className="space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 Drive Prime. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-300">
                Mentions Légales
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors duration-300">
                Politique de Confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/212612132748"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform duration-300 z-50"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </footer>
  );
}
