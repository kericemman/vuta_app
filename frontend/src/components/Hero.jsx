import { FaApple, FaArrowRight, FaGooglePlay } from "react-icons/fa";
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
            Built for iOS and Android
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] text-white md:text-7xl">
            Vuta brings trusted beauty closer.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-[#FFF8F3] md:text-lg">
            Discover salons, barbers, makeup artists, nail techs, spa
            specialists, and beauty professionals around you. View their work,
            save your favourites, chat, and book when you are ready.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F26B5E] px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-[#F4B942] hover:text-[#211A20]"
              href="/download"
            >
              Download Vuta
              <FaArrowRight aria-hidden="true" className="text-xs" />
            </a>

            <a
              href="#preview"
              className="rounded-full border border-white/55 px-8 py-4 text-center text-sm font-semibold text-white transition hover:border-[#F4B942] hover:bg-white/10"
            >
              Preview the App
            </a>
          </div>

          <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
            <a
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-white transition hover:border-[#F4B942] hover:bg-white/15"
              href="/download/ios"
            >
              <FaApple aria-hidden="true" className="text-2xl" />
              <span>
                <span className="block text-xs text-[#FFF8F3]/75">
                  Download for
                </span>
                <span className="block text-sm font-black">iOS</span>
              </span>
            </a>

            <a
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-white transition hover:border-[#F4B942] hover:bg-white/15"
              href="/download/android"
            >
              <FaGooglePlay aria-hidden="true" className="text-xl" />
              <span>
                <span className="block text-xs text-[#FFF8F3]/75">
                  Download for
                </span>
                <span className="block text-sm font-black">Android</span>
              </span>
            </a>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/20 pt-6 text-white">
            <div>
              <dt className="text-lg font-black md:text-2xl">Find</dt>
              <dd className="mt-1 text-xs leading-5 text-[#FFF8F3]/80">
                Services near you
              </dd>
            </div>
            <div>
              <dt className="text-lg font-black md:text-2xl">Trust</dt>
              <dd className="mt-1 text-xs leading-5 text-[#FFF8F3]/80">
                Profiles and work
              </dd>
            </div>
            <div>
              <dt className="text-lg font-black md:text-2xl">Book</dt>
              <dd className="mt-1 text-xs leading-5 text-[#FFF8F3]/80">
                When ready
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
