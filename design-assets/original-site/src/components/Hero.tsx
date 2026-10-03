import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Car, ArrowRight, ChevronDown } from "lucide-react";
import { vehicles, locations } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import heroBg from "@/assets/hero-bg.png";

export default function Hero() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("Marrakech - Aéroport");
  const [vehicle, setVehicle] = useState("");
  const { t, isRTL } = useLanguage();

  const handleReserve = () => {
    const message = `Bonjour, je souhaite réserver un véhicule:\n- Lieu: ${location}\n- Date de départ: ${startDate}\n- Date de retour: ${endDate}\n- Véhicule: ${vehicle || t.hero.allVehicles}`;
    window.location.href = `https://wa.me/212612132748?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="accueil" className={`relative min-h-screen flex items-center justify-center pt-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Range Rover de luxe à Marrakech"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-6 py-3 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-primary text-sm font-medium">{t.hero.badge}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            {t.hero.title}{" "}
            <span className="text-gradient-gold">{t.hero.titleHighlight}</span>
            {" "}{t.hero.titleEnd}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg mb-12 max-w-2xl mx-auto"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* Booking Form - Dark Fields Layout */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-secondary/95 backdrop-blur-md rounded-2xl p-8 md:p-10 max-w-4xl mx-auto border border-border/30"
          >
            {/* Row 1: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Start Date */}
              <div>
                <label className={`flex items-center gap-2 text-primary text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-5 h-5" />
                  {t.hero.startDate}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                />
              </div>

              {/* End Date */}
              <div>
                <label className={`flex items-center gap-2 text-primary text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-5 h-5" />
                  {t.hero.endDate}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Row 2: Location + Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Location */}
              <div>
                <label className={`flex items-center gap-2 text-primary text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-5 h-5" />
                  {t.hero.location}
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-background text-foreground">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label className={`flex items-center gap-2 text-primary text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Car className="w-5 h-5" />
                  {t.hero.vehicle}
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-lg px-4 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none"
                >
                  <option value="" className="bg-background text-foreground">
                    {t.hero.allVehicles}
                  </option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.name} className="bg-background text-foreground">
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button - Half width on desktop */}
            <div className="md:w-1/2">
              <button
                onClick={handleReserve}
                className={`w-full bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {t.hero.bookNow}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Features inside form */}
            <div className={`flex flex-wrap justify-center gap-8 mt-8 pt-8 border-t border-border/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 text-muted-foreground text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                {t.hero.instantConfirm}
              </div>
              <div className={`flex items-center gap-2 text-muted-foreground text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                {t.hero.freeCancellation}
              </div>
              <div className={`flex items-center gap-2 text-muted-foreground text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                {t.hero.unlimitedKm}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
          >
            {[
              { value: "50+", label: t.hero.vehicles },
              { value: "1000+", label: t.hero.satisfiedClients },
              { value: "24/7", label: t.hero.assistance },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-primary font-display text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.a
            href="#flotte"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex flex-col items-center gap-2 mt-16 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">{t.hero.discover}</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
