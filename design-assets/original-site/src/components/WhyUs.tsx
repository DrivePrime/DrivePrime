import { Award, DollarSign, Users, MessageCircle, Star } from "lucide-react";

const reasons = [
  {
    icon: Award,
    title: "Service Premium",
    description: "Une qualité de service irréprochable avec des véhicules entretenus et préparés avec soin."
  },
  {
    icon: DollarSign,
    title: "Meilleurs Prix",
    description: "Les tarifs les plus compétitifs de Marrakech, sans frais cachés ni surprises."
  },
  {
    icon: Users,
    title: "Assistance Personnalisée",
    description: "Une équipe dédiée pour vous accompagner et répondre à tous vos besoins."
  },
  {
    icon: MessageCircle,
    title: "Réservation via WhatsApp",
    description: "Réservez facilement et rapidement via WhatsApp, sans formalités compliquées."
  }
];

const stats = [
  { value: "8+", label: "Années d'expérience" },
  { value: "50+", label: "Véhicules disponibles" },
  { value: "1000+", label: "Clients satisfaits" },
  { value: "4.9", label: "Note moyenne", hasStar: true }
];

export default function WhyUs() {
  return (
    <section id="pourquoi" className="py-24 section-elevated section-divider">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Pourquoi Drive Prime
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Pourquoi Nous <span className="text-primary">Choisir</span> ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Drive Prime s'engage à vous offrir une expérience de location exceptionnelle, alliant qualité, fiabilité et service client irréprochable.
          </p>
        </div>

        {/* Reasons Grid - 2x2 layout with horizontal cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-2xl bg-secondary/30 border border-white/5 p-6 flex items-start gap-5 hover:border-white/10 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <reason.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="rounded-2xl bg-primary/10 border border-primary/30 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <div className="text-primary font-display text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-2">
                  {stat.value}
                  {stat.hasStar && <Star className="w-6 h-6 md:w-8 md:h-8 fill-primary text-primary" />}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
