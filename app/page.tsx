import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Promo from "@/components/sections/Promo";
import Partners from "@/components/sections/Partners";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import AreasWeServe from "@/components/sections/AreasWeServe";
import Contact from "@/components/sections/Contact";
import Stats from "@/components/sections/Stats";

export default function Home() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#143640] text-white overflow-x-hidden">
        {/* Hero */}
        <Hero />

        {/* Promotional CTA */}
        <Promo />

        {/* Services */}
        <Services />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Service Areas */}
        <AreasWeServe />

        {/* Company Stats */}
        <Stats />

        {/* Contracted Service Provider */}
        <Partners />

        {/* Contact */}
        <Contact />
      </main>

      <Footer />
    </>
  );
}