const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-[#FFF7ED]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="text-2xl font-black tracking-tight text-[#7C2D12] transition hover:text-[#F97316]">
          Vuta
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#how" className="transition hover:text-[#F97316]">
            How it Works
          </a>
          <a href="#pricing" className="transition hover:text-[#F97316]">
            Pricing
          </a>
          <a href="#waitlist" className="transition hover:text-[#F97316]">
            Waitlist
          </a>
        </nav>

        <a
          href="#waitlist"
          className="rounded-full bg-[#7C2D12] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#F97316] hover:scale-[1.02]"
        >
          Join Waitlist
        </a>
      </div>
    </header>
  );
};

export default Navbar;