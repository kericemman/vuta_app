export function MetricCard({ detail, icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#EADBD3] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#746A71]">{label}</p>
        <span className="text-[#741B5D]">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm text-[#746A71]">{detail}</p>
    </div>
  );
}

export function Panel({ children }) {
  return (
    <div className="rounded-lg border border-[#EADBD3] bg-white p-4">
      {children}
    </div>
  );
}

export function PanelHeader({ eyebrow, subtitle, title }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-[#F26B5E]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-[#746A71]">{subtitle}</p>
    </div>
  );
}

export function TableHeader({ action, eyebrow, subtitle, title }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <PanelHeader eyebrow={eyebrow} subtitle={subtitle} title={title} />
      {action}
    </div>
  );
}

export function DataTable({ children, loading }) {
  return (
    <div className="mt-4">
      {loading ? (
        <div className="mb-3 rounded-lg border border-[#EADBD3] bg-[#FFF8F3] px-4 py-3 text-sm font-bold text-[#746A71]">
          Loading...
        </div>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function StatusPill({ label, tone }) {
  const tones = {
    danger: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-[#EADBD3] bg-[#FFF8F3] text-[#746A71]",
    premium: "border-[#F4B942]/40 bg-[#F4B942]/15 text-[#8A5B00]",
    success: "border-green-200 bg-green-50 text-green-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${
        tones[tone] || tones.neutral
      }`}
    >
      {label}
    </span>
  );
}

export function ActionButton({ icon, label, onClick }) {
  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#EADBD3] bg-white px-3 py-2 text-sm font-bold text-[#741B5D] transition hover:bg-[#FFF1EA]"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

export function SmallButton({ icon, label, onClick }) {
  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#EADBD3] px-3 py-2 text-xs font-bold text-[#741B5D] transition hover:bg-[#FFF1EA]"
      onClick={onClick}
      title={label}
    >
      {icon ? <span className="text-sm">{icon}</span> : null}
      {label}
    </button>
  );
}

export function IconButton({ icon, label, onClick, tone }) {
  return (
    <button
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
        tone === "danger"
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[#EADBD3] text-[#741B5D] hover:bg-[#FFF1EA]"
      }`}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F3E8E1] pb-2 text-sm">
      <span className="text-[#746A71]">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export function InfoRowLight({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-2">
      <span className="text-white/70">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed border-[#EADBD3] bg-[#FFF8F3] p-5 text-center text-sm font-bold text-[#746A71]">
      {message}
    </div>
  );
}

export function ErrorText({ message }) {
  return (
    <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
      {message}
    </p>
  );
}
