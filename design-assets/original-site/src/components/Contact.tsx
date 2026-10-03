import { useState } from "react";
import { Send, ChevronDown, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { vehicles } from "@/data/vehicles";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
    vehicle: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Bonjour, je suis ${formData.name}.\n\nEmail: ${formData.email}\nDate de début: ${formData.startDate}\nDate de fin: ${formData.endDate}\nVéhicule souhaité: ${formData.vehicle}\n\nMessage: ${formData.message}`;
    window.location.href = `https://wa.me/212612132748?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="contact" className="py-24 section-elevated">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Contactez-Nous
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Réservez Votre <span className="text-primary">Véhicule</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Remplissez le formulaire ci-dessous ou contactez-nous directement via WhatsApp pour une réponse rapide.
          </p>
        </div>

        {/* Form Card - Centered */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-2xl bg-secondary/30 border border-white/5 p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-0 rounded-lg px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-0 rounded-lg px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">Date de Début</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-0 rounded-lg px-4 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">Date de Fin</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-0 rounded-lg px-4 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">Véhicule Souhaité</label>
                <div className="relative">
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full bg-[#1a1a1a] border-0 rounded-lg px-4 py-3.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#1a1a1a] text-foreground">Sélectionnez un véhicule</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.name} className="bg-[#1a1a1a] text-foreground">
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#1a1a1a] border-0 rounded-lg px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
              >
                <Send className="w-5 h-5" />
                Envoyer via WhatsApp
              </button>
            </form>
          </div>

          {/* Contact Info Card */}
          <div className="rounded-2xl bg-secondary/30 border border-white/5 p-8">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              Informations de Contact
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">WhatsApp</h4>
                  <a href="tel:+212612132748" className="text-muted-foreground hover:text-primary transition-colors">+212 612-132748</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Email</h4>
                  <a href="mailto:contact.drive.prime@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">contact.drive.prime@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Adresse</h4>
                  <span className="text-muted-foreground">Marrakech, Maroc</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA Card */}
          <div className="rounded-2xl bg-primary/10 border border-primary/30 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Réponse Rapide
            </h3>
            <p className="text-muted-foreground mb-6">
              Contactez-nous directement sur WhatsApp pour une réponse instantanée.
            </p>
            <a
              href="https://wa.me/212612132748"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 rounded-lg transition-colors duration-300"
            >
              <Phone className="w-5 h-5" />
              Contacter sur WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
