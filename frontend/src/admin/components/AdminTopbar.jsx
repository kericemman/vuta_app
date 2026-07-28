import { FiMenu, FiRefreshCw, FiSearch } from "react-icons/fi";
import { adminSections } from "../adminConstants";

export default function AdminTopbar({
  activeSection,
  onMenuOpen,
  onRefresh,
  onSearchChange,
  search,
}) {
  const section = adminSections.find((item) => item.id === activeSection);

  return (
    <header className="sticky top-0 z-20 border-b border-[#EADBD3] bg-white/95 backdrop-blur">
      <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-[#EADBD3] p-2 text-[#741B5D] lg:hidden"
            onClick={onMenuOpen}
          >
            <FiMenu aria-hidden="true" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#F26B5E]">
              {section?.label || "Dashboard"}
            </p>
            <h1 className="text-2xl font-black tracking-tight">
              Admin dashboard
            </h1>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <FiSearch
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#746A71]"
            />
            <input
              className="w-full rounded-lg border border-[#EADBD3] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#741B5D] md:w-80"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search current section"
              value={search}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#741B5D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#F26B5E]"
            onClick={onRefresh}
          >
            <FiRefreshCw aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
