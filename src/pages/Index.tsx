import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import AboutSection from "@/components/AboutSection";
import CompaniesSection from "@/components/CompaniesSection";
import MaterialsSection from "@/components/MaterialsSection";
import ContentSection from "@/components/ContentSection";
import MentorshipSection from "@/components/MentorshipSection";
import SocialProofSection from "@/components/SocialProofSection";
import SocialHubSection from "@/components/SocialHubSection";
import LeadMagnetSection from "@/components/LeadMagnetSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Guilherme Correia",
          "jobTitle": "Profissional de Growth Marketing",
          "url": "https://guilhermecorreia.com.br",
          "description": "Profissional de Growth Marketing e Estrategista de IA. Ajudo empresas a escala através de frameworks de crescimento previsível.",
          "sameAs": [
            "https://www.linkedin.com/in/guilhermecorreia/"
          ],
          "knowsAbout": ["Growth Marketing", "Inteligência Artificial", "Go-To-Market", "Vendas"]
        }}
      />
      <Header />
      <HeroSection />
      <AboutSection />
      <CompaniesSection />
      <MaterialsSection />
      <ContentSection />
      <MentorshipSection />
      <SocialHubSection />
      <LeadMagnetSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
