import { FaTimes } from "react-icons/fa";
import { WaitlistSignupForm } from "./WaitlistForm";

const WaitlistModal = ({ onClose }) => {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#211A20]/75 px-5 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <div className="mx-auto max-w-3xl rounded-xl bg-[#FFF8F3] p-5 text-[#211A20] shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F26B5E]">
              Vuta app download
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Get the app link
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Tell us where you are and whether you are joining as a client,
              professional, or business. We will send the right Vuta download
              link and launch updates for your city.
            </p>
          </div>

          <button
            aria-label="Close download form"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F2D3BD] bg-white text-[#741B5D] transition hover:bg-[#FFF1EA]"
            onClick={onClose}
            type="button"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <WaitlistSignupForm
          className="mt-6"
          introCopy="Your response helps Vuta plan the next launch cities, categories, and provider onboarding."
          introTitle="Send me the download link"
          submitLabel="Send me the app link"
        />
      </div>
    </div>
  );
};

export default WaitlistModal;
