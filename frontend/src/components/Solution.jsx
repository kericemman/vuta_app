import { useState } from "react";
import {
  FaArrowRight,
  FaBriefcase,
  FaCalendarCheck,
  FaChartLine,
  FaComments,
  FaImages,
  FaMapMarkerAlt,
  FaSearch,
  FaStore,
  FaUserCheck,
} from "react-icons/fa";
import PartnershipModal from "./PartnershipModal";

const categoryProcesses = [
  {
    Icon: FaMapMarkerAlt,
    audience: "Clients",
    intro:
      "For people who want trusted beauty services without guessing who is available or reliable.",
    steps: [
      "Choose your city, area, or preferred beauty category.",
      "Explore providers, services, prices, photos, reviews, and availability.",
      "Save favourites or message a provider before deciding.",
      "Book the service, track the request, and review after the appointment.",
    ],
  },
  {
    Icon: FaUserCheck,
    audience: "Professionals",
    intro:
      "For solo stylists, barbers, nail techs, makeup artists, and beauty specialists building their name.",
    steps: [
      "Create a professional profile with your location and specializations.",
      "Add services, pricing, portfolio images, availability, and service mode.",
      "Receive booking requests and chat with clients inside Vuta.",
      "Grow through reviews, repeat clients, insights, and stronger visibility.",
    ],
  },
  {
    Icon: FaStore,
    audience: "Businesses",
    intro:
      "For salons, spas, barbershops, and beauty teams that need a structured operating layer.",
    steps: [
      "Set up the business profile, location, working hours, and approval details.",
      "Add employees, specializations, services, portfolios, and team availability.",
      "Manage bookings, client messages, updates, and service performance.",
      "Use insights to see demand, top services, team activity, and growth signals.",
    ],
  },
];

const platformPillars = [
  {
    Icon: FaSearch,
    title: "Discover",
    copy: "Search by service, category, location, profile, and business type.",
  },
  {
    Icon: FaImages,
    title: "Trust",
    copy: "View portfolio work, services, reviews, prices, and profile details.",
  },
  {
    Icon: FaComments,
    title: "Connect",
    copy: "Message providers before or after booking when details need clarity.",
  },
  {
    Icon: FaCalendarCheck,
    title: "Book",
    copy: "Request services, choose a time, and follow booking updates in-app.",
  },
];

const Solution = () => {
  const [partnershipOpen, setPartnershipOpen] = useState(false);

  return (
    <>
      <section id="how" className="bg-white px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
                How Vuta works
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight text-[#211A20] md:text-4xl">
                One simple flow, shaped for each user.
              </h2>
            </div>

            
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {categoryProcesses.map(({ Icon, audience, intro, steps }) => (
              <article
                className="border border-[#F2D3BD] bg-[#FFF8F3] p-6 shadow-sm"
                key={audience}
              >
                <div className="flex items-center gap-3">
                  
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F26B5E]">
                      Process
                    </p>
                    <h3 className="text-2xl font-black text-[#211A20]">
                      {audience}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-stone-700">{intro}</p>

                <ol className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <li className="flex gap-3" key={step}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#741B5D] text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-6 text-stone-700">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {platformPillars.map(({ Icon, copy, title }) => (
              <article
                className="border border-[#F2D3BD] bg-white p-5"
                key={title}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F26B5E]/10 text-[#F26B5E]">
                  <Icon aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-black text-[#211A20]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col justify-between gap-6 border border-[#741B5D]/15 bg-[#741B5D] p-6 text-white md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F4B942]">
                Built to grow
              </p>
              <h3 className="mt-2 text-2xl font-black">
                From a saved favourite to a booked appointment.
              </h3>
            </div>
            <div className="grid gap-4 text-[#FFF8F3] md:grid-cols-2">
              <div className="flex items-start gap-3">
                <FaBriefcase
                  aria-hidden="true"
                  className="mt-1 text-[#F4B942]"
                />
                <p className="text-sm leading-7">
                  Providers get profiles, services, portfolio, messages, and
                  booking tools.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FaChartLine
                  aria-hidden="true"
                  className="mt-1 text-[#F4B942]"
                />
                <p className="text-sm leading-7">
                  Businesses get team management, service stats, updates, and
                  insight into demand.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#F26B5E] hover:shadow-md"
              onClick={() => setPartnershipOpen(true)}
              type="button"
            >
              Become a Partner
              <FaArrowRight aria-hidden="true" className="text-xs" />
            </button>
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
