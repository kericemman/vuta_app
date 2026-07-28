import {
  FiBriefcase,
  FiFileText,
  FiGlobe,
  FiImage,
  FiLayers,
  FiLink,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import { InfoRow, MetricCard, Panel, PanelHeader } from "../components/ui";

export default function DashboardPage({
  adCardStats,
  feedbackStats,
  health,
  partnershipStats,
  providerStats,
  serviceStats,
  updateStats,
  userStats,
  waitlistStats,
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          detail={`${waitlistStats.countries} countries`}
          icon={<FiGlobe />}
          label="Waitlist leads"
          value={waitlistStats.total}
        />
        <MetricCard
          detail={`${partnershipStats.new} new`}
          icon={<FiLink />}
          label="Partners"
          value={partnershipStats.total}
        />
        <MetricCard
          detail={`${userStats.active} active`}
          icon={<FiUsers />}
          label="Mobile users"
          value={userStats.total}
        />
        <MetricCard
          detail={`${feedbackStats.new} new`}
          icon={<FiMessageSquare />}
          label="Feedback"
          value={feedbackStats.total}
        />
        <MetricCard
          detail={`${providerStats.pending} pending review`}
          icon={<FiBriefcase />}
          label="Providers"
          value={providerStats.total}
        />
        <MetricCard
          detail={`${serviceStats.inactive} inactive`}
          icon={<FiLayers />}
          label="Services"
          value={serviceStats.total}
        />
        <MetricCard
          detail={`${adCardStats.active} active`}
          icon={<FiImage />}
          label="Ad cards"
          value={adCardStats.total}
        />
        <MetricCard
          detail={`${updateStats.published} published`}
          icon={<FiFileText />}
          label="Updates"
          value={updateStats.total}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Demand"
            title="Waitlist split"
            subtitle="Website leads grouped by account type."
          />
          <div className="mt-4 grid gap-3">
            <InfoRow label="Clients" value={waitlistStats.clients} />
            <InfoRow
              label="Professionals"
              value={waitlistStats.professionals}
            />
            <InfoRow label="Businesses" value={waitlistStats.businesses} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader
            eyebrow="Platform"
            title="Operational health"
            subtitle="Backend and database signal."
          />
          <div className="mt-4 grid gap-3">
            <InfoRow label="API" value={health?.status || "Unchecked"} />
            <InfoRow
              label="Database"
              value={health?.database || "Unchecked"}
            />
            <InfoRow
              label="Uptime"
              value={
                health?.uptime ? `${Math.round(health.uptime / 60)} min` : "N/A"
              }
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
