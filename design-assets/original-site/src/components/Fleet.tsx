import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Cog, Fuel, Eye } from "lucide-react";
import { vehicles, categories, VehicleCategory } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";

export default function Fleet() {
  const [activeCategory, setActiveCategory] = useState<VehicleCategory>("Tous");
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();

  const filteredVehicles = activeCategory === "Tous" 
    ? vehicles 
    : vehicles.filter(v => v.category === activeCategory);

  const handleReserve = (vehicleName: string) => {
    const message = `Bonjour, je suis intéressé par la location de ${vehicleName}. Pouvez-vous me donner plus d'informations ?`;
    window.location.href = `https://wa.me/212612132748?text=${encodeURIComponent(message)}`;
  };

  const categoryLabels: Record<VehicleCategory, string> = {
    "Tous": t.fleet.all,
    "Économique": t.fleet.economic,
    "Compacte": t.fleet.compact,
    "Berline": t.fleet.sedan,
    "Cabriolet": t.fleet.convertible,
    "Sport": t.fleet.sport,
    "SUV": t.fleet.suv,
    "SUV Premium": t.fleet.suvPremium,
    "Luxe": t.fleet.luxury,
    "Van": t.fleet.van,
  };

  return (
    <section id="flotte" className={`py-24 section-elevated section-divider ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            {t.fleet.subtitle}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t.fleet.titleStart} <span className="text-primary">{t.fleet.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.fleet.description}
          </p>
        </div>

        {/* Category Filters */}
        <div className={`flex flex-wrap justify-center gap-3 mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="glass-card overflow-hidden group card-hover"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                  <span className="bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {categoryLabels[vehicle.category as VehicleCategory]}
                  </span>
                </div>
                {/* View Details Overlay */}
                <Link
                  to={`/vehicule/${vehicle.id}`}
                  className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                >
                  <span className={`flex items-center gap-2 text-foreground font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Eye className="w-5 h-5" />
                    {t.fleet.viewDetails}
                  </span>
                </Link>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  {vehicle.name}
                </h3>

                {/* Specs with colored icons */}
                <div className={`flex items-center gap-4 text-sm mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{vehicle.seats} {t.fleet.seats}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Cog className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{vehicle.transmission}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Fuel className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{vehicle.fuel}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className={`flex items-center justify-between pt-4 border-t border-border/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <span className="text-muted-foreground text-xs">{t.fleet.from}</span>
                    <div className="text-primary font-display text-xl font-bold">
                      {formatPrice(vehicle.pricePerDay)}<span className="text-sm font-normal text-muted-foreground">{t.fleet.perDay}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReserve(vehicle.name)}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    {t.fleet.book}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
