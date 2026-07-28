import { FiDownload, FiEdit3, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import {
  partnershipStatusLabels,
  partnershipStatuses,
  partnershipTypeLabels,
  partnershipTypes,
} from "../adminConstants";
import { formatDate } from "../adminUtils";
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorText,
  IconButton,
  Panel,
  StatusPill,
  TableHeader,
} from "../components/ui";

const statusTone = (status) => {
  if (status === "qualified") return "success";
  if (status === "new") return "premium";
  if (status === "archived") return "danger";
  return "neutral";
};

export default function PartnershipsPage({
  loading,
  onDelete,
  onExport,
  onNotesChange,
  onRefresh,
  onStatusChange,
  onStatusFilterChange,
  onTypeFilterChange,
  partnerships,
  status,
  statusFilter,
  typeFilter,
}) {
  return (
    <Panel>
      <TableHeader
        action={
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              onChange={(event) => onStatusFilterChange(event.target.value)}
              value={statusFilter}
            >
              <option value="">All statuses</option>
              {partnershipStatuses.map((item) => (
                <option key={item} value={item}>
                  {partnershipStatusLabels[item]}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              onChange={(event) => onTypeFilterChange(event.target.value)}
              value={typeFilter}
            >
              <option value="">All partner types</option>
              {partnershipTypes.map((item) => (
                <option key={item} value={item}>
                  {partnershipTypeLabels[item]}
                </option>
              ))}
            </select>
            <ActionButton icon={<FiDownload />} label="Export" onClick={onExport} />
            <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
          </div>
        }
        eyebrow="Growth"
        subtitle="Review partnership requests from brands, academies, suppliers, creators, and investors."
        title="Partnership leads"
      />
      {status ? <ErrorText message={status} /> : null}
      <DataTable loading={loading}>
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">Partner</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Audience</th>
              <th className="py-3 pr-4">Message</th>
              <th className="py-3 pr-4">Submitted</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partnerships.map((lead) => (
              <tr className="border-b border-[#F3E8E1]" key={lead._id}>
                <td className="py-3 pr-4 align-top">
                  <p className="font-bold">{lead.organizationName}</p>
                  <p className="text-xs text-[#746A71]">{lead.contactName}</p>
                  <p className="text-xs text-[#746A71]">
                    {lead.email}
                    {lead.phone ? ` · ${lead.phone}` : ""}
                  </p>
                  {lead.website ? (
                    <a
                      className="mt-1 block text-xs font-bold text-[#741B5D] hover:text-[#F26B5E]"
                      href={lead.website}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Website
                    </a>
                  ) : null}
                </td>
                <td className="py-3 pr-4 align-top">
                  <StatusPill
                    label={
                      partnershipTypeLabels[lead.partnershipType] ||
                      lead.partnershipType
                    }
                    tone="neutral"
                  />
                </td>
                <td className="py-3 pr-4 align-top">
                  <div className="grid gap-2">
                    <StatusPill
                      label={partnershipStatusLabels[lead.status] || lead.status}
                      tone={statusTone(lead.status)}
                    />
                    <select
                      className="rounded-lg border border-[#EADBD3] px-2 py-1 text-xs outline-none focus:border-[#741B5D]"
                      onChange={(event) => onStatusChange(lead, event.target.value)}
                      value={lead.status}
                    >
                      {partnershipStatuses.map((item) => (
                        <option key={item} value={item}>
                          {partnershipStatusLabels[item]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="py-3 pr-4 align-top text-[#746A71]">
                  {[lead.city, lead.country].filter(Boolean).join(", ")}
                </td>
                <td className="max-w-[180px] py-3 pr-4 align-top text-[#746A71]">
                  {lead.audience || "N/A"}
                </td>
                <td className="max-w-[260px] py-3 pr-4 align-top text-[#746A71]">
                  <p className="line-clamp-3">{lead.message}</p>
                  {lead.adminNotes ? (
                    <p className="mt-2 rounded-lg bg-[#FFF8F3] px-2 py-1 text-xs text-[#741B5D]">
                      Note: {lead.adminNotes}
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-4 align-top text-[#746A71]">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="py-3 pr-4 align-top">
                  <div className="flex gap-2">
                    <IconButton
                      icon={<FiEdit3 />}
                      label="Edit notes"
                      onClick={() => onNotesChange(lead)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      label="Delete"
                      onClick={() => onDelete(lead)}
                      tone="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!partnerships.length ? (
          <EmptyState message="No partnership leads match this view." />
        ) : null}
      </DataTable>
    </Panel>
  );
}
