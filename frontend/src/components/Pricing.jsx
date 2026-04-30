const plans = [
  {
    name: "Free Starter",
    price: "$0",
    description: "Perfect for early beauty professionals joining before launch.",
    popular: false,
    features: [
      "Provider profile",
      "Portfolio uploads",
      "Service listing",
      "Country and city visibility",
      "Direct booking requests",
      "WhatsApp/contact button",
      "Basic reviews",
    ],
  },
  {
    name: "Early Pro",
    price: "$3 / month",
    description: "For providers who want better visibility after launch.",
    popular: true,
    features: [
      "Everything in Free Starter",
      "Priority listing",
      "Featured profile badge",
      "More portfolio uploads",
      "Booking performance insights",
      "Early access to new features",
    ],
  },
  {
    name: "Business",
    price: "$10 / month",
    description: "For salons, barbershops, and beauty businesses.",
    popular: false,
    features: [
      "Business profile",
      "Multiple services",
      "Multiple staff profiles",
      "Featured business listing",
      "Customer reviews",
      "Booking request management",
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-[#FFF7ED] px-5 py-5">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-block rounded-full bg-[#F97316]/10 px-4 py-1 text-sm font-semibold text-[#F97316]">
            Early Signup Pricing
          </div>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1C1917] md:text-5xl">
            Join early. Grow early.
          </h2>

          <p className="mt-5 text-l leading-8 text-stone-700">
            Beauty professionals who join during the early signup period get 3
            months free access to the Starter Plan and discounted Pro access
            after launch. Pricing will be adjusted by country as Vuta expands.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[2rem] p-8 transition hover:scale-[1.02] ${
                plan.popular
                  ? "border-2 border-[#F97316] bg-[#FFF7ED] shadow-xl"
                  : "border border-orange-100 bg-white shadow-sm hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F97316] px-4 py-1 text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-black text-[#1C1917]">{plan.name}</h3>

              <p className="mt-3 text-3xl font-black text-[#7C2D12]">
                {plan.price}
              </p>

              <p className="mt-4 text-stone-700">{plan.description}</p>

              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-[#F97316] text-lg">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className={`mt-8 block rounded-full px-6 py-3 text-center font-bold transition hover:scale-[1.02] ${
                  plan.popular
                    ? "bg-[#F97316] text-white hover:bg-[#7C2D12]"
                    : "bg-[#7C2D12] text-white hover:bg-[#F97316]"
                }`}
              >
                Join Early
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-stone-500">
          *All prices shown are USD. Local currency options available at launch.
        </p>
      </div>
    </section>
  );
};

export default Pricing;