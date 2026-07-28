import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import API from "../services/api";
import LegalConsentCheckbox from "./LegalConsentCheckbox";

const initialState = {
  acceptedLegalPolicies: false,
  name: "",
  email: "",
  phone: "",
  country: "",
  location: "",
  userType: "client",
  serviceOffered: "",
  portfolioLink: "",
  message: "",
};

export const WaitlistSignupForm = ({
  className = "",
  introCopy = "Your details help Vuta prioritize cities, services, and early provider onboarding.",
  introTitle = "Tell us where to launch next",
  submitLabel = "Get Early Access",
}) => {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleChange = (e) => {
    const { checked, name, type, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ loading: true, error: "", success: "" });

    try {
      const { data } = await API.post("/waitlist", form);

      setStatus({
        loading: false,
        error: "",
        success: data.message || "You have joined the waitlist.",
      });

      setForm(initialState);
    } catch (error) {
      setStatus({
        loading: false,
        error:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        success: "",
      });
    }
  };

  const isProvider =
    form.userType === "beauty_professional" ||
    form.userType === "beauty_business";
  const fieldClass =
    "w-full border border-[#F2D3BD] bg-white px-4 py-3 text-sm text-[#211A20] outline-none transition placeholder:text-stone-400 focus:border-[#F26B5E] focus:shadow-sm";

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="mb-6">
        <h3 className="text-2xl font-black text-[#211A20]">{introTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">{introCopy}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Full name"
          className={fieldClass}
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          placeholder="Email address"
          required
          className={fieldClass}
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          placeholder="Phone / WhatsApp number"
          className={fieldClass}
        />

        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          required
          placeholder="Country e.g. Kenya, Uganda, Tanzania"
          className={fieldClass}
        />

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          placeholder="City / Area e.g. Nairobi, Kilimani"
          className={fieldClass}
        />

        <select
          name="userType"
          value={form.userType}
          onChange={handleChange}
          required
          className={fieldClass}
        >
          <option value="client">I want to find services</option>
          <option value="beauty_professional">I am a beauty professional</option>
          <option value="beauty_business">I run a salon, spa, or barbershop</option>
        </select>

        {isProvider && (
          <>
            <input
              name="serviceOffered"
              value={form.serviceOffered}
              onChange={handleChange}
              placeholder="Service offered e.g. Braids, Barber, Nails"
              className={fieldClass}
            />

            <input
              name="portfolioLink"
              value={form.portfolioLink}
              onChange={handleChange}
              placeholder="Instagram / TikTok / Portfolio link"
              className={fieldClass}
            />
          </>
        )}

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Which city should Vuta launch in first?"
          rows="4"
          className={`${fieldClass} md:col-span-2`}
        />

        <LegalConsentCheckbox
          checked={form.acceptedLegalPolicies}
          name="acceptedLegalPolicies"
          onChange={handleChange}
        />

        {status.error && (
          <p className="bg-red-50 px-4 py-3 text-sm text-red-600 md:col-span-2">
            {status.error}
          </p>
        )}

        {status.success && (
          <p className="bg-green-50 px-4 py-3 text-sm text-green-700 md:col-span-2">
            {status.success}
          </p>
        )}

        <button
          disabled={status.loading}
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-6 py-4 font-bold text-white transition hover:bg-[#F26B5E] disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
        >
          {status.loading ? "Submitting..." : submitLabel}
          {!status.loading ? (
            <FaArrowRight aria-hidden="true" className="text-xs" />
          ) : null}
        </button>
      </div>
    </form>
  );
};

const WaitlistForm = () => {
  return (
    <section id="waitlist" className="bg-white px-5 py-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
            Early access
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight text-[#211A20] md:text-5xl">
            Be first to know when Vuta is available for you.
          </h2>

          <p className="mt-6 text-lg leading-8 text-stone-700">
            Become the first to experience Vuta App and help shape the future of beauty discovery, bookings, and growth. Join the waitlist to get early access and updates.
          </p>

          <div className="mt-8 border border-[#F2D3BD] bg-[#FFF8F3] p-6">
            <h3 className="text-xl font-black text-[#211A20]">
              Early access promise
            </h3>

            <p className="mt-3 text-stone-700">
              We will notify you when is ready for download and provide exclusive early access to the app. Your feedback will help us improve the experience for all users.
            </p>
          </div>
        </div>

        <WaitlistSignupForm
          className="border border-[#F2D3BD] bg-[#FFF8F3] p-5 shadow-xl md:p-8"
          submitLabel="Get Early Access"
        />
      </div>
    </section>
  );
};

export default WaitlistForm;
