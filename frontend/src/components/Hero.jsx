const Hero = () => {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
      <div>
        <p className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-[#7C2D12]">
          Building for Africa’s beauty economy
        </p>

        <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-[#1C1917] md:text-7xl">
          Find Beauty Professionals Across Africa
        </h1>

        <p className="mt-6 max-w-xl text-l leading-8 text-stone-700">
          Vuta connects clients with trusted hairstylists, barbers, nail techs,
          makeup artists, and beauty professionals in their country and city.
          Browse real work, compare prices, and book directly.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#waitlist"
            className="rounded-full bg-[#7C2D12] px-8 py-4 text-center font-light text-white transition hover:bg-[#F97316] hover:scale-[1.02]"
          >
            Join the Waitlist
          </a>

          <a
            href="#pricing"
            className="rounded-full border border-[#7C2D12] px-8 py-4 text-center font-light text-[#7C2D12] transition hover:bg-[#7C2D12] hover:text-white hover:scale-[1.02]"
          >
            See Early Pricing
          </a>
        </div>

        <p className="mt-5 text-sm text-stone-600">
          Launching first in selected African cities, then expanding country by
          country.
        </p>
      </div>

      <div className="relative rounded-[2rem] bg-white p-4 shadow-2xl transition hover:shadow-xl">
        <div className="absolute -top-3 -right-3 h-24 w-24 rounded-full bg-[#F97316]/20 blur-2xl"></div>
        <div className="absolute -bottom-3 -left-3 h-32 w-32 rounded-full bg-[#7C2D12]/10 blur-2xl"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=500&fit=crop" 
          alt="Beauty professional styling hair"
          className="h-64 w-full rounded-2xl object-cover md:h-80"
        />
        
        <div className="mt-4 grid grid-cols-3 gap-3">
          <img 
            src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=200&h=150&fit=crop" 
            alt="Nail art"
            className="h-20 w-full rounded-xl object-cover transition hover:scale-[1.02]"
          />
          <img 
            src="https://images.unsplash.com/photo-1560869713-7d0a2943084e?w=200&h=150&fit=crop" 
            alt="Barber cutting hair"
            className="h-20 w-full rounded-xl object-cover transition hover:scale-[1.02]"
          />
          <img 
            src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=150&fit=crop" 
            alt="Makeup application"
            className="h-20 w-full rounded-xl object-cover transition hover:scale-[1.02]"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FFF7ED] p-3">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full border-2 border-white bg-[#F97316] flex items-center justify-center text-xs font-bold text-white">⭐</div>
            <div className="h-8 w-8 rounded-full border-2 border-white bg-[#7C2D12] flex items-center justify-center text-xs font-bold text-white">✨</div>
          </div>
          <p className="text-sm font-medium text-[#1C1917]">
            <span className="font-bold">500+</span> beauty professionals joining monthly
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;