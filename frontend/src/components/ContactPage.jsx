import { useState } from "react";
import {
  FiMail,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import AccountDeletionModal from "./AccountDeletionModal";
import WebsiteFeedbackForm from "./WebsiteFeedbackForm";

const contactCards = [
  {
    Icon: FiMail,
    copy: "Use the form and the Vuta team will route your message to the right person.",
    title: "Support and enquiries",
  },
  {
    Icon: FiMessageCircle,
    copy: "Clients, professionals, businesses, partners, and early testers can reach us here.",
    title: "One clear channel",
  },
];

const shouldOpenDeletionModal = () => {
  const params = new URLSearchParams(window.location.search);

  return (
    params.get("request") === "account-deletion" ||
    window.location.hash === "#account-deletion"
  );
};

export default function ContactPage() {
  const [deletionModalOpen, setDeletionModalOpen] = useState(
    shouldOpenDeletionModal
  );

  const openDeletionModal = (event) => {
    event.preventDefault();
    window.history.pushState(null, "", "/contact?request=account-deletion");
    setDeletionModalOpen(true);
  };

  const closeDeletionModal = () => {
    window.history.replaceState(null, "", "/contact");
    setDeletionModalOpen(false);
  };

  return (
    <>
      <section className="bg-[#FFF8F3] px-5 pb-8 pt-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
              Contact Vuta
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#211A20] md:text-6xl">
              Talk to the team building trusted beauty closer.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
              Send a support question, launch enquiry, business request, safety
              concern, or partnership note. We will get it to the right person.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {contactCards.map(({ Icon, copy, title }) => (
                <div className="bg-white p-5" key={title}>
                  <Icon aria-hidden="true" className="text-2xl text-[#741B5D]" />
                  <h2 className="mt-4 text-lg font-black text-[#211A20]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <WebsiteFeedbackForm
            className="bg-[#FFF8F3] p-5 shadow-xl md:p-8"
            defaultTopic="general"
            introCopy="Share enough detail for us to understand what you need. If follow-up is allowed, we may reply using your email or phone number."
            introTitle="Send Vuta a message"
            source="website_contact"
            submitLabel="Send contact message"
          />
        </div>
      </section>

      <section className="bg-white px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm leading-6 text-stone-700 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <FiMapPin aria-hidden="true" className="text-xl text-[#F26B5E]" />
            <p>Built for African beauty communities, launching city by city.</p>
          </div>
          <div className="grid gap-3 md:justify-items-end">
            <a
              className="font-bold text-[#741B5D] underline-offset-4 transition hover:text-[#F26B5E] hover:underline"
              href="mailto:hello@vuta.app"
            >
              hello@vuta.app
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full bg-[#741B5D] px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02] hover:bg-[#F26B5E]"
              href="/contact?request=account-deletion"
              id="account-deletion"
              onClick={openDeletionModal}
            >
              Request account deletion
            </a>
          </div>
        </div>
      </section>
      {deletionModalOpen ? (
        <AccountDeletionModal onClose={closeDeletionModal} />
      ) : null}
    </>
  );
}
