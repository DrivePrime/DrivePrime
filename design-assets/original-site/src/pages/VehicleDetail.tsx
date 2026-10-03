import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Cog, Fuel, Tag, Phone, Check, MessageCircle } from 'lucide-react';
import { vehicles } from '@/data/vehicles';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCurrency } from '@/i18n/CurrencyContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  
  const handleBackToFleet = () => {
    navigate('/');
    setTimeout(() => {
      const fleetSection = document.getElementById('flotte');
      if (fleetSection) {
        fleetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);
  
  const vehicle = vehicles.find((v) => v.id === id);
  const similarVehicles = vehicles
    .filter((v) => v.category === vehicle?.category && v.id !== vehicle?.id)
    .slice(0, 3);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-4">Véhicule non trouvé</h1>
          <button onClick={handleBackToFleet} className="text-primary hover:underline">
            {t.vehicleDetail.back}
          </button>
        </div>
      </div>
    );
  }

  const handleReserve = () => {
    const message = `Bonjour, je souhaite réserver le ${vehicle.name}. Pouvez-vous me donner plus d'informations ?`;
    window.location.href = `https://wa.me/212612132748?text=${encodeURIComponent(message)}`;
  };

  const features = [
    t.vehicleDetail.airConditioning,
    t.vehicleDetail.gps,
    t.vehicleDetail.bluetooth,
    t.vehicleDetail.usb,
    t.vehicleDetail.leatherSeats,
    t.vehicleDetail.parkingSensors,
    t.vehicleDetail.cruiseControl,
    t.vehicleDetail.reverseCamera,
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <button
              onClick={handleBackToFleet}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.vehicleDetail.back}
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Single Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    {vehicle.category}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Vehicle Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {vehicle.name}
              </h1>
              
              {/* Price */}
              <div className="mb-8">
                <span className="text-muted-foreground text-sm">{t.vehicleDetail.from}</span>
                <div className="text-gradient-gold font-display text-4xl font-bold">
                  {formatPrice(vehicle.pricePerDay)}
                  <span className="text-lg font-normal text-muted-foreground">{t.vehicleDetail.perDay}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="glass-card p-6 mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  {t.vehicleDetail.specs}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm block">{t.vehicleDetail.seats}</span>
                      <span className="text-foreground font-medium">{vehicle.seats}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Cog className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm block">{t.vehicleDetail.transmission}</span>
                      <span className="text-foreground font-medium">{vehicle.transmission}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm block">{t.vehicleDetail.fuel}</span>
                      <span className="text-foreground font-medium">{vehicle.fuel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm block">{t.vehicleDetail.category}</span>
                      <span className="text-foreground font-medium">{vehicle.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="glass-card p-6 mb-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                  {t.vehicleDetail.features}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleReserve}
                  className="flex-1 bg-primary text-primary-foreground font-medium px-6 py-4 rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.vehicleDetail.bookNow}
                </button>
                <a
                  href="tel:+212612132748"
                  className="flex-1 border border-primary text-primary font-medium px-6 py-4 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {t.vehicleDetail.callUs}
                </a>
              </div>
            </motion.div>
          </div>

          {/* Similar Vehicles */}
          {similarVehicles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                {t.vehicleDetail.similarVehicles}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarVehicles.map((v) => (
                  <Link
                    key={v.id}
                    to={`/vehicule/${v.id}`}
                    className="glass-card overflow-hidden group card-hover"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={v.image}
                        alt={v.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        {v.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-muted-foreground text-sm">
                          <span>{v.seats} {t.fleet.seats}</span>
                          <span>•</span>
                          <span>{v.transmission}</span>
                        </div>
                        <div className="text-primary font-display font-bold">
                          {formatPrice(v.pricePerDay)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
