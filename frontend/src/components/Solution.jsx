import {
  FaArrowRight,
  FaCalendarCheck,
  FaChartLine,
  FaImages,
  FaMapMarkerAlt,
  FaSearch,
  FaStore,
  FaUsers,
} from "react-icons/fa";
import PartnershipModal from "./PartnershipModal";
import { useState } from "react";

const steps = [
  {
    Icon: FaSearch,
    title: "Search",
    copy: "Clients browse services, categories, prices, and nearby providers by city or current location.",
  },
  {
    Icon: FaImages,
    title: "Compare",
    copy: "Profiles show portfolio work, service details, reviews, business info, and availability signals.",
  },
  {
    Icon: FaCalendarCheck,
    title: "Book",
    copy: "Clients request a time, choose service mode, select a specialist when available, and message in-app.",
  },
];

const audiences = [
  {
    Icon: FaMapMarkerAlt,
    title: "Clients",
    copy: "Find trusted beauty services nearby without relying only on referrals.",
  },
  {
    Icon: FaUsers,
    title: "Professionals",
    copy: "Showcase work, list services, receive bookings, and build repeat clients.",
  },
  {
    Icon: FaStore,
    title: "Businesses",
    copy: "Manage staff, services, bookings, marketing cards, and performance insights.",
  },
];

const Solution = () => {
  const [partnershipOpen, setPartnershipOpen] = useState(false);
  return (
    <>
      <section id="how" className="bg-white px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
                How Vuta works
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight text-[#211A20] md:text-5xl">
                Discovery, trust, booking, and growth in one beauty marketplace.
              </h2>

              <p className="mt-6 text-lg leading-8 text-stone-700">
                The product is being built as more than a directory. It connects
                client intent with provider readiness: location, services,
                portfolio, availability, messaging, and booking status.
              </p>

              <button
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#F26B5E] hover:shadow-md"
                onClick={() => setPartnershipOpen(true)}
                type="button"
              >
                Become a Partner
                <FaArrowRight aria-hidden="true" className="text-xs" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(({ Icon, copy, title }, index) => (
                <article
                  className="border border-[#F2D3BD] bg-[#FFF8F3] p-5"
                  key={title}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#741B5D] shadow-sm">
                      <Icon aria-hidden="true" />
                    </div>
                    <span className="text-sm font-black text-[#F4B942]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-black text-[#211A20]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {audiences.map(({ Icon, copy, title }) => (
              <article
                className="border border-[#F2D3BD] bg-white p-6 shadow-sm"
                key={title}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F26B5E]/10 text-[#F26B5E]">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-black text-[#211A20]">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col justify-between gap-6 border border-[#741B5D]/15 bg-[#741B5D] p-6 text-white md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B942]">
                Built to scale
              </p>
              <h3 className="mt-2 text-2xl font-black">
                From a solo stylist to a multi-staff beauty business.
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[#FFF8F3]">
              <FaChartLine aria-hidden="true" className="text-[#F4B942]" />
              <p className="max-w-md text-sm leading-7">
                Vuta grows from discovery into bookings, messaging, customer
                retention, team management, and business insights.
              </p>
            </div>
          </div>
        </div>
      </section>
      {partnershipOpen ? (
        <PartnershipModal onClose={() => setPartnershipOpen(false)} />
      ) : null}
    </>
  );
};

export default Solution;
