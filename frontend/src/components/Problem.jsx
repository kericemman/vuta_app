import {
  FaCalendarCheck,
  FaImages,
  FaSearchLocation,
} from "react-icons/fa";

const painPoints = [
  {
    Icon: FaSearchLocation,
    title: "Clients need clarity",
    copy: "Finding the right stylist, barber, nail tech, makeup artist, spa, or salon should feel simple, local, and trusted.",
  },
  {
    Icon: FaImages,
    title: "Professionals need proof",
    copy: "Great work deserves a clean profile where clients can see services, prices, portfolios, reviews, and availability.",
  },
  {
    Icon: FaCalendarCheck,
    title: "Businesses need structure",
    copy: "Salons, spas, and barbershops need one place to manage teams, services, bookings, updates, and client demand.",
  },
];

const Problem = () => {
  return (
    <section className="bg-[#FFF8F3] px-5 py-5">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
              What Vuta is
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-[#211A20] md:text-4xl">
              A simpler way for beauty clients and providers to meet.
            </h2>
          </div>

          <div className="max-w-2xl text-base leading-8 text-stone-700 md:text-lg">
            <p>
              Vuta brings trusted beauty closer by helping people discover
              nearby services, compare real work, message providers, and book
              with confidence.
            </p>
            <p className="mt-4">
              For providers, Vuta is a growth tool. It gives professionals and
              businesses a modern place to show their work, manage requests, and
              build repeat clients without depending only on screenshots,
              referrals, and social media inboxes.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {painPoints.map(({ Icon, copy, title }) => (
            <article
              className="border border-[#F2D3BD] bg-white p-6 shadow-sm"
              key={title}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#741B5D]/10 text-[#741B5D]">
                <Icon aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-black text-[#211A20]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
