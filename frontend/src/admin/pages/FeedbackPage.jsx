import {
  FiEdit3,
  FiMessageSquare,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import {
  feedbackStatusLabels,
  feedbackStatuses,
  feedbackTopicLabels,
  feedbackTopics,
  roleLabels,
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
  if (status === "new") return "premium";
  if (status === "planned") return "success";
  if (status === "archived") return "danger";
  return "neutral";
};

const roleFilterOptions = ["client", "beauty_professional", "beauty_business"];

export default function FeedbackPage({
  feedback,
  loading,
  onDelete,
  onNotesChange,
  onRefresh,
  onRoleFilterChange,
  onStatusChange,
  onStatusFilterChange,
  onTopicFilterChange,
  roleFilter,
  stats,
  status,
  statusFilter,
  topicFilter,
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
              {feedbackStatuses.map((item) => (
                <option key={item} value={item}>
                  {feedbackStatusLabels[item]}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              onChange={(event) => onRoleFilterChange(event.target.value)}
              value={roleFilter}
            >
              <option value="">All accounts</option>
              {roleFilterOptions.map((item) => (
                <option key={item} value={item}>
                  {roleLabels[item]}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
              onChange={(event) => onTopicFilterChange(event.target.value)}
              value={topicFilter}
            >
              <option value="">All topics</option>
              {feedbackTopics.map((item) => (
                <option key={item} value={item}>
                  {feedbackTopicLabels[item]}
                </option>
              ))}
            </select>
            <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
          </div>
        }
        eyebrow="Product"
        subtitle="Review feedback from clients, professionals, and businesses."
        title="App feedback"
      />
      {status ? <ErrorText message={status} /> : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FeedbackMetric label="Total" value={stats.total} />
        <FeedbackMetric label="New" tone="premium" value={stats.new} />
        <FeedbackMetric label="Reviewed" value={stats.reviewed} />
        <FeedbackMetric label="Planned" tone="success" value={stats.planned} />
      </div>

      <DataTable loading={loading}>
        <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">User</th>
              <th className="py-3 pr-4">Topic</th>
              <th className="py-3 pr-4">Rating</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Feedback</th>
              <th className="py-3 pr-4">Submitted</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr className="border-b border-[#F3E8E1]" key={item._id}>
                <td className="py-3 pr-4 align-top">
                  <p className="font-bold">{item.user?.name || "Unknown user"}</p>
                  <p className="text-xs text-[#746A71]">
                    {roleLabels[item.role] || item.role}
                  </p>
                  <p className="text-xs text-[#746A71]">
                    {item.user?.email || item.user?.phone || "No contact"}
                  </p>
                  {!item.contactConsent ? (
                    <p className="mt-1 text-xs font-bold text-[#B91C1C]">
                      No follow-up requested
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-4 align-top">
                  <StatusPill
                    label={feedbackTopicLabels[item.topic] || item.topic}
                    tone="neutral"
                  />
                </td>
                <td className="py-3 pr-4 align-top">
                  <span className="font-black text-[#741B5D]">
                    {item.rating ? `${item.rating}/5` : "N/A"}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top">
                  <div className="grid gap-2">
                    <StatusPill
                      label={feedbackStatusLabels[item.status] || item.status}
                      tone={statusTone(item.status)}
                    />
                    <select
                      className="rounded-lg border border-[#EADBD3] px-2 py-1 text-xs outline-none focus:border-[#741B5D]"
                      onChange={(event) => onStatusChange(item, event.target.value)}
                      value={item.status}
                    >
                      {feedbackStatuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {feedbackStatusLabels[statusOption]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="max-w-[360px] py-3 pr-4 align-top text-[#746A71]">
                  <p className="whitespace-pre-wrap leading-5">{item.message}</p>
                  {item.adminNotes ? (
                    <p className="mt-2 rounded-lg bg-[#FFF8F3] px-2 py-1 text-xs text-[#741B5D]">
                      Note: {item.adminNotes}
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-4 align-top text-[#746A71]">
                  {formatDate(item.createdAt)}
                </td>
                <td className="py-3 pr-4 align-top">
                  <div className="flex gap-2">
                    <IconButton
                      icon={<FiEdit3 />}
                      label="Edit notes"
                      onClick={() => onNotesChange(item)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      label="Delete"
                      onClick={() => onDelete(item)}
                      tone="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!feedback.length ? (
          <EmptyState message="No feedback matches this view." />
        ) : null}
      </DataTable>
    </Panel>
  );
}

function FeedbackMetric({ label, tone = "neutral", value }) {
  const tones = {
    neutral: "border-[#EADBD3] bg-white text-[#211A20]",
    premium: "border-[#F4B942]/40 bg-[#F4B942]/15 text-[#8A5B00]",
    success: "border-green-200 bg-green-50 text-green-700",
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.neutral}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black">{label}</p>
        <FiMessageSquare />
      </div>
      <p className="mt-2 text-3xl font-black">{value || 0}</p>
    </div>
  );
}
