const Footer = () => {
  return (
    <footer className="border-t border-orange-100 bg-white px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black text-[#7C2D12] transition hover:text-[#F97316] hover:scale-[1.02] inline-block">
              Vuta
            </h2>
            <p className="mt-2 text-sm text-stone-600 transition hover:text-stone-900">
              Beauty professionals across Africa.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex gap-6">
              <a href="#how" className="text-sm text-stone-500 transition hover:text-[#F97316]">
                How it Works
              </a>
              <a href="#pricing" className="text-sm text-stone-500 transition hover:text-[#F97316]">
                Pricing
              </a>
              <a href="#waitlist" className="text-sm text-stone-500 transition hover:text-[#F97316]">
                Waitlist
              </a>
            </div>
            <p className="text-sm text-stone-400 transition hover:text-stone-600">
              © {new Date().getFullYear()} Vuta. All rights reserved.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-orange-100 text-center">
          <p className="text-xs text-stone-400">
            Building Africa's beauty economy, one city at a time. 🌍
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;