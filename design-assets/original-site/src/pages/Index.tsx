import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Fleet />
      <Services />
      <WhyUs />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
