import { FiRefreshCw } from "react-icons/fi";
import { roleLabels } from "../adminConstants";
import { formatDateTime } from "../adminUtils";
import {
  ActionButton,
  ErrorText,
  InfoRow,
  Panel,
  PanelHeader,
  TableHeader,
} from "../components/ui";

export default function SystemPage({ admin, health, loading, onRefresh, status }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel>
        <TableHeader
          action={
            <ActionButton
              icon={<FiRefreshCw />}
              label={loading ? "Checking" : "Refresh"}
              onClick={onRefresh}
            />
          }
          eyebrow="Health"
          subtitle="Current backend and database status."
          title="System status"
        />
        {status ? <ErrorText message={status} /> : null}
        <div className="mt-4 grid gap-3">
          <InfoRow label="API" value={health?.status || "Unchecked"} />
          <InfoRow label="Database" value={health?.database || "Unchecked"} />
          <InfoRow
            label="Uptime"
            value={
              health?.uptime ? `${Math.round(health.uptime / 60)} min` : "N/A"
            }
          />
          <InfoRow label="Last checked" value={formatDateTime(health?.timestamp)} />
        </div>
      </Panel>
      <Panel>
        <PanelHeader
          eyebrow="Access"
          subtitle="Signed-in admin account for this session."
          title="Admin session"
        />
        <div className="mt-4 grid gap-3">
          <InfoRow label="Name" value={admin.name} />
          <InfoRow label="Email" value={admin.email || "N/A"} />
          <InfoRow label="Phone" value={admin.phone || "N/A"} />
          <InfoRow label="Role" value={roleLabels[admin.role] || admin.role} />
        </div>
      </Panel>
    </div>
  );
}
