import { useState } from "react";
import API from "../services/api";

const initialState = {
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

const WaitlistForm = () => {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
    form.userType === "beauty_professional" || form.userType === "salon_owner";

  return (
    <section id="waitlist" className="bg-gradient-to-b from-[#FFF7ED] to-white px-5 py-5">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
        <div>
          <div className="mb-4 inline-block rounded-full bg-[#F97316]/10 px-4 py-1 text-sm font-semibold text-[#F97316]">
            Join the waitlist
          </div>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1C1917] md:text-5xl">
            Be among the first to use Vuta in Africa.
          </h2>

          <p className="mt-6 text-l leading-8 text-stone-700">
            Whether you're looking for beauty services or offering them, join the
            waitlist and help us know which African country and city to launch
            in next.
          </p>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg transition hover:shadow-xl">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F97316]/10 text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-black text-[#1C1917]">Early access promise</h3>

            <p className="mt-3 text-stone-700">
              Early beauty professionals get profile approval priority, 3 months
              free Starter access, and discounted Pro pricing after launch.
            </p>
          </div>

          
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] bg-white p-6 shadow-2xl transition hover:shadow-xl md:p-8"
        >
          <div className="grid gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Full name"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email address"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Phone / WhatsApp number"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            />

            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              required
              placeholder="Country e.g. Kenya, Uganda, Tanzania"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            />

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="City / Area e.g. Nairobi, Kilimani"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            />

            <select
              name="userType"
              value={form.userType}
              onChange={handleChange}
              required
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            >
              <option value="client">I am a Client</option>
              <option value="beauty_professional">
                I am a Beauty Professional
              </option>
              <option value="salon_owner">I own a Salon / Barber Shop</option>
            </select>

            {isProvider && (
              <>
                <input
                  name="serviceOffered"
                  value={form.serviceOffered}
                  onChange={handleChange}
                  placeholder="Service offered e.g. Braids, Barber, Nails"
                  className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
                />

                <input
                  name="portfolioLink"
                  value={form.portfolioLink}
                  onChange={handleChange}
                  placeholder="Instagram / TikTok / Portfolio link"
                  className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
                />
              </>
            )}

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Which city should Vuta launch in first?"
              rows="4"
              className="rounded-2xl border border-orange-100 px-4 py-3 outline-none transition focus:border-[#F97316] focus:shadow-sm hover:border-orange-200"
            />

            {status.error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 transition hover:bg-red-100">
                {status.error}
              </p>
            )}

            {status.success && (
              <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 transition hover:bg-green-100">
                {status.success}
              </p>
            )}

            <button
              disabled={status.loading}
              className="rounded-full bg-[#7C2D12] px-6 py-4 font-bold text-white transition hover:bg-[#F97316] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status.loading ? "Submitting..." : "Join the Waitlist"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default WaitlistForm;