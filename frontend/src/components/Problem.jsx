import {
  FaCalendarCheck,
  FaImages,
  FaSearchLocation,
} from "react-icons/fa";

const painPoints = [
  {
    Icon: FaSearchLocation,
    title: "Discovery is scattered",
    copy: "Clients still rely on referrals, group chats, and screenshots when they need someone nearby and available.",
  },
  {
    Icon: FaImages,
    title: "Proof of work is hard to compare",
    copy: "Portfolios, prices, reviews, locations, and service styles often live in different places.",
  },
  {
    Icon: FaCalendarCheck,
    title: "Booking is not structured",
    copy: "Professionals lose time confirming services, dates, addresses, staff, and follow-ups manually.",
  },
];

const Problem = () => {
  return (
    <section className="bg-[#FFF8F3] px-5 py-5">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
              The gap
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-[#211A20] md:text-5xl">
              Africa has beauty talent everywhere. Visibility is the bottleneck.
            </h2>
          </div>

          <div className="max-w-2xl text-base leading-8 text-stone-700 md:text-lg">
            <p>
              Across African cities, skilled stylists, barbers, nail techs,
              makeup artists, spas, and salons already serve real demand. The
              challenge is making that talent easy to find, trust, compare, and
              book.
            </p>
            <p className="mt-4">
              Vuta brings discovery, portfolios, location, service details, and
              booking flow into one place so clients move with confidence and
              providers grow with structure.
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
