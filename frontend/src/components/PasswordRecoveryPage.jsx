import { useMemo, useState } from "react";
import { FaArrowRight, FaCheckCircle, FaLock, FaShieldAlt } from "react-icons/fa";
import API from "../services/api";

const fieldClass =
  "w-full border border-[#F2D3BD] bg-white px-4 py-3 text-sm text-[#211A20] outline-none transition placeholder:text-stone-400 focus:border-[#F26B5E] focus:shadow-sm";

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState({
    error: "",
    loading: false,
    success: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: "", loading: true, success: "" });

    try {
      const { data } = await API.post("/auth/forgot-password", {
        identifier: identifier.trim(),
      });

      setStatus({
        error: "",
        loading: false,
        success:
          data.message ||
          "If an account exists, a reset code has been sent.",
      });
    } catch (error) {
      setStatus({
        error:
          error.response?.data?.message ||
          "We could not send a reset code. Please try again.",
        loading: false,
        success: "",
      });
    }
  };

  return (
    <PasswordShell
      eyebrow="Account recovery"
      title="Reset your Vuta password."
      body="Enter the phone number or email connected to your Vuta account. If it exists, we will send a 6-digit reset code."
    >
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-bold text-[#211A20]">
          Email or phone number
          <input
            autoComplete="username"
            className={fieldClass}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="you@example.com or +254..."
            required
            value={identifier}
          />
        </label>

        <StatusMessage status={status} />

        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#F26B5E] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status.loading}
          type="submit"
        >
          {status.loading ? "Sending..." : "Send reset code"}
          {!status.loading ? <FaArrowRight aria-hidden="true" /> : null}
        </button>
      </form>
    </PasswordShell>
  );
}

export function ResetPasswordPage() {
  const codeFromUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("code") || params.get("token") || "";
  }, []);
  const [form, setForm] = useState({
    code: codeFromUrl,
    password: "",
  });
  const [status, setStatus] = useState({
    error: "",
    loading: false,
    success: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "code" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: "", loading: true, success: "" });

    try {
      const { data } = await API.post("/auth/reset-password", {
        password: form.password,
        token: form.code.trim(),
      });

      setStatus({
        error: "",
        loading: false,
        success:
          data.message ||
          "Password reset successfully. You can now log in on the app.",
      });
      setForm((current) => ({ ...current, password: "" }));
    } catch (error) {
      setStatus({
        error:
          error.response?.data?.message ||
          "We could not reset your password. Please request a new reset code.",
        loading: false,
        success: "",
      });
    }
  };

  return (
    <PasswordShell
      eyebrow="Create new password"
      title="Set a new Vuta password."
      body="Enter the 6-digit reset code from your email, then create a new password with at least 8 characters."
    >
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-bold text-[#211A20]">
          Reset code
          <input
            autoComplete="one-time-code"
            className={fieldClass}
            inputMode="numeric"
            maxLength={6}
            name="code"
            onChange={handleChange}
            pattern="[0-9]{6}"
            placeholder="6-digit code"
            required
            value={form.code}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#211A20]">
          New password
          <input
            autoComplete="new-password"
            className={fieldClass}
            minLength={8}
            name="password"
            onChange={handleChange}
            placeholder="At least 8 characters"
            required
            type="password"
            value={form.password}
          />
        </label>

        <StatusMessage status={status} />

        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#741B5D] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#F26B5E] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status.loading}
          type="submit"
        >
          {status.loading ? "Saving..." : "Reset password"}
          {!status.loading ? <FaArrowRight aria-hidden="true" /> : null}
        </button>
      </form>
    </PasswordShell>
  );
}

function PasswordShell({ body, children, eyebrow, title }) {
  return (
    <section className="bg-[#FFF8F3] px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#F26B5E]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#211A20] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            {body}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <RecoveryPoint
              Icon={FaShieldAlt}
              title="Protected account"
              text="Existing sessions are cleared after a successful password reset."
            />
            <RecoveryPoint
              Icon={FaLock}
              title="Short-lived reset"
              text="Reset codes expire quickly to reduce account risk."
            />
          </div>
        </div>

        <div className="border border-[#F2D3BD] bg-white p-5 shadow-xl md:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}

function RecoveryPoint({ Icon, text, title }) {
  return (
    <div className="bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1EA] text-[#741B5D]">
        <Icon aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-black text-[#211A20]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-700">{text}</p>
    </div>
  );
}

function StatusMessage({ status }) {
  if (status.error) {
    return (
      <p className="bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
        {status.error}
      </p>
    );
  }

  if (status.success) {
    return (
      <p className="flex items-start gap-2 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
        <FaCheckCircle aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>{status.success}</span>
      </p>
    );
  }

  return null;
}
