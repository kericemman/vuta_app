import logoNavbar from "../assets/logo-navbar.png";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F2D3BD] bg-[#FFF8F3]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a
          aria-label="Vuta home"
          className="flex items-center transition hover:opacity-85"
          href="/"
        >
          <img
            alt=""
            className="h-11 w-11 object-contain"
            src={logoNavbar}
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="/#how" className="transition hover:text-[#F26B5E]">
            How it works
          </a>
          <a href="/#preview" className="transition hover:text-[#F26B5E]">
            Preview
          </a>
          <a href="/become-a-partner" className="transition hover:text-[#F26B5E]">
            Become a Partner
          </a>
          <a href="/pricing" className="transition hover:text-[#F26B5E]">
            Pricing
          </a>
          <a href="/waitlist" className="transition hover:text-[#F26B5E]">
            Early Access
          </a>
        </nav>

        <a
          href="/waitlist"
          className="rounded-full bg-[#741B5D] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#F26B5E] hover:scale-[1.02]"
        >
          Get Early Access
        </a>
      </div>
    </header>
  );
};

export default Navbar;
