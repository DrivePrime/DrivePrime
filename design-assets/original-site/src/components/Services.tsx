import { Clock, UserCheck, Plane, Building, Headphones, MessageCircle } from "lucide-react";

const services = [
  {
    icon: Clock,
    title: "Location Courte & Longue Durée",
    description: "Que ce soit pour un jour ou plusieurs mois, nous proposons des formules adaptées à vos besoins avec des tarifs dégressifs."
  },
  {
    icon: UserCheck,
    title: "Location avec Chauffeur",
    description: "Profitez de nos chauffeurs professionnels et expérimentés pour vos déplacements en toute sérénité."
  },
  {
    icon: Plane,
    title: "Transfert Aéroport",
    description: "Service de transfert depuis et vers l'aéroport Marrakech Menara avec accueil personnalisé."
  },
  {
    icon: Building,
    title: "Livraison à l'Hôtel",
    description: "Nous livrons votre véhicule directement à votre hôtel, riad ou villa, partout à Marrakech."
  },
  {
    icon: Headphones,
    title: "Assistance 24h/24",
    description: "Une équipe dédiée à votre service, disponible jour et nuit pour répondre à toutes vos demandes."
  },
  {
    icon: MessageCircle,
    title: "Réservation Rapide",
    description: "Réservez en quelques minutes via WhatsApp. Simple, rapide et efficace."
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 section-gold-accent section-divider">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Ce Que Nous Offrons
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Nos <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une gamme complète de services pour rendre votre expérience de location aussi fluide et agréable que possible.
          </p>
        </div>

        {/* Services Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl bg-secondary/30 border border-white/5 p-8 group hover:border-white/10 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
