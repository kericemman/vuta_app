import heroAfricanBeauty from "../assets/hero-african-beauty.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[78svh] overflow-hidden bg-[#211A20] md:min-h-[82svh]">
      <img
        src={heroAfricanBeauty}
        alt="African hairstylists, makeup artists, nail technicians, and barbers serving clients in a modern beauty studio"
        className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(33,26,32,0.92)_0%,rgba(116,27,93,0.72)_38%,rgba(33,26,32,0.16)_74%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,#FFF8F3_0%,rgba(255,248,243,0)_100%)]" />

      <div className="relative mx-auto flex min-h-[78svh] max-w-7xl items-center px-5 py-16 md:min-h-[82svh] md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#F4B942]">
            Built for Africa's beauty economy
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] text-white md:text-7xl">
            Vuta helps clients find beauty talent nearby.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#FFF8F3] md:text-lg">
            Discover trusted hairstylists, barbers, makeup artists, nail techs,
            spas, and beauty businesses by city, service, portfolio, price, and
            availability.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#waitlist"
              className="rounded-full bg-[#F26B5E] px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-[#F4B942] hover:text-[#211A20]"
            >
              Join the Waitlist
            </a>

            <a
              href="#preview"
              className="rounded-full border border-white/55 px-8 py-4 text-center text-sm font-semibold text-white transition hover:border-[#F4B942] hover:bg-white/10"
            >
              Preview the App
            </a>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/20 pt-6 text-white">
            <div>
              <dt className="text-2xl font-black">6+</dt>
              <dd className="mt-1 text-xs leading-5 text-[#FFF8F3]/80">
                Beauty categories
              </dd>
            </div>
            <div>
              <dt className="text-2xl font-black">3</dt>
              <dd className="mt-1 text-xs leading-5 text-[#FFF8F3]/80">
                Account types
              </dd>
            </div>
            <div>
              <dt className="text-2xl font-black">24/7</dt>
              <dd className="mt-1 text-xs leading-5 text-[#FFF8F3]/80">
                Service discovery
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
