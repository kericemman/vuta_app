import { useState } from "react";
import {
  FaApple,
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaGooglePlay,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import heroAfricanBeauty from "../assets/hero-african-beauty.jpg";
import previewBusiness from "../assets/preview-business.jpg";
import previewClient from "../assets/preview-client.jpg";
import previewProfessional from "../assets/preview-professional.jpg";
import WaitlistModal from "./WaitlistModal";

const storeLinks = {
  android: import.meta.env.VITE_ANDROID_APP_URL || "",
  ios: import.meta.env.VITE_IOS_APP_URL || "",
};

const platforms = [
  {
    id: "ios",
    Icon: FaApple,
    label: "iOS",
    title: "Download for iPhone",
    store: "App Store",
  },
  {
    id: "android",
    Icon: FaGooglePlay,
    label: "Android",
    title: "Download for Android",
    store: "Google Play",
  },
];

const journeys = [
  {
    image: previewClient,
    label: "Clients",
    steps: [
      "Find beauty services and providers around you.",
      "Compare portfolios, prices, ratings, and availability.",
      "Save favourites, message, and request a booking.",
    ],
  },
  {
    image: previewProfessional,
    label: "Professionals",
    steps: [
      "Create a professional profile with services and portfolio.",
      "Receive booking requests and chat with clients.",
      "Track ratings, reviews, bookings, and growth.",
    ],
  },
  {
    image: previewBusiness,
    label: "Businesses",
    steps: [
      "Add your business, team members, and service menu.",
      "Let clients view staff profiles and book the right specialist.",
      "Manage bookings, updates, insights, and visibility.",
    ],
  },
];

const isStoreLinkReady = (url) => /^https?:\/\//i.test(url.trim());

export default function DownloadPage({ platform }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platform || "ios");

  const handleDownload = (platformId) => {
    const storeUrl = storeLinks[platformId]?.trim() || "";

    setSelectedPlatform(platformId);

    if (isStoreLinkReady(storeUrl)) {
      window.location.assign(storeUrl);
      return;
    }

    setWaitlistOpen(true);
  };

  const selectedLabel =
    platforms.find((item) => item.id === selectedPlatform)?.label || "your phone";

  return (
    <>
      <section className="relative overflow-hidden bg-[#211A20] px-5 py-20 text-white md:py-24">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
          src={heroAfricanBeauty}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(33,26,32,0.94)_0%,rgba(116,27,93,0.78)_45%,rgba(33,26,32,0.22)_100%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#F4B942]">
              Download Vuta
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Get Vuta on iOS or Android.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#FFF8F3] md:text-lg">
              Vuta helps clients discover trusted beauty professionals,
              professionals manage their bookings, and businesses run services,
              teams, and client demand from one mobile app.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {platforms.map(({ Icon, id, store, title }) => (
                <button
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                    selectedPlatform === id
                      ? "border-[#F4B942] bg-white text-[#211A20]"
                      : "border-white/20 bg-white/10 text-white hover:border-[#F4B942] hover:bg-white/15"
                  }`}
                  key={id}
                  onClick={() => handleDownload(id)}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <Icon aria-hidden="true" className="text-3xl" />
                    <span>
                      <span className="block text-xs font-semibold opacity-75">
                        {store}
                      </span>
                      <span className="block text-base font-black">{title}</span>
                    </span>
                  </span>
                  <FaArrowRight aria-hidden="true" className="shrink-0 text-sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur md:grid-cols-3">
            <TrustPoint
              Icon={FaShieldAlt}
              label="Trusted profiles"
              text="Review work, services, ratings, and business details."
            />
            <TrustPoint
              Icon={FaBell}
              label="Live updates"
              text="Follow bookings, messages, notifications, and app updates."
            />
            <TrustPoint
              Icon={FaUsers}
              label="Built for all"
              text="Clients, solo professionals, and beauty businesses."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#FFF8F3] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
              How Vuta works
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#211A20] md:text-5xl">
              One app, three clear journeys.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {journeys.map((journey) => (
              <article
                className="overflow-hidden border border-[#F2D3BD] bg-white shadow-sm"
                key={journey.label}
              >
                <img
                  alt={`${journey.label} app preview`}
                  className="h-72 w-full object-cover object-top"
                  loading="lazy"
                  src={journey.image}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-black text-[#211A20]">
                    {journey.label}
                  </h3>
                  <ul className="mt-5 space-y-4 text-sm leading-6 text-stone-700">
                    {journey.steps.map((step) => (
                      <li className="flex gap-3" key={step}>
                        <FaCheckCircle
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-[#F26B5E]"
                        />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border border-[#F2D3BD] bg-[#FFF8F3] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F26B5E]">
              Send me the link
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#211A20]">
              Get the Vuta download link for {selectedLabel}.
            </h2>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#F26B5E]"
            onClick={() => handleDownload(selectedPlatform)}
            type="button"
          >
            Continue
            <FaArrowRight aria-hidden="true" className="text-xs" />
          </button>
        </div>
      </section>

      {waitlistOpen ? (
        <WaitlistModal onClose={() => setWaitlistOpen(false)} />
      ) : null}
    </>
  );
}

function TrustPoint({ Icon, label, text }) {
  return (
    <div className="rounded-2xl bg-white/90 p-5 text-[#211A20]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF8F3] text-[#741B5D]">
        <Icon aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-black">{label}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-700">{text}</p>
    </div>
  );
}
