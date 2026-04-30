const Problem = () => {
  return (
    <section className="bg-white px-5 py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-[#F97316]"></div>
            <div className="h-1 w-12 rounded-full bg-[#7C2D12]"></div>
            <div className="h-1 w-12 rounded-full bg-[#F97316]/40"></div>
          </div>

          <h2 className="text-3xl text-start md:text-center font-black tracking-tight text-[#1C1917] md:text-5xl">
            Africa has beauty talent everywhere. Visibility is the problem.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-start text-l md:text-lg leading-8 text-stone-700">
            Across many African cities, skilled beauty professionals work every
            day but still struggle to get enough clients. Some depend on walk-ins.
            Some work under salons and earn very little. Others have the skill,
            but no simple platform to showcase their work or get discovered.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-start text-l md:text-lg leading-8 text-stone-700">
            At the same time, clients are always searching for someone good,
            affordable, trusted, and nearby. Vuta exists to close that gap across
            Africa, one city at a time.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-transparent p-6 text-center transition hover:scale-[1.02]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/10">
              <span className="text-2xl">💇</span>
            </div>
            <h3 className="font-bold text-[#7C2D12]">Skilled professionals</h3>
            <p className="mt-2 text-sm text-stone-600">Trained talent with no client visibility</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-transparent p-6 text-center transition hover:scale-[1.02]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/10">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-bold text-[#7C2D12]">Clients searching</h3>
            <p className="mt-2 text-sm text-stone-600">No easy way to find trusted nearby talent</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-transparent p-6 text-center transition hover:scale-[1.02]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/10">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="font-bold text-[#7C2D12]">The gap across Africa</h3>
            <p className="mt-2 text-sm text-stone-600">Vuta exists to connect both sides</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;