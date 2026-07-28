import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";

const footerLinks = [
  { href: "/#how", label: "How it Works" },
  { href: "/#preview", label: "App Preview" },
  { href: "/pricing", label: "Pricing" },
  { href: "/waitlist", label: "Early Access" },
  { href: "/become-a-partner", label: "Become a Partner" },
];

const legalLinks = [
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/user-agreement", label: "User Agreement" },
];

const socialLinks = [
  {
    Icon: FaInstagram,
    href: "https://www.instagram.com/vuta.app?igsh=MTJ1NzVlbGdwa21jbg%3D%3D&utm_source=qr",
    label: "Instagram",
  },
  {
    Icon: FaTiktok,
    href: "https://www.tiktok.com/@vuta.app?_r=1&_t=ZS-988HA9jUfmG",
    label: "TikTok",
  },
  {
    Icon: FaFacebookF,
    href: "https://www.facebook.com/share/1D99iUbTHq/?mibextid=wwXIfr",
    label: "Facebook",
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-[#F2D3BD] bg-[#211A20] px-5 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.75fr_0.75fr_0.8fr]">
          <div className="max-w-md">
            <h2 className="inline-block text-3xl font-black text-white">
              Vuta
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#FFF8F3]/75">
              Vuta brings trusted beauty closer for clients, professionals,
              salons, spas, barbershops, and growing beauty teams across
              African cities.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B942]">
              Explore
            </p>
            <div className="mt-4 grid gap-3">
              {footerLinks.map((link) => (
                <a
                  className="text-sm text-[#FFF8F3]/75 transition hover:text-[#F26B5E]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <nav aria-label="Legal navigation">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B942]">
              Legal
            </p>
            <div className="mt-4 grid gap-3">
              {legalLinks.map((link) => (
                <a
                  className="text-sm text-[#FFF8F3]/75 transition hover:text-[#F26B5E]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B942]">
              Social
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-[#FFF8F3] transition hover:border-[#F26B5E] hover:bg-[#F26B5E] hover:text-white"
                  href={href}
                  key={label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-[#FFF8F3]/65 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Vuta. All rights reserved.</p>
          <p>
            This app was built & maintained by{" "}
            <a
              className="font-semibold text-[#F4B942] transition hover:text-[#F26B5E]"
              href="https://www.thedigitalagame.com"
              rel="noreferrer"
              target="_blank"
            >
              TDAG
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
