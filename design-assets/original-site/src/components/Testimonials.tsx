import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Pierre Dubois",
    location: "Paris, France",
    text: "Service exceptionnel ! Le Range Rover était impeccable et la livraison à l'aéroport parfaitement à l'heure. Je recommande vivement Drive Prime.",
    initial: "P"
  },
  {
    name: "Sarah Martin",
    location: "Lyon, France",
    text: "Équipe très professionnelle et réactive sur WhatsApp. Le véhicule était en parfait état. Nous avons passé un séjour inoubliable à Marrakech.",
    initial: "S"
  },
  {
    name: "Ahmed Benali",
    location: "Casablanca, Maroc",
    text: "Les meilleurs prix de Marrakech avec un service premium. Le chauffeur était ponctuel et très courtois. Une expérience 5 étoiles !",
    initial: "A"
  },
  {
    name: "Emma Thompson",
    location: "Londres, UK",
    text: "Fantastic service! The car was immaculate and the team was incredibly helpful. Will definitely use Drive Prime again on my next visit.",
    initial: "E"
  },
  {
    name: "Mohammed Alami",
    location: "Rabat, Maroc",
    text: "J'ai loué une Mercedes Classe C pour mon mariage. Tout était parfait, du début à la fin. Merci à toute l'équipe de Drive Prime !",
    initial: "M"
  },
  {
    name: "Julie Fontaine",
    location: "Bruxelles, Belgique",
    text: "Réservation simple via WhatsApp, livraison au riad, véhicule impeccable. Que demander de plus ? Je reviendrai certainement !",
    initial: "J"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentTestimonials = testimonials.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <section id="temoignages" className="py-24 section-gold-accent section-divider">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
            Témoignages
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ce Que Disent Nos <span className="text-primary">Clients</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez les avis de nos clients satisfaits et leur expérience avec Drive Prime.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTestimonials.map((testimonial) => (
              <div
                key={`${currentIndex}-${testimonial.name}`}
                className="glass-card p-8 relative"
              >
                  <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-display text-lg font-bold">
                        {testimonial.initial}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <span className="text-muted-foreground text-sm">
                        {testimonial.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Navigation */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "bg-primary w-8" : "bg-secondary hover:bg-muted"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
