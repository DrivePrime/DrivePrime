import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo } from "@/hooks/use-seo";

const NotFound = () => {
  const { t } = useLanguage();
  useSeo({ title: "404 | Drive Prime", description: t.meta.homeDescription, path: "/404", noindex: true });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container flex min-h-[70vh] flex-col items-start justify-center pt-24">
        <p className="tabular text-[15px] font-semibold text-primary">404</p>
        <h1 className="type-display mt-3 text-4xl sm:text-5xl font-semibold text-foreground">
          {t.vehicleDetail.pageNotFound}
        </h1>
        <Link to="/" className="btn-primary mt-8">
          {t.vehicleDetail.home}
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
