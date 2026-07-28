import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AppPreview from "./components/AppPreview";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import Pricing from "./components/Pricing";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";
import AdminDashboard from "./admin/AdminDashboard";

function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminDashboard />;
  }

  return (
    <main className="min-h-screen bg-[#FFF8F3] text-[#211A20]">
      <Navbar />
      <Hero />
      <AppPreview />
      <Problem />
      <Solution />
      <Pricing />
      <WaitlistForm />
      <Footer />
    </main>
  );
}

export default App;
