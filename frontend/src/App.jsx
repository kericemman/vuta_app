import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AppPreview from "./components/AppPreview";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import Pricing from "./components/Pricing";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";
import AdminDashboard from "./admin/AdminDashboard";
import SEOHead from "./components/SEOHead";
import { PartnershipForm } from "./components/PartnershipModal";

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
  partners: {
    canonical: "https://vuta.app/become-a-partner",
    description:
      "Become a Vuta partner. Submit partnership requests for beauty brands, academies, suppliers, creators, media, corporate partners, and investors.",
    title: "Become a Partner",
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

  if (pathname === "/become-a-partner") {
    return <PartnerPage />;
  }

  return <HomePage />;
}

export default App;
