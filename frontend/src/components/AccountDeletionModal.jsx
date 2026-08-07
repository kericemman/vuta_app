import { useState } from "react";
import { FaArrowRight, FaTimes, FaTrashAlt } from "react-icons/fa";
import API from "../services/api";
import LegalConsentCheckbox from "./LegalConsentCheckbox";

const initialForm = {
  acceptedLegalPolicies: false,
  confirmOwnership: false,
  email: "",
  name: "",
  phone: "",
  reason: "",
  role: "client",
};

const accountTypes = [
  { label: "Client account", value: "client" },
  { label: "Professional account", value: "beauty_professional" },
  { label: "Business account", value: "beauty_business" },
];

export default function AccountDeletionModal({ onClose }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    error: "",
    loading: false,
    success: "",
  });
  const fieldClass =
    "w-full rounded-lg border border-[#F2D3BD] bg-white px-4 py-3 text-sm text-[#211A20] outline-none transition placeholder:text-stone-400 focus:border-[#F26B5E] focus:shadow-sm";

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
      const { data } = await API.post("/account-deletion-requests", form);

      setForm(initialForm);
      setStatus({
        error: "",
        loading: false,
        success:
          data.message ||
          "Your account deletion request has been received.",
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
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#211A20]/70 px-5 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <div className="mx-auto max-w-3xl rounded-xl bg-[#FFF8F3] p-5 text-[#211A20] shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#F26B5E]">
              <FaTrashAlt aria-hidden="true" />
              Account deletion
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Request account deletion
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Submit the details linked to your Vuta account. The team will
              verify ownership before processing deletion.
            </p>
          </div>

          <button
            aria-label="Close account deletion form"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F2D3BD] bg-white text-[#741B5D] transition hover:bg-[#FFF1EA]"
            onClick={onClose}
            type="button"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className={fieldClass}
            name="name"
            onChange={handleChange}
            placeholder="Full name on account"
            required
            value={form.name}
          />
          <input
            className={fieldClass}
            name="email"
            onChange={handleChange}
            placeholder="Email linked to account"
            required
            type="email"
            value={form.email}
          />
          <input
            className={fieldClass}
            name="phone"
            onChange={handleChange}
            placeholder="Phone linked to account"
            value={form.phone}
          />
          <select
            className={fieldClass}
            name="role"
            onChange={handleChange}
            required
            value={form.role}
          >
            {accountTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <textarea
            className={`${fieldClass} md:col-span-2`}
            name="reason"
            onChange={handleChange}
            placeholder="Reason for deletion, optional"
            rows="4"
            value={form.reason}
          />

          <label className="flex gap-3 rounded-lg border border-[#F2D3BD] bg-white px-4 py-3 text-sm leading-6 text-stone-700 md:col-span-2">
            <input
              checked={form.confirmOwnership}
              className="mt-1 h-4 w-4 shrink-0 accent-[#741B5D]"
              name="confirmOwnership"
              onChange={handleChange}
              required
              type="checkbox"
            />
            <span>
              I confirm these details belong to my Vuta account and I am
              requesting deletion of that account.
            </span>
          </label>

          <LegalConsentCheckbox
            checked={form.acceptedLegalPolicies}
            name="acceptedLegalPolicies"
            onChange={handleChange}
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
            {status.loading ? "Submitting..." : "Submit deletion request"}
            {!status.loading ? (
              <FaArrowRight aria-hidden="true" className="text-xs" />
            ) : null}
          </button>
        </form>
      </div>
    </div>
  );
}
