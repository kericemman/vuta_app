import { useRef, useState } from "react";
import previewBusiness from "../assets/preview-business.jpg";
import previewClient from "../assets/preview-client.jpg";
import previewProfessional from "../assets/preview-professional.jpg";

const previews = [
  {
    image: previewClient,
    label: "Client app",
  },
  {
    image: previewProfessional,
    label: "Professional app",
  },
  {
    image: previewBusiness,
    label: "Business app",
  },
];

const AppPreview = () => {
  const [activePreview, setActivePreview] = useState(0);
  const previewScrollerRef = useRef(null);

  const handlePreviewScroll = (event) => {
    const { clientWidth, scrollLeft } = event.currentTarget;

    if (!clientWidth) {
      return;
    }

    setActivePreview(Math.round(scrollLeft / clientWidth));
  };

  const scrollToPreview = (index) => {
    const scroller = previewScrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollTo({
      left: scroller.clientWidth * index,
      behavior: "smooth",
    });
  };

  return (
    <section id="preview" className="bg-[#FFF8F3] px-5 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
              App preview
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#211A20] md:text-5xl">
              See how Vuta feels for every account type.
            </h2>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-stone-700 lg:text-right">
            Swipe on mobile to move through the client, professional, and
            business previews.
          </p>
        </div>

        <div
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0"
          onScroll={handlePreviewScroll}
          ref={previewScrollerRef}
        >
          {previews.map((preview) => (
            <article
              className="flex min-w-full snap-center justify-center lg:min-w-0"
              key={preview.label}
            >
              <img
                alt={`${preview.label} preview screenshot`}
                className="h-auto max-h-[76svh] w-auto max-w-full object-contain lg:max-h-none lg:w-full"
                loading="lazy"
                src={preview.image}
              />
            </article>
          ))}
        </div>

        <div
          aria-label="App preview slides"
          className="mt-4 flex justify-center gap-2 lg:hidden"
          role="tablist"
        >
          {previews.map((preview, index) => {
            const isActive = activePreview === index;

            return (
              <button
                aria-label={`Show ${preview.label} preview`}
                aria-selected={isActive}
                className={`h-2.5 rounded-full transition-all ${
                  isActive
                    ? "w-8 bg-[#741B5D]"
                    : "w-2.5 bg-[#F2D3BD] hover:bg-[#F26B5E]"
                }`}
                key={preview.label}
                onClick={() => scrollToPreview(index)}
                role="tab"
                type="button"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
