import { useId } from "react";

const legalLinks = [
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/user-agreement", label: "User Agreement" },
];

const getLegalSeparator = (index) => {
  if (index === legalLinks.length - 2) {
    return ", and ";
  }

  if (index < legalLinks.length - 1) {
    return ", ";
  }

  return "";
};

const LegalConsentCheckbox = ({ checked, name, onChange }) => {
  const inputId = useId();

  return (
    <label
      className="flex gap-3 border border-[#F2D3BD] bg-white px-4 py-3 text-sm leading-6 text-stone-700 md:col-span-2"
      htmlFor={inputId}
    >
      <input
        checked={checked}
        className="mt-1 h-4 w-4 shrink-0 accent-[#741B5D]"
        id={inputId}
        name={name}
        onChange={onChange}
        required
        type="checkbox"
      />
      <span>
        I accept Vuta&apos;s{" "}
        {legalLinks.map((link, index) => (
          <span key={link.href}>
            <a
              className="font-bold text-[#741B5D] underline-offset-4 hover:text-[#F26B5E] hover:underline"
              href={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
            {getLegalSeparator(index)}
          </span>
        ))}
        . I understand this acceptance will be stored with my submitted email.
      </span>
    </label>
  );
};

export default LegalConsentCheckbox;
