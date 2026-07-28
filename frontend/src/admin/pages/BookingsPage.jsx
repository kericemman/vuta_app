import { FiRefreshCw } from "react-icons/fi";
import { bookingStatuses } from "../adminConstants";
import { formatDate, formatMoney } from "../adminUtils";
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorText,
  Panel,
  TableHeader,
} from "../components/ui";

export default function BookingsPage({
  bookings,
  loading,
  onRefresh,
  onStatusChange,
  status,
}) {
  return (
    <Panel>
      <TableHeader
        action={<ActionButton icon={<FiRefreshCw />} label="Refresh" onClick={onRefresh} />}
        eyebrow="Operations"
        subtitle="Read bookings and update booking status when support needs to intervene."
        title="Booking management"
      />
      {status ? <ErrorText message={status} /> : null}
      <DataTable loading={loading}>
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EADBD3] text-xs uppercase tracking-wide text-[#746A71]">
              <th className="py-3 pr-4">Client</th>
              <th className="py-3 pr-4">Provider</th>
              <th className="py-3 pr-4">Service</th>
              <th className="py-3 pr-4">Schedule</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr className="border-b border-[#F3E8E1]" key={booking._id}>
                <td className="py-3 pr-4">
                  <p className="font-bold">{booking.client?.name || "N/A"}</p>
                  <p className="text-xs text-[#746A71]">{booking.client?.phone}</p>
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {booking.provider?.businessName ||
                    booking.provider?.user?.name ||
                    "N/A"}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {booking.service?.name || "N/A"}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {formatDate(booking.bookingDate)} at {booking.bookingTime}
                </td>
                <td className="py-3 pr-4 text-[#746A71]">
                  {formatMoney(booking.price, booking.currency)}
                </td>
                <td className="py-3 pr-4">
                  <select
                    className="rounded-lg border border-[#EADBD3] px-3 py-2 text-sm outline-none focus:border-[#741B5D]"
                    onChange={(event) => onStatusChange(booking, event.target.value)}
                    value={booking.status}
                  >
                    {bookingStatuses.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length ? (
          <EmptyState message="No bookings match this view." />
        ) : null}
      </DataTable>
    </Panel>
  );
}
