import { useState } from "react";
import { FaArrowRight, FaHandshake, FaTimes } from "react-icons/fa";
import API from "../services/api";

const initialForm = {
  audience: "",
  city: "",
  contactName: "",
  country: "",
  email: "",
  message: "",
  organizationName: "",
  partnershipType: "brand",
  phone: "",
  website: "",
};

const partnershipTypes = [
  { label: "Beauty brand", value: "brand" },
  { label: "Training academy", value: "training_academy" },
  { label: "Beauty supplier", value: "beauty_supplier" },
  { label: "Corporate partner", value: "corporate" },
  { label: "Influencer / creator", value: "influencer" },
  { label: "Media", value: "media" },
  { label: "Investor", value: "investor" },
  { label: "Other", value: "other" },
];

export function PartnershipForm({ className = "", showHeader = true }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    error: "",
    loading: false,
    success: "",
  });

  const fieldClass =
    "w-full rounded-lg border border-[#F2D3BD] bg-white px-4 py-3 text-sm text-[#211A20] outline-none transition placeholder:text-stone-400 focus:border-[#F26B5E] focus:shadow-sm";

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: "", loading: true, success: "" });

    try {
      const { data } = await API.post("/partnerships", form);

      setForm(initialForm);
      setStatus({
        error: "",
        loading: false,
        success:
          data.message ||
          "Thank you. Our partnership team will review your request.",
      });
    } catch (error) {
      setStatus({
        error:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        loading: false,
        success: "",
      });
    }
  };

  return (
    <div className={className}>
      {showHeader ? (
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#F26B5E]">
            <FaHandshake aria-hidden="true" />
            Partnership
          </p>
          <h2 className="mt-3 text-3xl font-black">
            Partner with Vuta
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            Tell us about your brand, community, or business opportunity.
            The Vuta team will review and follow up.
          </p>
        </div>
      ) : null}

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          className={fieldClass}
          name="organizationName"
          onChange={handleChange}
          placeholder="Organization / brand name"
          required
          value={form.organizationName}
        />
        <input
          className={fieldClass}
          name="contactName"
          onChange={handleChange}
          placeholder="Contact person"
          required
          value={form.contactName}
        />
        <input
          className={fieldClass}
          name="email"
          onChange={handleChange}
          placeholder="Work email"
          required
          type="email"
          value={form.email}
        />
        <input
          className={fieldClass}
          name="phone"
          onChange={handleChange}
          placeholder="Phone / WhatsApp"
          value={form.phone}
        />
        <input
          className={fieldClass}
          name="country"
          onChange={handleChange}
          placeholder="Country"
          required
          value={form.country}
        />
        <input
          className={fieldClass}
          name="city"
          onChange={handleChange}
          placeholder="City"
          value={form.city}
        />
        <input
          className={fieldClass}
          name="website"
          onChange={handleChange}
          placeholder="Website or social link, https://..."
          type="url"
          value={form.website}
        />
        <select
          className={fieldClass}
          name="partnershipType"
          onChange={handleChange}
          required
          value={form.partnershipType}
        >
          {partnershipTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          className={`${fieldClass} md:col-span-2`}
          name="audience"
          onChange={handleChange}
          placeholder="Audience or reach, optional"
          value={form.audience}
        />
        <textarea
          className={`${fieldClass} md:col-span-2`}
          name="message"
          onChange={handleChange}
          placeholder="Tell us what partnership you have in mind"
          required
          rows="5"
          value={form.message}
        />

        {status.error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700 md:col-span-2">
            {status.error}
          </p>
        ) : null}

        {status.success ? (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-green-700 md:col-span-2">
            {status.success}
          </p>
        ) : null}

        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-6 py-4 font-bold text-white transition hover:bg-[#F26B5E] disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
          disabled={status.loading}
          type="submit"
        >
          {status.loading ? "Submitting..." : "Submit partnership request"}
          {!status.loading ? (
            <FaArrowRight aria-hidden="true" className="text-xs" />
          ) : null}
        </button>
      </form>
    </div>
  );
}

export default function PartnershipModal({ onClose }) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#211A20]/70 px-5 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <div className="mx-auto max-w-3xl rounded-xl bg-[#FFF8F3] p-5 text-[#211A20] shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#F26B5E]">
              <FaHandshake aria-hidden="true" />
              Partnership
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Partner with Vuta
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Tell us about your brand, community, or business opportunity.
              The Vuta team will review and follow up.
            </p>
          </div>

          <button
            aria-label="Close partnership form"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F2D3BD] bg-white text-[#741B5D] transition hover:bg-[#FFF1EA]"
            onClick={onClose}
            type="button"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <PartnershipForm showHeader={false} />
      </div>
    </div>
  );
}
