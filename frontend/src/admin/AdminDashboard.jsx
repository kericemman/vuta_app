import { useEffect, useState } from "react";
import { getActiveAdminSection } from "./adminUtils";
import AdminSidebar from "./components/AdminSidebar";
import AdminTopbar from "./components/AdminTopbar";
import { useAdminData } from "./hooks/useAdminData";
import AdCardsPage from "./pages/AdCardsPage";
import AdminLogin from "./pages/AdminLogin";
import BookingsPage from "./pages/BookingsPage";
import DashboardPage from "./pages/DashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import PartnershipsPage from "./pages/PartnershipsPage";
import ProvidersPage from "./pages/ProvidersPage";
import ServicesPage from "./pages/ServicesPage";
import SystemPage from "./pages/SystemPage";
import UpdatesPage from "./pages/UpdatesPage";
import UsersPage from "./pages/UsersPage";
import WaitlistPage from "./pages/WaitlistPage";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState(getActiveAdminSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const admin = useAdminData();
  const { refreshAll, refreshHealth } = admin.actions;

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  useEffect(() => {
    if (admin.session?.accessToken) {
      refreshAll();
    }
  }, [admin.session?.accessToken, refreshAll]);

  useEffect(() => {
    const onRouteChange = () => setActiveSection(getActiveAdminSection());

    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  const handleLoginSuccess = (session) => {
    admin.actions.setAdminLoginSession(session);
    window.history.replaceState({}, "", "/admin");
    setActiveSection("overview");
  };

  const navigate = (section) => {
    window.history.pushState({}, "", section.path);
    setActiveSection(section.id);
    setSidebarOpen(false);
  };

  if (!admin.session) {
    return (
      <AdminLogin
        health={admin.state.health}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F3] text-[#211A20]">
      <div className="flex min-h-screen">
        <AdminSidebar
          activeSection={activeSection}
          admin={admin.session.user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={admin.actions.clearAdminSession}
          onNavigate={navigate}
        />

        {sidebarOpen ? (
          <button
            aria-label="Close admin menu"
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <section className="min-w-0 flex-1 lg:pl-72">
          <AdminTopbar
            activeSection={activeSection}
            onMenuOpen={() => setSidebarOpen(true)}
            onRefresh={admin.actions.refreshAll}
            onSearchChange={admin.setters.setSearch}
            search={admin.filters.search}
          />

          <div className="px-5 py-5">
            {activeSection === "overview" ? (
              <DashboardPage
                adCardStats={admin.stats.adCardStats}
                feedbackStats={admin.stats.feedbackStats}
                health={admin.state.health}
                partnershipStats={admin.stats.partnershipStats}
                providerStats={admin.stats.providerStats}
                serviceStats={admin.stats.serviceStats}
                updateStats={admin.stats.updateStats}
                userStats={admin.stats.userStats}
                waitlistStats={admin.stats.waitlistStats}
              />
            ) : null}

            {activeSection === "waitlist" ? (
              <WaitlistPage
                entries={admin.state.waitlist}
                filter={admin.filters.waitlistFilter}
                loading={admin.loading.waitlist}
                onDelete={admin.actions.handleDeleteWaitlistEntry}
                onExport={admin.actions.exportWaitlistCsv}
                onFilterChange={admin.setters.setWaitlistFilter}
                onRefresh={admin.actions.refreshWaitlist}
                status={admin.status.waitlist}
              />
            ) : null}

            {activeSection === "partnerships" ? (
              <PartnershipsPage
                loading={admin.loading.partnerships}
                onDelete={admin.actions.handleDeletePartnershipLead}
                onExport={admin.actions.exportPartnershipsCsv}
                onNotesChange={admin.actions.handlePartnershipNotesChange}
                onRefresh={admin.actions.refreshPartnerships}
                onStatusChange={admin.actions.handlePartnershipStatusChange}
                onStatusFilterChange={admin.setters.setPartnershipStatusFilter}
                onTypeFilterChange={admin.setters.setPartnershipTypeFilter}
                partnerships={admin.state.partnerships}
                status={admin.status.partnerships}
                statusFilter={admin.filters.partnershipStatusFilter}
                typeFilter={admin.filters.partnershipTypeFilter}
              />
            ) : null}

            {activeSection === "users" ? (
              <UsersPage
                filter={admin.filters.userRoleFilter}
                loading={admin.loading.users}
                onFilterChange={admin.setters.setUserRoleFilter}
                onRefresh={admin.actions.refreshMobileUsers}
                onStatusChange={admin.actions.handleUserStatusChange}
                status={admin.status.users}
                users={admin.state.users}
              />
            ) : null}

            {activeSection === "feedback" ? (
              <FeedbackPage
                feedback={admin.state.feedback}
                loading={admin.loading.feedback}
                onDelete={admin.actions.handleDeleteFeedback}
                onNotesChange={admin.actions.handleFeedbackNotesChange}
                onRefresh={admin.actions.refreshFeedback}
                onRoleFilterChange={admin.setters.setFeedbackRoleFilter}
                onStatusChange={admin.actions.handleFeedbackStatusChange}
                onStatusFilterChange={admin.setters.setFeedbackStatusFilter}
                onTopicFilterChange={admin.setters.setFeedbackTopicFilter}
                roleFilter={admin.filters.feedbackRoleFilter}
                stats={admin.stats.feedbackStats}
                status={admin.status.feedback}
                statusFilter={admin.filters.feedbackStatusFilter}
                topicFilter={admin.filters.feedbackTopicFilter}
              />
            ) : null}

            {activeSection === "providers" ? (
              <ProvidersPage
                filter={admin.filters.providerStatusFilter}
                loading={admin.loading.providers}
                onFilterChange={admin.setters.setProviderStatusFilter}
                onBusinessNameChangeReview={
                  admin.actions.handleBusinessNameChangeReview
                }
                onRefresh={admin.actions.refreshProviders}
                onVerificationChange={admin.actions.handleProviderVerification}
                providers={admin.state.providers}
                stats={admin.stats.providerStats}
                status={admin.status.providers}
              />
            ) : null}

            {activeSection === "services" ? (
              <ServicesPage
                filter={admin.filters.serviceStatusFilter}
                loading={admin.loading.services}
                onFilterChange={admin.setters.setServiceStatusFilter}
                onRefresh={admin.actions.refreshServices}
                onStatusChange={admin.actions.handleServiceStatusChange}
                services={admin.state.services}
                status={admin.status.services}
              />
            ) : null}

            {activeSection === "adCards" ? (
              <AdCardsPage
                adCards={admin.state.adCards}
                filter={admin.filters.adCardPlacementFilter}
                loading={admin.loading.adCards}
                onDelete={admin.actions.handleDeleteAdCard}
                onFilterChange={admin.setters.setAdCardPlacementFilter}
                onRefresh={admin.actions.refreshAdCards}
                onSubmit={admin.actions.handleAdCardSubmit}
                onToggleActive={admin.actions.handleAdCardActiveToggle}
                status={admin.status.adCards}
              />
            ) : null}

            {activeSection === "bookings" ? (
              <BookingsPage
                bookings={admin.state.bookings}
                loading={admin.loading.bookings}
                onRefresh={admin.actions.refreshBookings}
                onStatusChange={admin.actions.handleBookingStatusChange}
                status={admin.status.bookings}
              />
            ) : null}

            {activeSection === "updates" ? (
              <UpdatesPage
                audienceFilter={admin.filters.updateAudienceFilter}
                imageUploading={admin.loading.updateImage}
                loading={admin.loading.updates}
                onAudienceFilterChange={admin.setters.setUpdateAudienceFilter}
                onDelete={admin.actions.handleDeleteAppUpdate}
                onRefresh={admin.actions.refreshAppUpdates}
                onStatusChange={admin.actions.handleAppUpdateStatusChange}
                onStatusFilterChange={admin.setters.setUpdateStatusFilter}
                onSubmit={admin.actions.handleAppUpdateSubmit}
                onUploadImage={admin.actions.handleUploadAppUpdateImage}
                status={admin.status.updates}
                statusFilter={admin.filters.updateStatusFilter}
                updates={admin.state.appUpdates}
              />
            ) : null}

            {activeSection === "system" ? (
              <SystemPage
                admin={admin.session.user}
                health={admin.state.health}
                loading={admin.loading.health}
                onRefresh={admin.actions.refreshHealth}
                status={admin.status.health}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
