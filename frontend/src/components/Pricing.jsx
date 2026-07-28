import { FaArrowRight, FaCheckCircle } from "react-icons/fa";

const plans = [
  {
    name: "Client",
    price: "$0",
    eyebrow: "For clients",
    description: "Browse, compare, save, message, and request beauty bookings.",
    popular: false,
    features: [
      "Free client account",
      "Search nearby beauty services",
      "View portfolios and prices",
      "Save favourite providers",
      "Request bookings",
      "In-app messages",
      "Reviews after completed bookings",
    ],
  },
  {
    name: "Professional",
    price: "$5 / month",
    eyebrow: "For solo providers",
    description: "For beauty professionals who want visibility and bookings.",
    popular: true,
    features: [
      "Professional profile",
      "Portfolio uploads",
      "Service listings",
      "Booking request management",
      "Client messaging",
      "Ratings and reviews",
      "Performance overview",
    ],
  },
  {
    name: "Business",
    price: "$8 / month",
    eyebrow: "For salons and teams",
    description: "For salons, barbershops, spas, and beauty businesses.",
    popular: false,
    features: [
      "Business profile",
      "Multiple services",
      "Multiple staff profiles",
      "Featured business listing",
      "Customer reviews",
      "Booking request management",
      "Business insights",
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="bg-[#FFF8F3] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
              Packages
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-[#211A20] md:text-5xl">
              Simple packages for clients, professionals, and beauty businesses.
            </h2>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-stone-700">
            Clients can use Vuta for free. Professionals and businesses get
            paid tools to manage visibility, services, bookings, teams, and
            growth as the marketplace expands.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#741B5D]">
            Clients are free
          </span>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#741B5D]">
            Professionals: $5/month
          </span>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#741B5D]">
            Businesses: $8/month
          </span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative border p-6 shadow-sm ${
                plan.popular
                  ? "border-[#F4B942] bg-white shadow-lg"
                  : "border-[#F2D3BD] bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute right-5 top-5 rounded-full bg-[#F4B942] px-3 py-1 text-xs font-black text-[#211A20]">
                  Popular
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F26B5E]">
                {plan.eyebrow}
              </p>
              <h3 className="mt-4 text-2xl font-black text-[#211A20]">
                {plan.name}
              </h3>

              <p className="mt-3 text-4xl font-black text-[#741B5D]">
                {plan.price}
              </p>

              <p className="mt-4 min-h-14 text-sm leading-7 text-stone-700">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <FaCheckCircle
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[#F26B5E]"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-sm font-bold transition ${
                  plan.popular
                    ? "bg-[#F26B5E] text-white hover:bg-[#741B5D]"
                    : "bg-[#741B5D] text-white hover:bg-[#F26B5E]"
                }`}
              >
                Join early
                <FaArrowRight aria-hidden="true" className="text-xs" />
              </a>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm leading-7 text-stone-500">
          Prices are shown in USD for early planning. Local currency billing may
          be introduced as each country launches.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
