import { useState } from "react";
import { FaArrowRight, FaStar } from "react-icons/fa";
import API from "../services/api";
import LegalConsentCheckbox from "./LegalConsentCheckbox";

const roleOptions = [
  { label: "I use Vuta as a client", value: "client" },
  { label: "I am a beauty professional", value: "beauty_professional" },
  { label: "I run a beauty business", value: "beauty_business" },
];

const topicOptions = [
  { label: "General", value: "general" },
  { label: "Bookings", value: "booking" },
  { label: "Messages", value: "messages" },
  { label: "Profile", value: "profile" },
  { label: "Search", value: "search" },
  { label: "Performance", value: "performance" },
  { label: "Payments", value: "payments" },
  { label: "Other", value: "other" },
];

const createInitialForm = (source, defaultTopic) => ({
  acceptedLegalPolicies: false,
  contactConsent: true,
  email: "",
  message: "",
  name: "",
  phone: "",
  rating: "",
  role: "client",
  source,
  topic: defaultTopic,
});

export default function WebsiteFeedbackForm({
  className = "",
  defaultTopic = "general",
  introCopy,
  introTitle,
  showRating = false,
  source = "website_feedback",
  submitLabel = "Send message",
}) {
  const [form, setForm] = useState(() => createInitialForm(source, defaultTopic));
  const [status, setStatus] = useState({
    error: "",
    loading: false,
    success: "",
  });
  const fieldClass =
    "w-full border border-[#F2D3BD] bg-white px-4 py-3 text-sm text-[#211A20] outline-none transition placeholder:text-stone-400 focus:border-[#F26B5E] focus:shadow-sm";

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: "", loading: true, success: "" });

    try {
      const payload = {
        ...form,
        rating: form.rating || undefined,
      };
      const { data } = await API.post("/feedback/public", payload);

      setStatus({
        error: "",
        loading: false,
        success: data.message || "Thank you. The Vuta team has received this.",
      });
      setForm(createInitialForm(source, defaultTopic));
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
    <form className={className} onSubmit={handleSubmit}>
      {introTitle ? (
        <div className="mb-6">
          <h2 className="text-2xl font-black text-[#211A20]">{introTitle}</h2>
          {introCopy ? (
            <p className="mt-2 text-sm leading-6 text-stone-600">{introCopy}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className={fieldClass}
          name="name"
          onChange={handleChange}
          placeholder="Full name"
          required
          value={form.name}
        />
        <input
          className={fieldClass}
          name="email"
          onChange={handleChange}
          placeholder="Email address"
          required
          type="email"
          value={form.email}
        />
        <input
          className={fieldClass}
          name="phone"
          onChange={handleChange}
          placeholder="Phone / WhatsApp number"
          value={form.phone}
        />
        <select
          className={fieldClass}
          name="role"
          onChange={handleChange}
          required
          value={form.role}
        >
          {roleOptions.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <select
          className={`${fieldClass} md:col-span-2`}
          name="topic"
          onChange={handleChange}
          required
          value={form.topic}
        >
          {topicOptions.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>

        {showRating ? (
          <div className="md:col-span-2">
            <p className="text-sm font-bold text-[#211A20]">Overall rating</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => {
                const isActive = Number(form.rating) >= rating;

                return (
                  <button
                    aria-label={`Rate ${rating} out of 5`}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      isActive
                        ? "border-[#F4B942] bg-[#F4B942] text-[#211A20]"
                        : "border-[#F2D3BD] bg-white text-stone-400 hover:border-[#F4B942]"
                    }`}
                    key={rating}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        rating: String(rating),
                      }))
                    }
                    type="button"
                  >
                    <FaStar aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <textarea
          className={`${fieldClass} md:col-span-2`}
          name="message"
          onChange={handleChange}
          placeholder="How can the Vuta team help?"
          required
          rows="6"
          value={form.message}
        />

        <label className="flex gap-3 bg-white px-4 py-3 text-sm leading-6 text-stone-700 md:col-span-2">
          <input
            checked={form.contactConsent}
            className="mt-1 h-4 w-4 shrink-0 accent-[#741B5D]"
            name="contactConsent"
            onChange={handleChange}
            type="checkbox"
          />
          <span>Vuta may contact me about this message.</span>
        </label>

        <LegalConsentCheckbox
          checked={form.acceptedLegalPolicies}
          name="acceptedLegalPolicies"
          onChange={handleChange}
        />

        {status.error ? (
          <p className="bg-red-50 px-4 py-3 text-sm text-red-600 md:col-span-2">
            {status.error}
          </p>
        ) : null}
        {status.success ? (
          <p className="bg-green-50 px-4 py-3 text-sm text-green-700 md:col-span-2">
            {status.success}
          </p>
        ) : null}

        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-6 py-4 font-bold text-white transition hover:scale-[1.02] hover:bg-[#F26B5E] disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
          disabled={status.loading}
          type="submit"
        >
          {status.loading ? "Submitting..." : submitLabel}
          {!status.loading ? (
            <FaArrowRight aria-hidden="true" className="text-xs" />
          ) : null}
        </button>
      </div>
    </form>
  );
}
