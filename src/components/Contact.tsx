import { useState, FormEvent } from "react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { business, openWhatsApp, whatsappUrl } from "@/config/business";
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from "./icons";
import DateField from "./DateField";
import { dateToIso } from "@/lib/dates";

const formatDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

export default function Contact() {
  const { t } = useLanguage();
  const c = t.contact;
  const [form, setForm] = useState({ name: "", start: "", end: "", vehicle: "", message: "" });

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const w = t.whatsapp;
    const lines = [
      w.request,
      `${w.name}: ${form.name}`,
      `${w.vehicle_}: ${form.vehicle || w.any}`,
      `${w.start}: ${formatDate(form.start) || w.any}`,
      `${w.end}: ${formatDate(form.end) || w.any}`,
    ];
    if (form.message.trim()) lines.push(`${w.message}: ${form.message.trim()}`);
    openWhatsApp(lines.join("\n"));
  };

  const channels = [
    { label: c.whatsapp, value: business.phoneDisplay, href: whatsappUrl(t.whatsapp.general), external: true },
    { label: c.phone, value: business.phoneDisplay, href: business.phoneHref },
    { label: c.email, value: business.email, href: `mailto:${business.email}` },
    { label: c.address, value: c.addressValue },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-24 lg:py-32">
      <div className="container grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 id="contact-title" className="type-display text-4xl sm:text-5xl font-semibold text-foreground">
            {c.title}
          </h2>
          <p className="mt-5 max-w-[46ch] text-base sm:text-lg leading-relaxed text-muted-foreground">
            {c.description}
          </p>

          <a
            href={whatsappUrl(t.whatsapp.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-8"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t.hero.ctaWhatsapp}
          </a>

          <dl className="mt-12 divide-y divide-border border-y border-border">
            {channels.map((ch) => (
              <div key={ch.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                <dt className="text-[14px] text-muted-foreground">{ch.label}</dt>
                <dd className="min-w-0 break-words text-[15px] font-medium text-foreground">
                  {ch.href ? (
                    <a
                      href={ch.href}
                      {...(ch.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="link-underline"
                      dir="ltr"
                    >
                      {ch.value}
                    </a>
                  ) : (
                    ch.value
                  )}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-6 py-4">
              <dt className="text-[14px] text-muted-foreground">{c.social}</dt>
              <dd className="flex items-center gap-1">
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href={business.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="grid h-10 w-10 place-items-center rounded-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-md border border-border bg-card p-6 sm:p-8 lg:p-10 grid gap-5 sm:grid-cols-2 self-start"
        >
          <div className="sm:col-span-2">
            <label htmlFor="contact-name" className="field-label">
              {c.name}
            </label>
            <input
              id="contact-name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={update("name")}
              placeholder={c.namePlaceholder}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="contact-start" className="field-label">
              {c.startDate}
            </label>
            <DateField
              id="contact-start"
              min={dateToIso(new Date())}
              value={form.start}
              onChange={(iso) => setForm((f) => ({ ...f, start: iso, end: f.end && f.end < iso ? "" : f.end }))}
            />
          </div>
          <div>
            <label htmlFor="contact-end" className="field-label">
              {c.endDate}
            </label>
            <DateField
              id="contact-end"
              min={form.start || dateToIso(new Date())}
              value={form.end}
              onChange={(iso) => setForm((f) => ({ ...f, end: iso }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="contact-vehicle" className="field-label">
              {c.vehicle}
            </label>
            <select id="contact-vehicle" value={form.vehicle} onChange={update("vehicle")} className="field">
              <option value="">{c.selectVehicle}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={`${v.name} (${t.fleet.transmission[v.transmission]})`}>
                  {v.name} · {t.fleet.transmission[v.transmission]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="contact-message" className="field-label">
              {c.message} <span className="font-normal text-muted-foreground/70">({c.optional})</span>
            </label>
            <textarea
              id="contact-message"
              rows={4}
              value={form.message}
              onChange={update("message")}
              placeholder={c.messagePlaceholder}
              className="field resize-y"
            />
          </div>
          <div className="sm:col-span-2 pt-1">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <WhatsAppIcon className="h-4 w-4" />
              {c.send}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
