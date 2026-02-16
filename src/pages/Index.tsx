import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import AboutSection from "@/components/AboutSection";
import MaterialsSection from "@/components/MaterialsSection";
import ContentSection from "@/components/ContentSection";
import MentorshipSection from "@/components/MentorshipSection";
import SocialProofSection from "@/components/SocialProofSection";
import SocialHubSection from "@/components/SocialHubSection";
import LeadMagnetSection from "@/components/LeadMagnetSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ProblemSection />
      <AboutSection />
      <MaterialsSection />
      <ContentSection />
      <MentorshipSection />
      <SocialProofSection />
      <SocialHubSection />
      <LeadMagnetSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
