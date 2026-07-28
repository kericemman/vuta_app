import { FiDownload, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { waitlistTypeLabels } from "../adminConstants";
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

export default function WaitlistPage({
  entries,
  filter,
  loading,
  onDelete,
  onExport,
  onFilterChange,
  onRefresh,
  status,
}) {
  return (
    <Panel>
      <TableHeader
        action={
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              onChange={(event) => onFilterChange(event.target.value)}
              value={filter}
            >
              <option value="all">All leads</option>
              <option value="client">Clients</option>
              <option value="beauty_professional">Professionals</option>
              <option value="beauty_business">Businesses</option>
            </select>
            <ActionButton icon={<FiDownload />} label="Export" onClick={onExport} />
            <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
          </div>
        }
        eyebrow="Website"
        subtitle="Read, filter, export, and delete public website waitlist leads."
        title="Waitlist management"
      />
      {status ? <ErrorText message={status} /> : null}
      <DataTable loading={loading}>
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">Lead</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Joined</th>
              <th className="py-3 pr-4">Consent</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr className="border-b border-[#F3E8E1]" key={entry._id}>
                <td className="py-3 pr-4">
                  <p className="font-bold">{entry.name}</p>
                  <p className="text-xs text-[#746A71]">
                    {entry.email || entry.phone}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <StatusPill
                    label={waitlistTypeLabels[entry.userType] || entry.userType}
                    tone="neutral"
                  />
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {entry.location}, {entry.country}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {entry.serviceOffered || "N/A"}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {formatDate(entry.createdAt)}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {entry.legalConsent?.acceptedAt ? (
                    <>
                      <p className="text-xs font-bold text-[#211A20]">Accepted</p>
                      <p className="text-xs">
                        {formatDate(entry.legalConsent.acceptedAt)}
                      </p>
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="py-3 pr-4">
                  <IconButton
                    icon={<FiTrash2 />}
                    label="Delete"
                    onClick={() => onDelete(entry)}
                    tone="danger"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries.length ? (
          <EmptyState message="No waitlist entries match this view." />
        ) : null}
      </DataTable>
    </Panel>
  );
}
