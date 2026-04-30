import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import Pricing from "./components/Pricing";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";

function App() {
  return (
    <main className="min-h-screen bg-cream text-dark">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Pricing />
      <WaitlistForm />
      <Footer />
    </main>
  );
}

export default App;