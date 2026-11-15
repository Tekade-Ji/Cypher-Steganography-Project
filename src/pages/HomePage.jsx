
import Navbar from "../components/navigation/Navbar";

import HeroSection from "../sections/hero/HeroSection";
import FeaturesSection from "../sections/features/FeaturesSection";
import HowItWorksSection from "../sections/how-it-works/HowItWorksSection";
import AboutSection from "../sections/about/AboutSection";
import FAQSection from "../sections/faq/FAQSection";
import Footer from "../sections/footer/Footer";

import Marquee from "../components/effects/Marquee";

function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />

        <Marquee />

        <FeaturesSection />

        <HowItWorksSection />

        <AboutSection />

        <FAQSection />
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
