import { useState } from "react";
import { FiLock, FiShield } from "react-icons/fi";
import { getAdminErrorMessage, loginAdmin } from "../adminApi";
import { ErrorText, InfoRowLight } from "../components/ui";

export default function AdminLogin({ health, onLoginSuccess }) {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await loginAdmin(form);
      onLoginSuccess(session);
    } catch (loginError) {
      setError(getAdminErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8F3] px-5 py-10 text-[#211A20]">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[#EADBD3] bg-white shadow-xl lg:grid-cols-[1fr_420px]">
        <div className="bg-[#741B5D] p-8 text-white lg:p-10">
          <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wide text-[#F4B942]">
            <FiShield aria-hidden="true" />
            Secure admin
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight">
            Sign in to manage Vuta.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/80">
            Waitlist data, users, providers, services, and bookings only load
            after a verified admin login.
          </p>
          <div className="mt-8 grid gap-3 text-sm">
            <InfoRowLight label="API" value={health?.status || "Checking"} />
            <InfoRowLight
              label="Database"
              value={health?.database || "Checking"}
            />
          </div>
        </div>

        <form className="grid gap-4 p-6 lg:p-8" onSubmit={handleSubmit}>
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF1EA] text-[#741B5D]">
              <FiLock aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-black">Admin login</h2>
            <p className="mt-1 text-sm text-[#746A71]">
              Use the admin account created by the seed command.
            </p>
          </div>

          <input
            className="rounded-lg border border-[#EADBD3] px-4 py-3 text-sm outline-none focus:border-[#741B5D]"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                identifier: event.target.value,
              }))
            }
            placeholder="Admin email or phone"
            value={form.identifier}
          />
          <input
            className="rounded-lg border border-[#EADBD3] px-4 py-3 text-sm outline-none focus:border-[#741B5D]"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Password"
            type="password"
            value={form.password}
          />
          {error ? <ErrorText message={error} /> : null}
          <button
            className="rounded-lg bg-[#741B5D] px-4 py-3 text-sm font-black text-white transition hover:bg-[#F26B5E] disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
