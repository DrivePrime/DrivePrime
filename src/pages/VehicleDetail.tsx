import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Phone } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { business, whatsappUrl, SITE_URL } from "@/config/business";
import { useSeo } from "@/hooks/use-seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import VehicleCard from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/icons";
import { vehicleLabel } from "@/i18n/vehicle-label";

const ease = [0.16, 1, 0.3, 1] as const;

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const reduce = useReducedMotion();
  const d = t.vehicleDetail;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  const vehicle = vehicles.find((v) => v.id === id);
  const label = vehicle ? vehicleLabel(vehicle, t) : "";

  useSeo(
    vehicle
      ? {
          title: t.meta.vehicleTitle(label),
          description: t.meta.vehicleDescription(label, `${vehicle.pricePerDay} €`),
          path: `/vehicule/${vehicle.id}`,
          image: vehicle.image,
          imageWidth: 1536,
          imageHeight: 1024,
          // Mirrors the visible breadcrumb only: no price or offer claims.
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: d.home, item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: d.back, item: `${SITE_URL}/#flotte` },
              { "@type": "ListItem", position: 3, name: label, item: `${SITE_URL}/vehicule/${vehicle.id}` },
            ],
          },
        }
      : { title: `${d.notFound} | Drive Prime`, description: d.notFoundDescription, path: `/vehicule/${id}`, noindex: true },
  );

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container flex min-h-[70vh] flex-col items-start justify-center pt-24">
          <h1 className="type-display text-4xl sm:text-5xl font-semibold text-foreground">{d.notFound}</h1>
          <p className="mt-4 max-w-md text-muted-foreground">{d.notFoundDescription}</p>
          <Link to="/#flotte" className="btn-primary mt-8">
            {t.hero.ctaFleet}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const transmission = t.fleet.transmission[vehicle.transmission];
  const fullName = `${vehicle.name} (${transmission})`;
  const waHref = whatsappUrl(t.whatsapp.vehicle(fullName));

  const sameCategory = vehicles.filter((v) => v.category === vehicle.category && v.id !== vehicle.id);
  const similar = (sameCategory.length ? sameCategory : vehicles.filter((v) => v.id !== vehicle.id))
    .sort((a, b) => Math.abs(a.pricePerDay - vehicle.pricePerDay) - Math.abs(b.pricePerDay - vehicle.pricePerDay))
    .slice(0, 3);

  const specs = [
    { label: d.category, value: t.fleet.categories[vehicle.category] },
    { label: d.transmission, value: transmission },
    { label: d.fuel, value: t.fleet.fuel[vehicle.fuel] },
    { label: d.seats, value: vehicle.seats },
  ];

  return (
    <div className="min-h-screen bg-background pb-[calc(73px+env(safe-area-inset-bottom))] lg:pb-0">
      <Header mobileCta={false} />

      <main className="pt-16 lg:pt-[72px]">
        <div className="container">
          <nav aria-label={t.nav.breadcrumb} className="py-5 lg:py-7">
            <ol className="flex flex-wrap items-center gap-2 text-[14px] text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  {d.home}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/#flotte" className="hover:text-foreground transition-colors">
                  {d.back}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-foreground">
                {label}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <motion.div
              key={vehicle.id}
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease }}
              className="lg:col-span-7 xl:col-span-8"
            >
              <div className="aspect-[3/2] overflow-hidden rounded-md bg-card">
                <img
                  src={vehicle.image}
                  srcSet={`${vehicle.thumb} 768w, ${vehicle.image} 1536w`}
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  alt={`${label} – Drive Prime Marrakech`}
                  width={1536}
                  height={1024}
                  {...{ fetchpriority: "high" }}
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>

            <div className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-28">
                <h1 className="type-display text-4xl sm:text-5xl font-semibold text-foreground">
                  {label}
                </h1>

                <p className="mt-5 flex items-baseline gap-2">
                  <span className="text-[14px] text-muted-foreground">{d.from}</span>
                  <span className="tabular type-wide text-3xl font-semibold text-foreground">
                    {formatPrice(vehicle.pricePerDay)}
                  </span>
                  <span className="text-[15px] text-muted-foreground">{d.perDay}</span>
                </p>

                <h2 className="sr-only">{d.specs}</h2>
                <dl className="mt-8 grid grid-cols-2 border-t border-border">
                  {specs.map((s, i) => (
                    <div
                      key={s.label}
                      className={`border-b border-border py-4 ${i % 2 === 0 ? "pe-4" : "ps-4 border-s"}`}
                    >
                      <dt className="text-[13px] text-muted-foreground">{s.label}</dt>
                      <dd className="mt-1 text-[16px] font-medium text-foreground">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 rounded-md border border-border bg-card p-5 sm:p-6">
                  <h2 className="type-wide text-lg font-semibold text-foreground">{d.bookTitle}</h2>
                  <BookingForm layout="stack" vehicleName={fullName} className="mt-5" />
                  <a
                    href={business.phoneHref}
                    className="mt-4 flex items-center justify-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {d.callUs} <span dir="ltr">{business.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {similar.length > 0 && (
            <section aria-labelledby="similar-title" className="mt-24 border-t border-border pt-14 pb-24 lg:mt-32">
              <h2 id="similar-title" className="type-display text-3xl sm:text-4xl font-semibold text-foreground">
                {d.similar}
              </h2>
              <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                {similar.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Mobile: price and booking always within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <p className="leading-tight">
            <span className="block text-[12px] text-muted-foreground">{d.from}</span>
            <span className="tabular text-lg font-semibold text-foreground">{formatPrice(vehicle.pricePerDay)}</span>
            <span className="text-[13px] text-muted-foreground"> {d.perDay}</span>
          </p>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <WhatsAppIcon className="h-4 w-4" />
            {t.fleet.book}
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
