import { useState } from "react";
import {
  FiCheck,
  FiClock,
  FiEye,
  FiRefreshCw,
  FiThumbsDown,
  FiThumbsUp,
  FiX,
} from "react-icons/fi";
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorText,
  Panel,
  SmallButton,
  StatusPill,
  TableHeader,
} from "../components/ui";

const providerStatusTone = (status) => {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "premium";
};

const accountTypeLabel = (accountType) =>
  accountType === "business" ? "Business" : "Professional";

const serviceModeLabels = {
  both: "Business location and home service",
  home_service: "Home service",
  provider_location: "Business location",
};

const providerStatusCategories = [
  {
    description: "All submitted profiles",
    icon: FiEye,
    id: "",
    label: "All",
    statKey: "total",
    tone: "default",
  },
  {
    description: "Needs admin review",
    icon: FiClock,
    id: "pending",
    label: "Pending",
    statKey: "pending",
    tone: "premium",
  },
  {
    description: "Visible in marketplace",
    icon: FiCheck,
    id: "approved",
    label: "Approved",
    statKey: "approved",
    tone: "success",
  },
  {
    description: "Needs correction",
    icon: FiX,
    id: "rejected",
    label: "Rejected",
    statKey: "rejected",
    tone: "danger",
  },
];

export default function ProvidersPage({
  filter,
  loading,
  onBusinessNameChangeReview,
  onFilterChange,
  onRefresh,
  onVerificationChange,
  providers,
  stats = {},
  status,
}) {
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleModalVerification = async (verificationStatus) => {
    if (!selectedProvider) return;

    await onVerificationChange(selectedProvider, verificationStatus);
    setSelectedProvider(null);
  };

  return (
    <Panel>
      <TableHeader
        action={
          <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
        }
        eyebrow="Marketplace"
        subtitle="Read provider profiles and manage verification state."
        title="Provider management"
      />
      {status ? <ErrorText message={status} /> : null}
      <ProviderStatusCategories
        activeStatus={filter}
        onChange={onFilterChange}
        stats={stats}
      />
      <DataTable loading={loading}>
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">Provider</th>
              <th className="py-3 pr-4">Owner</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Categories</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Name request</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => {
              const nameRequest = provider.businessNameChangeRequest;
              const hasPendingNameRequest = nameRequest?.status === "pending";

              return (
                <tr className="border-b border-[#F3E8E1]" key={provider._id}>
                  <td className="py-3 pr-4">
                    <p className="font-bold">
                      {provider.businessName || provider.user?.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-[#746A71]">
                      {accountTypeLabel(provider.accountType)}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-[#746A71]">
                    <p>{provider.user?.name || "N/A"}</p>
                    <p className="text-xs">
                      {provider.user?.phone || provider.user?.email}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-[#746A71]">
                    {[provider.area, provider.city, provider.country]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </td>
                  <td className="py-3 pr-4 text-[#746A71]">
                    {(provider.categories || []).join(", ") || "N/A"}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusPill
                      label={provider.verificationStatus}
                      tone={providerStatusTone(provider.verificationStatus)}
                    />
                  </td>
                  <td className="max-w-[280px] py-3 pr-4">
                    {hasPendingNameRequest ? (
                      <div className="rounded-lg border border-[#F4B942]/40 bg-[#F4B942]/10 p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-[#8A5B00]">
                          Pending change
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#211A20]">
                          {provider.businessName || "Current name"} →{" "}
                          {nameRequest.requestedName}
                        </p>
                        <p className="mt-1 line-clamp-3 text-xs text-[#746A71]">
                          {nameRequest.reason || "No reason provided."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <SmallButton
                            icon={<FiThumbsUp />}
                            label="Approve name"
                            onClick={() =>
                              onBusinessNameChangeReview(provider, "approved")
                            }
                          />
                          <SmallButton
                            icon={<FiThumbsDown />}
                            label="Reject name"
                            onClick={() =>
                              onBusinessNameChangeReview(provider, "rejected")
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[#746A71]">No request</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <ProviderActionButton
                        icon={<FiEye />}
                        label="View"
                        onClick={() => setSelectedProvider(provider)}
                      />
                      <ProviderActionButton
                        icon={<FiCheck />}
                        label="Approve"
                        onClick={() => onVerificationChange(provider, "approved")}
                        tone="success"
                      />
                      <ProviderActionButton
                        icon={<FiX />}
                        label="Reject"
                        onClick={() => onVerificationChange(provider, "rejected")}
                        tone="danger"
                      />
                      <ProviderActionButton
                        icon={<FiClock />}
                        label="Pending"
                        onClick={() => onVerificationChange(provider, "pending")}
                        tone="premium"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!providers.length ? (
          <EmptyState message="No providers match this view." />
        ) : null}
      </DataTable>
      {selectedProvider ? (
        <ProviderDetailsModal
          onClose={() => setSelectedProvider(null)}
          onVerificationChange={handleModalVerification}
          provider={selectedProvider}
        />
      ) : null}
    </Panel>
  );
}

function ProviderStatusCategories({ activeStatus, onChange, stats }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {providerStatusCategories.map((category) => {
        const Icon = category.icon;
        const active = activeStatus === category.id;

        return (
          <button
            className={`rounded-lg border p-4 text-left transition ${
              active
                ? getActiveCategoryClass(category.tone)
                : "border-[#EADBD3] bg-white hover:bg-[#FFF8F3]"
            }`}
            key={category.id || "all"}
            onClick={() => onChange(category.id)}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                  active ? "bg-white/25" : "bg-[#FFF1EA] text-[#741B5D]"
                }`}
              >
                <Icon />
              </span>
              <span className="text-2xl font-black">
                {stats[category.statKey] || 0}
              </span>
            </div>
            <p className="mt-3 text-sm font-black">{category.label}</p>
            <p
              className={`mt-1 text-xs font-bold ${
                active ? "text-current opacity-80" : "text-[#746A71]"
              }`}
            >
              {category.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function getActiveCategoryClass(tone) {
  const tones = {
    danger: "border-red-200 bg-red-50 text-red-700",
    default: "border-[#741B5D] bg-[#741B5D] text-white",
    premium: "border-[#F4B942] bg-[#F4B942] text-[#211A20]",
    success: "border-green-200 bg-green-50 text-green-700",
  };

  return tones[tone] || tones.default;
}

function ProviderDetailsModal({ onClose, onVerificationChange, provider }) {
  const nameRequest = provider.businessNameChangeRequest;
  const availability = provider.availability || [];
  const portfolio = provider.portfolio || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211A20]/45 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-[#F3E8E1] pb-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            {provider.user?.profileImage ? (
              <img
                alt=""
                className="h-14 w-14 rounded-lg object-cover"
                src={provider.user.profileImage}
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FFF1EA] text-lg font-black text-[#741B5D]">
                {getInitials(provider.businessName || provider.user?.name)}
              </div>
            )}
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#F26B5E]">
                Submitted {accountTypeLabel(provider.accountType)} Profile
              </p>
              <h3 className="mt-1 text-2xl font-black">
                {provider.businessName || provider.user?.name || "Unnamed profile"}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusPill
                  label={provider.verificationStatus}
                  tone={providerStatusTone(provider.verificationStatus)}
                />
                <StatusPill
                  label={provider.isActive ? "Active" : "Inactive"}
                  tone={provider.isActive ? "success" : "danger"}
                />
              </div>
            </div>
          </div>
          <button
            aria-label="Close profile details"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#EADBD3] text-[#741B5D] transition hover:bg-[#FFF1EA]"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5">
            <ReviewSection title="Account details">
              <DetailGrid>
                <DetailItem label="Profile type" value={accountTypeLabel(provider.accountType)} />
                <DetailItem
                  label="Business/profile name"
                  value={provider.businessName || "Not submitted"}
                />
                <DetailItem label="Owner name" value={provider.user?.name} />
                <DetailItem label="Owner email" value={provider.user?.email} />
                <DetailItem label="Owner phone" value={provider.user?.phone} />
                <DetailItem
                  label="Service mode"
                  value={serviceModeLabels[provider.serviceMode] || provider.serviceMode}
                />
                <DetailItem label="Submitted" value={formatDate(provider.createdAt)} />
                <DetailItem label="Last updated" value={formatDate(provider.updatedAt)} />
              </DetailGrid>
            </ReviewSection>

            <ReviewSection title="Location">
              <DetailGrid>
                <DetailItem label="Country" value={provider.country} />
                <DetailItem label="City" value={provider.city} />
                <DetailItem label="Area" value={provider.area} />
                <DetailItem
                  label="Coordinates"
                  value={formatCoordinates(provider.coordinates)}
                />
              </DetailGrid>
            </ReviewSection>

            <ReviewSection title="Bio">
              <p className="whitespace-pre-wrap text-sm leading-6 text-[#746A71]">
                {provider.bio || "No bio submitted."}
              </p>
            </ReviewSection>
          </div>

          <div className="grid gap-5">
            <ReviewSection title="Categories">
              {provider.categories?.length ? (
                <div className="flex flex-wrap gap-2">
                  {provider.categories.map((category) => (
                    <span
                      className="rounded-lg border border-[#EADBD3] bg-[#FFF8F3] px-3 py-2 text-xs font-bold text-[#741B5D]"
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#746A71]">No categories submitted.</p>
              )}
            </ReviewSection>

            <ReviewSection title="Availability">
              {availability.length ? (
                <div className="grid gap-2">
                  {availability.map((slot) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#F3E8E1] px-3 py-2 text-sm"
                      key={slot.day}
                    >
                      <span className="font-bold">{slot.day}</span>
                      <span className="text-[#746A71]">
                        {slot.isAvailable
                          ? `${slot.opensAt || "--"} - ${slot.closesAt || "--"}`
                          : "Unavailable"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#746A71]">No availability submitted.</p>
              )}
            </ReviewSection>

            <ReviewSection title="Portfolio">
              {portfolio.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {portfolio.map((image) => (
                    <a
                      className="group overflow-hidden rounded-lg border border-[#EADBD3] bg-[#FFF8F3]"
                      href={image.url}
                      key={image.publicId || image.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={image.caption || "Portfolio work"}
                        className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                        src={image.url}
                      />
                      {image.caption ? (
                        <p className="truncate px-2 py-2 text-xs font-bold text-[#746A71]">
                          {image.caption}
                        </p>
                      ) : null}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#746A71]">No portfolio uploaded.</p>
              )}
            </ReviewSection>
          </div>
        </div>

        {nameRequest ? (
          <ReviewSection className="mt-5" title="Business name change request">
            <DetailGrid>
              <DetailItem label="Requested name" value={nameRequest.requestedName} />
              <DetailItem label="Status" value={nameRequest.status} />
              <DetailItem label="Requested at" value={formatDate(nameRequest.requestedAt)} />
              <DetailItem label="Reason" value={nameRequest.reason} />
            </DetailGrid>
          </ReviewSection>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 border-t border-[#F3E8E1] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[#746A71]">
            Review the submitted details before approving this marketplace profile.
          </p>
          <div className="flex flex-wrap gap-2">
            <SmallButton
              icon={<FiCheck />}
              label="Approve"
              onClick={() => onVerificationChange("approved")}
            />
            <SmallButton
              icon={<FiX />}
              label="Reject"
              onClick={() => onVerificationChange("rejected")}
            />
            <SmallButton
              icon={<FiClock />}
              label="Keep pending"
              onClick={() => onVerificationChange("pending")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderActionButton({ icon, label, onClick, tone = "default" }) {
  const tones = {
    danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    default: "border-[#EADBD3] bg-white text-[#741B5D] hover:bg-[#FFF1EA]",
    premium: "border-[#F4B942]/50 bg-[#F4B942]/10 text-[#8A5B00] hover:bg-[#F4B942]/20",
    success: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
  };

  return (
    <button
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-base transition ${
        tones[tone] || tones.default
      }`}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  );
}

function ReviewSection({ children, className = "", title }) {
  return (
    <section className={`rounded-lg border border-[#EADBD3] bg-white p-4 ${className}`}>
      <h4 className="text-sm font-black uppercase tracking-wide text-[#211A20]">
        {title}
      </h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DetailGrid({ children }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg bg-[#FFF8F3] p-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-[#746A71]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#211A20]">
        {value || "N/A"}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCoordinates(coordinates) {
  const values = coordinates?.coordinates;

  if (!Array.isArray(values) || values.length !== 2) {
    return "N/A";
  }

  return `${values[1]}, ${values[0]}`;
}

function getInitials(value = "Vuta") {
  return (
    value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "V"
  );
}
