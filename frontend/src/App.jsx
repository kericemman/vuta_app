import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AppPreview from "./components/AppPreview";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import Pricing from "./components/Pricing";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";
import AdminDashboard from "./admin/AdminDashboard";
import DownloadPage from "./components/DownloadPage";
import SEOHead from "./components/SEOHead";
import { PartnershipForm } from "./components/PartnershipModal";
import LegalPage from "./components/LegalPage";
import {
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./components/PasswordRecoveryPage";

const seo = {
  home: {
    canonical: "https://vuta.app/",
    description:
      "Vuta brings trusted beauty closer. Discover salons, barbers, makeup artists, nail techs, spa specialists, and beauty professionals around you.",
    title: "Trusted Beauty Closer",
  },
  pricing: {
    canonical: "https://vuta.app/pricing",
    description:
      "See Vuta access plans for clients, beauty professionals, and beauty businesses. Clients join free, professionals start at $5/month, and businesses start at $8/month.",
    title: "Pricing",
  },
  waitlist: {
    canonical: "https://vuta.app/waitlist",
    description:
      "Join the Vuta early access list for clients, professionals, salons, spas, barbershops, and beauty businesses across African cities.",
    title: "Early Access",
  },
  download: {
    canonical: "https://vuta.app/download",
    description:
      "Download Vuta for iOS or Android. Discover trusted beauty services, manage professional bookings, or run a beauty business from the Vuta mobile app.",
    title: "Download",
  },
  forgotPassword: {
    canonical: "https://vuta.app/forgot-password",
    description:
      "Request a secure Vuta password reset code for your client, professional, or business account.",
    title: "Forgot Password",
  },
  resetPassword: {
    canonical: "https://vuta.app/reset-password",
    description:
      "Create a new Vuta password using your secure 6-digit reset code.",
    robots: "noindex, nofollow",
    title: "Reset Password",
  },
  partners: {
    canonical: "https://vuta.app/become-a-partner",
    description:
      "Become a Vuta partner. Submit partnership requests for beauty brands, academies, suppliers, creators, media, corporate partners, and investors.",
    title: "Become a Partner",
  },
  privacy: {
    canonical: "https://vuta.app/privacy-policy",
    description:
      "Read the Vuta Privacy Policy to understand how Vuta collects, uses, protects, and shares information for clients, professionals, and businesses.",
    title: "Privacy Policy",
  },
  terms: {
    canonical: "https://vuta.app/terms-and-conditions",
    description:
      "Read the Vuta Terms and Conditions for using Vuta websites, mobile apps, profiles, messaging, bookings, updates, and related services.",
    title: "Terms and Conditions",
  },
  agreement: {
    canonical: "https://vuta.app/user-agreement",
    description:
      "Read the Vuta User Agreement for clients, professionals, and businesses using Vuta to discover, promote, manage, message, or request beauty services.",
    title: "User Agreement",
  },
};

function PublicShell({ children, page }) {
  return (
    <main className="min-h-screen bg-[#FFF8F3] text-[#211A20]">
      <SEOHead {...page} />
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}

function PageIntro({ eyebrow, title, children }) {
  return (
    <section className="bg-[#FFF8F3] px-5 pb-4 pt-14">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#211A20] md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">
          {children}
        </p>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <PublicShell page={seo.home}>
      <Hero />
      <AppPreview />
      <Problem />
      <Solution />
      <Pricing />
      <WaitlistForm />
    </PublicShell>
  );
}

function PricingPage() {
  return (
    <PublicShell page={seo.pricing}>
      {/* <PageIntro eyebrow="Vuta pricing" title="Simple access for every beauty journey.">
        Clients join free. Professionals and businesses choose plans built for
        profiles, services, bookings, messaging, team tools, and growth insights
        as Vuta opens city by city.
      </PageIntro> */}
      <Pricing />
      <WaitlistForm />
    </PublicShell>
  );
}

function WaitlistPage() {
  return (
    <PublicShell page={seo.waitlist}>
      {/* <PageIntro eyebrow="Early access" title="Get notified when Vuta opens in your city.">
        Join as a client, beauty professional, or business owner. Your response
        helps Vuta prioritize launch cities, categories, and early provider
        onboarding.
      </PageIntro> */}
      <WaitlistForm />
      <Pricing />
    </PublicShell>
  );
}

function DownloadRoutePage({ platform }) {
  return (
    <PublicShell page={seo.download}>
      <DownloadPage platform={platform} />
    </PublicShell>
  );
}

function PartnerPage() {
  return (
    <PublicShell page={seo.partners}>
      <PageIntro eyebrow="Partnerships" title="Become a Vuta partner.">
        Vuta works with beauty brands, training academies, suppliers,
        communities, creators, media teams, corporate partners, and investors
        supporting Africa's beauty economy.
      </PageIntro>
      <section className="bg-white px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="border border-[#F2D3BD] bg-[#FFF8F3] p-6">
            <h2 className="text-2xl font-black text-[#211A20]">
              Partnership opportunities
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-700">
              <li>Beauty brands and suppliers reaching verified providers.</li>
              <li>Training academies onboarding new professionals.</li>
              <li>Creators and media partners growing beauty communities.</li>
              <li>Corporate and investor partners supporting market expansion.</li>
            </ul>
          </div>
          <PartnershipForm className="border border-[#F2D3BD] bg-[#FFF8F3] p-5 shadow-xl md:p-8" />
        </div>
      </section>
    </PublicShell>
  );
}

function LegalRoutePage({ documentKey, page }) {
  return (
    <PublicShell page={page}>
      <LegalPage documentKey={documentKey} />
    </PublicShell>
  );
}

function App() {
  const pathname =
    window.location.pathname.length > 1
      ? window.location.pathname.replace(/\/$/, "")
      : window.location.pathname;

  if (pathname.startsWith("/admin")) {
    return <AdminDashboard />;
  }

  if (pathname === "/pricing") {
    return <PricingPage />;
  }

  if (pathname === "/waitlist") {
    return <WaitlistPage />;
  }

  if (pathname === "/download") {
    return <DownloadRoutePage />;
  }

  if (pathname === "/download/ios") {
    return <DownloadRoutePage platform="ios" />;
  }

  if (pathname === "/download/android") {
    return <DownloadRoutePage platform="android" />;
  }

  if (pathname === "/forgot-password") {
    return (
      <PublicShell page={seo.forgotPassword}>
        <ForgotPasswordPage />
      </PublicShell>
    );
  }

  if (pathname === "/reset-password") {
    return (
      <PublicShell page={seo.resetPassword}>
        <ResetPasswordPage />
      </PublicShell>
    );
  }

  if (pathname === "/become-a-partner") {
    return <PartnerPage />;
  }

  if (pathname === "/terms-and-conditions") {
    return <LegalRoutePage documentKey="terms" page={seo.terms} />;
  }

  if (pathname === "/privacy-policy") {
    return <LegalRoutePage documentKey="privacy" page={seo.privacy} />;
  }

  if (pathname === "/user-agreement") {
    return <LegalRoutePage documentKey="agreement" page={seo.agreement} />;
  }

  return <HomePage />;
}

export default App;
