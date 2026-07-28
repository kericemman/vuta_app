import { FiRefreshCw } from "react-icons/fi";
import { formatMoney } from "../adminUtils";
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

export default function ServicesPage({
  filter,
  loading,
  onFilterChange,
  onRefresh,
  onStatusChange,
  services,
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
              <option value="">All services</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />
          </div>
        }
        eyebrow="Marketplace"
        subtitle="Read service catalogue and activate or deactivate listings."
        title="Service management"
      />
      {status ? <ErrorText message={status} /> : null}
      <DataTable loading={loading}>
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Provider</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr className="border-b border-[#F3E8E1]" key={service._id}>
                <td className="py-3 pr-4">
                  <p className="font-bold">{service.name}</p>
                  <p className="text-xs text-[#746A71]">{service.category}</p>
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {service.provider?.businessName ||
                    service.provider?.user?.name ||
                    "N/A"}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {formatMoney(service.price, service.currency)}
                </td>
                <td className="py-3 pr-4">
                  <StatusPill
                    label={service.isActive ? "Active" : "Inactive"}
                    tone={service.isActive ? "success" : "danger"}
                  />
                </td>
                <td className="py-3 pr-4">
                  <SmallButton
                    label={service.isActive ? "Deactivate" : "Activate"}
                    onClick={() => onStatusChange(service)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!services.length ? (
          <EmptyState message="No services match this view." />
        ) : null}
      </DataTable>
    </Panel>
  );
}
