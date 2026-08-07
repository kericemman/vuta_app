import WebsiteFeedbackForm from "./WebsiteFeedbackForm";

export default function WebsiteFeedbackPage() {
  return (
    <section className="bg-[#FFF8F3] px-5 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
            Vuta feedback
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#211A20] md:text-6xl">
            Help us make Vuta better.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            This page is intentionally not listed publicly. Use it to share
            direct feedback from testing, onboarding, or product review.
          </p>
          <div className="mt-8 bg-white p-6 text-sm leading-7 text-stone-700">
            <p className="font-black text-[#211A20]">Useful feedback includes:</p>
            <ul className="mt-3 grid gap-2">
              <li>What felt confusing or slow.</li>
              <li>Where a client, professional, or business would get stuck.</li>
              <li>Which feature would make Vuta more useful before launch.</li>
            </ul>
          </div>
        </div>

        <WebsiteFeedbackForm
          className="bg-[#FFF8F3] p-5 shadow-xl md:p-8"
          defaultTopic="general"
          introCopy="Rate the experience if helpful, then tell us what should change or stay."
          introTitle="Send hidden feedback"
          showRating
          source="website_feedback"
          submitLabel="Send feedback"
        />
      </div>
    </section>
  );
}
