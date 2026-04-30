const Solution = () => {
  const items = [
    "Search beauty professionals by country and city",
    "Find providers near your location",
    "View real portfolio photos",
    "Compare service prices",
    "Book directly through phone or WhatsApp",
    "Choose home service or provider location",
  ];

  const icons = ["🌍", "📍", "📸", "💰", "💬", "🏠"];

  return (
    <section id="how" className="bg-gradient-to-b from-white to-[#FFF7ED] px-5 py-5">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="mb-4 flex gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#F97316]">
              How Vuta works
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#1C1917] md:text-5xl">
            A better way to find and book beauty services in Africa.
          </h2>

          <p className="mt-6 text-l leading-8 text-stone-700">
            Vuta helps clients discover beauty professionals based on country,
            city, location, service, price, portfolio, and reviews. No endless
            asking around. No guessing. Just search, view, and book.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item}
              className="group rounded-3xl bg-white p-6 shadow transition hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F97316]/10 text-2xl transition group-hover:bg-[#F97316]/20">
                {icons[index]}
              </div>
              <p className="text-l font-bold text-[#1C1917]">{item}</p>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
};

export default Solution;