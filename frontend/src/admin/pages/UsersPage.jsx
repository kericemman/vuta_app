import { FiRefreshCw } from "react-icons/fi";
import { roleLabels } from "../adminConstants";
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

export default function UsersPage({
  filter,
  loading,
  onFilterChange,
  onRefresh,
  onStatusChange,
  status,
  users,
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
              <option value="">All roles</option>
              <option value="client">Clients</option>
              <option value="beauty_professional">Professionals</option>
              <option value="beauty_business">Businesses</option>
              <option value="admin">Admins</option>
            </select>
            <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
          </div>
        }
        eyebrow="Mobile app"
        subtitle="Read and manage registered mobile accounts."
        title="User management"
      />
      {status ? <ErrorText message={status} /> : null}
      <DataTable loading={loading}>
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">User</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-b border-[#F3E8E1]" key={user.id}>
                <td className="py-3 pr-4">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-xs text-[#746A71]">
                    {user.email || user.phone}
                  </p>
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {roleLabels[user.role] || user.role}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {[user.area, user.city, user.country].filter(Boolean).join(", ") ||
                    "N/A"}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusPill
                      label={user.isActive ? "Active" : "Inactive"}
                      tone={user.isActive ? "success" : "danger"}
                    />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <SmallButton
                      label={user.isActive ? "Deactivate" : "Activate"}
                      onClick={() => onStatusChange(user, { isActive: !user.isActive })}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length ? (
          <EmptyState message="No mobile users loaded for this view." />
        ) : null}
      </DataTable>
    </Panel>
  );
}
