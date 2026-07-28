import { FiLogOut, FiShield, FiX } from "react-icons/fi";
import { adminSections } from "../adminConstants";

export default function AdminSidebar({
  activeSection,
  admin,
  isOpen,
  onClose,
  onLogout,
  onNavigate,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 overflow-hidden border-r border-[#EADBD3] bg-white transition lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#EADBD3] px-5 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-[#741B5D]">
              <FiShield aria-hidden="true" />
              Vuta Admin
            </div>
            <p className="mt-1 text-xs text-[#746A71]">Secure operations</p>
          </div>
          <button
            className="rounded-lg p-2 text-[#741B5D] lg:hidden"
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition ${
                  isActive
                    ? "bg-[#741B5D] text-white"
                    : "text-[#746A71] hover:bg-[#FFF1EA] hover:text-[#741B5D]"
                }`}
                key={section.id}
                onClick={() => onNavigate(section)}
              >
                <Icon aria-hidden="true" />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#EADBD3] p-4">
          <p className="text-sm font-bold text-[#211A20]">{admin.name}</p>
          <p className="mt-1 truncate text-xs text-[#746A71]">
            {admin.email || admin.phone}
          </p>
          <button
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#EADBD3] px-4 py-2 text-sm font-bold text-[#741B5D] transition hover:bg-[#FFF1EA]"
            onClick={onLogout}
          >
            <FiLogOut aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
