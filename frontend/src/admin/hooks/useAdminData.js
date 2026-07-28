import { useCallback, useMemo, useState } from "react";
import {
  createAppUpdate,
  createAdCard,
  deleteAdCard,
  deleteAppUpdate,
  deleteFeedback,
  deletePartnershipLead,
  deleteWaitlistEntry,
  fetchAdminAdCards,
  fetchAdminBookings,
  fetchAdminFeedback,
  fetchAdminProviders,
  fetchAdminServices,
  fetchAdminUpdates,
  fetchApiHealth,
  fetchMobileUsers,
  fetchPartnershipLeads,
  fetchWaitlist,
  getAdminErrorMessage,
  reviewBusinessNameChange,
  updateBookingStatus,
  updateAdCard,
  updateAppUpdate,
  updateFeedback,
  updateMobileUserStatus,
  updatePartnershipLead,
  updateProviderVerification,
  updateServiceStatus,
  uploadAppUpdateImage,
} from "../adminApi";
import { ADMIN_SESSION_STORAGE } from "../adminConstants";
import { countBy, downloadCsv, includesSearch, loadStoredSession } from "../adminUtils";

export function useAdminData() {
  const [adminSession, setAdminSession] = useState(loadStoredSession);
  const [health, setHealth] = useState(null);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [partnershipLeads, setPartnershipLeads] = useState([]);
  const [mobileUsers, setMobileUsers] = useState([]);
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [adCards, setAdCards] = useState([]);
  const [appUpdates, setAppUpdates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [waitlistFilter, setWaitlistFilter] = useState("all");
  const [partnershipStatusFilter, setPartnershipStatusFilter] = useState("");
  const [partnershipTypeFilter, setPartnershipTypeFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [feedbackRoleFilter, setFeedbackRoleFilter] = useState("");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState("");
  const [feedbackTopicFilter, setFeedbackTopicFilter] = useState("");
  const [providerStatusFilter, setProviderStatusFilter] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("");
  const [adCardPlacementFilter, setAdCardPlacementFilter] = useState("");
  const [updateAudienceFilter, setUpdateAudienceFilter] = useState("");
  const [updateStatusFilter, setUpdateStatusFilter] = useState("");
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState({});

  const accessToken = adminSession?.accessToken;

  const setBusy = useCallback((key, value) => {
    setLoading((current) => ({ ...current, [key]: value }));
  }, []);

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE);
    localStorage.removeItem(ADMIN_SESSION_STORAGE);
    setAdminSession(null);
    setWaitlistEntries([]);
    setPartnershipLeads([]);
    setMobileUsers([]);
    setFeedbackEntries([]);
    setProviders([]);
    setServices([]);
    setAdCards([]);
    setAppUpdates([]);
    setBookings([]);
  }, []);

  const handleAdminError = useCallback(
    (key, error) => {
      if ([401, 403].includes(error.response?.status)) {
        clearAdminSession();
        return;
      }

      setStatus((current) => ({
        ...current,
        [key]: getAdminErrorMessage(error),
      }));
    },
    [clearAdminSession]
  );

  const setAdminLoginSession = useCallback((session) => {
    sessionStorage.setItem(ADMIN_SESSION_STORAGE, JSON.stringify(session));
    setAdminSession(session);
  }, []);

  const refreshHealth = useCallback(async () => {
    setBusy("health", true);
    setStatus((current) => ({ ...current, health: "" }));

    try {
      setHealth(await fetchApiHealth());
    } catch (error) {
      setStatus((current) => ({
        ...current,
        health: getAdminErrorMessage(error),
      }));
    } finally {
      setBusy("health", false);
    }
  }, [setBusy]);

  const refreshWaitlist = useCallback(async () => {
    if (!accessToken) return;

    setBusy("waitlist", true);
    setStatus((current) => ({ ...current, waitlist: "" }));

    try {
      const data = await fetchWaitlist(accessToken);
      setWaitlistEntries(data.data || []);
    } catch (error) {
      handleAdminError("waitlist", error);
    } finally {
      setBusy("waitlist", false);
    }
  }, [accessToken, handleAdminError, setBusy]);

  const refreshPartnerships = useCallback(async () => {
    if (!accessToken) return;

    setBusy("partnerships", true);
    setStatus((current) => ({ ...current, partnerships: "" }));

    try {
      const data = await fetchPartnershipLeads(accessToken, {
        partnershipType: partnershipTypeFilter || undefined,
        status: partnershipStatusFilter || undefined,
      });
      setPartnershipLeads(data.data || []);
    } catch (error) {
      handleAdminError("partnerships", error);
    } finally {
      setBusy("partnerships", false);
    }
  }, [
    accessToken,
    handleAdminError,
    partnershipStatusFilter,
    partnershipTypeFilter,
    setBusy,
  ]);

  const refreshMobileUsers = useCallback(async () => {
    if (!accessToken) return;

    setBusy("users", true);
    setStatus((current) => ({ ...current, users: "" }));

    try {
      const data = await fetchMobileUsers(accessToken, {
        role: userRoleFilter || undefined,
      });
      setMobileUsers(data.data || []);
    } catch (error) {
      handleAdminError("users", error);
    } finally {
      setBusy("users", false);
    }
  }, [accessToken, handleAdminError, setBusy, userRoleFilter]);

  const refreshFeedback = useCallback(async () => {
    if (!accessToken) return;

    setBusy("feedback", true);
    setStatus((current) => ({ ...current, feedback: "" }));

    try {
      const data = await fetchAdminFeedback(accessToken, {
        role: feedbackRoleFilter || undefined,
        status: feedbackStatusFilter || undefined,
        topic: feedbackTopicFilter || undefined,
      });
      setFeedbackEntries(data.data || []);
    } catch (error) {
      handleAdminError("feedback", error);
    } finally {
      setBusy("feedback", false);
    }
  }, [
    accessToken,
    feedbackRoleFilter,
    feedbackStatusFilter,
    feedbackTopicFilter,
    handleAdminError,
    setBusy,
  ]);

  const refreshProviders = useCallback(async () => {
    if (!accessToken) return;

    setBusy("providers", true);
    setStatus((current) => ({ ...current, providers: "" }));

    try {
      const data = await fetchAdminProviders(accessToken);
      setProviders(data.data || []);
    } catch (error) {
      handleAdminError("providers", error);
    } finally {
      setBusy("providers", false);
    }
  }, [accessToken, handleAdminError, setBusy]);

  const refreshServices = useCallback(async () => {
    if (!accessToken) return;

    setBusy("services", true);
    setStatus((current) => ({ ...current, services: "" }));

    try {
      const data = await fetchAdminServices(accessToken, {
        isActive: serviceStatusFilter || undefined,
      });
      setServices(data.data || []);
    } catch (error) {
      handleAdminError("services", error);
    } finally {
      setBusy("services", false);
    }
  }, [accessToken, handleAdminError, serviceStatusFilter, setBusy]);

  const refreshAdCards = useCallback(async () => {
    if (!accessToken) return;

    setBusy("adCards", true);
    setStatus((current) => ({ ...current, adCards: "" }));

    try {
      const data = await fetchAdminAdCards(accessToken, {
        placement: adCardPlacementFilter || undefined,
      });
      setAdCards(data.data || []);
    } catch (error) {
      handleAdminError("adCards", error);
    } finally {
      setBusy("adCards", false);
    }
  }, [accessToken, adCardPlacementFilter, handleAdminError, setBusy]);

  const refreshAppUpdates = useCallback(async () => {
    if (!accessToken) return;

    setBusy("updates", true);
    setStatus((current) => ({ ...current, updates: "" }));

    try {
      const data = await fetchAdminUpdates(accessToken, {
        audience: updateAudienceFilter || undefined,
        status: updateStatusFilter || undefined,
      });
      setAppUpdates(data.data || []);
    } catch (error) {
      handleAdminError("updates", error);
    } finally {
      setBusy("updates", false);
    }
  }, [
    accessToken,
    handleAdminError,
    setBusy,
    updateAudienceFilter,
    updateStatusFilter,
  ]);

  const refreshBookings = useCallback(async () => {
    if (!accessToken) return;

    setBusy("bookings", true);
    setStatus((current) => ({ ...current, bookings: "" }));

    try {
      const data = await fetchAdminBookings(accessToken);
      setBookings(data.data || []);
    } catch (error) {
      handleAdminError("bookings", error);
    } finally {
      setBusy("bookings", false);
    }
  }, [accessToken, handleAdminError, setBusy]);

  const refreshAll = useCallback(() => {
    refreshHealth();
    refreshWaitlist();
    refreshPartnerships();
    refreshMobileUsers();
    refreshFeedback();
    refreshProviders();
    refreshServices();
    refreshAdCards();
    refreshAppUpdates();
    refreshBookings();
  }, [
    refreshAdCards,
    refreshAppUpdates,
    refreshBookings,
    refreshFeedback,
    refreshHealth,
    refreshMobileUsers,
    refreshPartnerships,
    refreshProviders,
    refreshServices,
    refreshWaitlist,
  ]);

  const handleUserStatusChange = async (user, payload) => {
    if (!accessToken) return;

    try {
      const updatedUser = await updateMobileUserStatus(accessToken, user.id, payload);
      setMobileUsers((users) =>
        users.map((item) => (item.id === updatedUser.id ? updatedUser : item))
      );
    } catch (error) {
      handleAdminError("users", error);
    }
  };

  const handleFeedbackStatusChange = async (feedback, nextStatus) => {
    if (!accessToken) return;

    try {
      const updatedFeedback = await updateFeedback(accessToken, feedback._id, {
        status: nextStatus,
      });
      setFeedbackEntries((items) =>
        items.map((item) =>
          item._id === updatedFeedback._id ? updatedFeedback : item
        )
      );
    } catch (error) {
      handleAdminError("feedback", error);
    }
  };

  const handleFeedbackNotesChange = async (feedback) => {
    if (!accessToken) return;

    const adminNotes = window.prompt(
      "Add or update admin notes for this feedback.",
      feedback.adminNotes || ""
    );

    if (adminNotes === null) return;

    try {
      const updatedFeedback = await updateFeedback(accessToken, feedback._id, {
        adminNotes,
      });
      setFeedbackEntries((items) =>
        items.map((item) =>
          item._id === updatedFeedback._id ? updatedFeedback : item
        )
      );
    } catch (error) {
      handleAdminError("feedback", error);
    }
  };

  const handleDeleteFeedback = async (feedback) => {
    if (!accessToken) return;

    const confirmed = window.confirm("Delete this feedback?");
    if (!confirmed) return;

    try {
      await deleteFeedback(accessToken, feedback._id);
      setFeedbackEntries((items) =>
        items.filter((item) => item._id !== feedback._id)
      );
    } catch (error) {
      handleAdminError("feedback", error);
    }
  };

  const handleProviderVerification = async (provider, verificationStatus) => {
    if (!accessToken) return;

    try {
      const updatedProvider = await updateProviderVerification(
        accessToken,
        provider._id,
        verificationStatus
      );
      setProviders((items) =>
        items.map((item) => (item._id === updatedProvider._id ? updatedProvider : item))
      );
    } catch (error) {
      handleAdminError("providers", error);
    }
  };

  const handleBusinessNameChangeReview = async (provider, status) => {
    if (!accessToken) return;

    const actionLabel = status === "approved" ? "approve" : "reject";
    const requestedName =
      provider.businessNameChangeRequest?.requestedName || "this business name";
    const confirmed = window.confirm(
      `Do you want to ${actionLabel} the name change to "${requestedName}"?`
    );

    if (!confirmed) return;

    try {
      const updatedProvider = await reviewBusinessNameChange(
        accessToken,
        provider._id,
        { status }
      );
      setProviders((items) =>
        items.map((item) => (item._id === updatedProvider._id ? updatedProvider : item))
      );
    } catch (error) {
      handleAdminError("providers", error);
    }
  };

  const handleServiceStatusChange = async (service) => {
    if (!accessToken) return;

    try {
      const updatedService = await updateServiceStatus(
        accessToken,
        service._id,
        !service.isActive
      );
      setServices((items) =>
        items.map((item) => (item._id === updatedService._id ? updatedService : item))
      );
    } catch (error) {
      handleAdminError("services", error);
    }
  };

  const handleAdCardSubmit = async ({ formData, id, isEditing }) => {
    if (!accessToken) return;

    setBusy("adCards", true);
    setStatus((current) => ({ ...current, adCards: "" }));

    try {
      const savedAdCard = isEditing
        ? await updateAdCard(accessToken, id, formData)
        : await createAdCard(accessToken, formData);

      setAdCards((items) => {
        if (isEditing) {
          return items.map((item) => (item.id === savedAdCard.id ? savedAdCard : item));
        }

        return [savedAdCard, ...items];
      });
    } catch (error) {
      handleAdminError("adCards", error);
      throw error;
    } finally {
      setBusy("adCards", false);
    }
  };

  const handleAdCardActiveToggle = async (adCard) => {
    if (!accessToken) return;

    const formData = new FormData();
    formData.append("isActive", String(!adCard.isActive));

    try {
      const updatedAdCard = await updateAdCard(accessToken, adCard.id, formData);
      setAdCards((items) =>
        items.map((item) => (item.id === updatedAdCard.id ? updatedAdCard : item))
      );
    } catch (error) {
      handleAdminError("adCards", error);
    }
  };

  const handleDeleteAdCard = async (adCard) => {
    if (!accessToken) return;

    const confirmed = window.confirm(`Delete "${adCard.title}"?`);
    if (!confirmed) return;

    try {
      await deleteAdCard(accessToken, adCard.id);
      setAdCards((items) => items.filter((item) => item.id !== adCard.id));
    } catch (error) {
      handleAdminError("adCards", error);
    }
  };

  const handleAppUpdateSubmit = async ({ id, isEditing, payload }) => {
    if (!accessToken) return;

    setBusy("updates", true);
    setStatus((current) => ({ ...current, updates: "" }));

    try {
      const savedUpdate = isEditing
        ? await updateAppUpdate(accessToken, id, payload)
        : await createAppUpdate(accessToken, payload);

      setAppUpdates((items) => {
        if (isEditing) {
          return items.map((item) =>
            item.id === savedUpdate.id ? savedUpdate : item
          );
        }

        return [savedUpdate, ...items];
      });
    } catch (error) {
      handleAdminError("updates", error);
      throw error;
    } finally {
      setBusy("updates", false);
    }
  };

  const handleAppUpdateStatusChange = async (update, status) => {
    if (!accessToken) return;

    try {
      const savedUpdate = await updateAppUpdate(accessToken, update.id, {
        status,
      });
      setAppUpdates((items) =>
        items.map((item) => (item.id === savedUpdate.id ? savedUpdate : item))
      );
    } catch (error) {
      handleAdminError("updates", error);
    }
  };

  const handleDeleteAppUpdate = async (update) => {
    if (!accessToken) return;

    const confirmed = window.confirm(`Delete "${update.title}"?`);
    if (!confirmed) return;

    try {
      await deleteAppUpdate(accessToken, update.id);
      setAppUpdates((items) => items.filter((item) => item.id !== update.id));
    } catch (error) {
      handleAdminError("updates", error);
    }
  };

  const handleUploadAppUpdateImage = async (file) => {
    if (!accessToken) {
      throw new Error("Admin session expired.");
    }

    setBusy("updateImage", true);
    setStatus((current) => ({ ...current, updates: "" }));

    try {
      return await uploadAppUpdateImage(accessToken, file);
    } catch (error) {
      handleAdminError("updates", error);
      throw error;
    } finally {
      setBusy("updateImage", false);
    }
  };

  const handleBookingStatusChange = async (booking, nextStatus) => {
    if (!accessToken) return;

    try {
      const updatedBooking = await updateBookingStatus(
        accessToken,
        booking._id,
        nextStatus
      );
      setBookings((items) =>
        items.map((item) => (item._id === updatedBooking._id ? updatedBooking : item))
      );
    } catch (error) {
      handleAdminError("bookings", error);
    }
  };

  const handleDeleteWaitlistEntry = async (entry) => {
    if (!accessToken) return;

    const confirmed = window.confirm(`Delete ${entry.name} from the waitlist?`);
    if (!confirmed) return;

    try {
      await deleteWaitlistEntry(accessToken, entry._id);
      setWaitlistEntries((items) => items.filter((item) => item._id !== entry._id));
    } catch (error) {
      handleAdminError("waitlist", error);
    }
  };

  const handlePartnershipStatusChange = async (lead, nextStatus) => {
    if (!accessToken || lead.status === nextStatus) return;

    try {
      const updatedLead = await updatePartnershipLead(accessToken, lead._id, {
        status: nextStatus,
      });
      setPartnershipLeads((items) =>
        items.map((item) => (item._id === updatedLead._id ? updatedLead : item))
      );
    } catch (error) {
      handleAdminError("partnerships", error);
    }
  };

  const handlePartnershipNotesChange = async (lead) => {
    if (!accessToken) return;

    const adminNotes = window.prompt(
      `Notes for ${lead.organizationName}`,
      lead.adminNotes || ""
    );

    if (adminNotes === null) return;

    try {
      const updatedLead = await updatePartnershipLead(accessToken, lead._id, {
        adminNotes,
      });
      setPartnershipLeads((items) =>
        items.map((item) => (item._id === updatedLead._id ? updatedLead : item))
      );
    } catch (error) {
      handleAdminError("partnerships", error);
    }
  };

  const handleDeletePartnershipLead = async (lead) => {
    if (!accessToken) return;

    const confirmed = window.confirm(
      `Delete partnership lead from ${lead.organizationName}?`
    );
    if (!confirmed) return;

    try {
      await deletePartnershipLead(accessToken, lead._id);
      setPartnershipLeads((items) =>
        items.filter((item) => item._id !== lead._id)
      );
    } catch (error) {
      handleAdminError("partnerships", error);
    }
  };

  const waitlistStats = useMemo(() => {
    const byType = countBy(waitlistEntries, "userType");
    const countries = new Set(
      waitlistEntries.map((entry) => entry.country).filter(Boolean)
    );

    return {
      businesses: byType.beauty_business || 0,
      clients: byType.client || 0,
      countries: countries.size,
      professionals: byType.beauty_professional || 0,
      total: waitlistEntries.length,
    };
  }, [waitlistEntries]);

  const partnershipStats = useMemo(() => {
    const byStatus = countBy(partnershipLeads, "status");

    return {
      archived: byStatus.archived || 0,
      contacted: byStatus.contacted || 0,
      new: byStatus.new || 0,
      qualified: byStatus.qualified || 0,
      total: partnershipLeads.length,
    };
  }, [partnershipLeads]);

  const userStats = useMemo(() => {
    const byRole = countBy(mobileUsers, "role");

    return {
      active: mobileUsers.filter((user) => user.isActive).length,
      businesses: byRole.beauty_business || 0,
      clients: byRole.client || 0,
      professionals: byRole.beauty_professional || 0,
      total: mobileUsers.length,
    };
  }, [mobileUsers]);

  const feedbackStats = useMemo(() => {
    const byStatus = countBy(feedbackEntries, "status");
    const byRole = countBy(feedbackEntries, "role");

    return {
      archived: byStatus.archived || 0,
      businesses: byRole.beauty_business || 0,
      clients: byRole.client || 0,
      new: byStatus.new || 0,
      planned: byStatus.planned || 0,
      professionals: byRole.beauty_professional || 0,
      reviewed: byStatus.reviewed || 0,
      total: feedbackEntries.length,
    };
  }, [feedbackEntries]);

  const providerStats = useMemo(() => {
    const byStatus = countBy(providers, "verificationStatus");

    return {
      approved: byStatus.approved || 0,
      pending: byStatus.pending || 0,
      rejected: byStatus.rejected || 0,
      total: providers.length,
    };
  }, [providers]);

  const serviceStats = useMemo(
    () => ({
      active: services.filter((service) => service.isActive).length,
      inactive: services.filter((service) => !service.isActive).length,
      total: services.length,
    }),
    [services]
  );

  const adCardStats = useMemo(
    () => ({
      active: adCards.filter((adCard) => adCard.isActive).length,
      inactive: adCards.filter((adCard) => !adCard.isActive).length,
      total: adCards.length,
    }),
    [adCards]
  );

  const updateStats = useMemo(
    () => ({
      draft: appUpdates.filter((update) => update.status === "draft").length,
      published: appUpdates.filter((update) => update.status === "published").length,
      total: appUpdates.length,
    }),
    [appUpdates]
  );

  const filteredWaitlist = useMemo(
    () =>
      waitlistEntries.filter((entry) => {
        const matchesType = waitlistFilter === "all" || entry.userType === waitlistFilter;
        const matchesSearch = includesSearch(
          [
            entry.name,
            entry.email,
            entry.phone,
            entry.country,
            entry.location,
            entry.serviceOffered,
          ],
          search
        );

        return matchesType && matchesSearch;
      }),
    [search, waitlistEntries, waitlistFilter]
  );

  const filteredPartnerships = useMemo(
    () =>
      partnershipLeads.filter((lead) => {
        const matchesStatus =
          !partnershipStatusFilter || lead.status === partnershipStatusFilter;
        const matchesType =
          !partnershipTypeFilter || lead.partnershipType === partnershipTypeFilter;
        const matchesSearch = includesSearch(
          [
            lead.organizationName,
            lead.contactName,
            lead.email,
            lead.phone,
            lead.country,
            lead.city,
            lead.website,
            lead.partnershipType,
            lead.audience,
            lead.message,
            lead.adminNotes,
            lead.status,
          ],
          search
        );

        return matchesStatus && matchesType && matchesSearch;
      }),
    [partnershipLeads, partnershipStatusFilter, partnershipTypeFilter, search]
  );

  const filteredMobileUsers = useMemo(
    () =>
      mobileUsers.filter((user) => {
        const matchesRole = !userRoleFilter || user.role === userRoleFilter;
        const matchesSearch = includesSearch(
          [user.name, user.email, user.phone, user.country, user.city],
          search
        );

        return matchesRole && matchesSearch;
      }),
    [mobileUsers, search, userRoleFilter]
  );

  const filteredFeedback = useMemo(
    () =>
      feedbackEntries.filter((feedback) => {
        const matchesRole =
          !feedbackRoleFilter || feedback.role === feedbackRoleFilter;
        const matchesStatus =
          !feedbackStatusFilter || feedback.status === feedbackStatusFilter;
        const matchesTopic =
          !feedbackTopicFilter || feedback.topic === feedbackTopicFilter;
        const matchesSearch = includesSearch(
          [
            feedback.user?.name,
            feedback.user?.email,
            feedback.user?.phone,
            feedback.role,
            feedback.topic,
            feedback.status,
            feedback.message,
            feedback.adminNotes,
          ],
          search
        );

        return matchesRole && matchesStatus && matchesTopic && matchesSearch;
      }),
    [
      feedbackEntries,
      feedbackRoleFilter,
      feedbackStatusFilter,
      feedbackTopicFilter,
      search,
    ]
  );

  const filteredProviders = useMemo(
    () =>
      providers
        .filter((provider) => {
          const matchesStatus =
            !providerStatusFilter ||
            provider.verificationStatus === providerStatusFilter;
          const matchesSearch = includesSearch(
            [
              provider.businessName,
              provider.user?.name,
              provider.user?.email,
              provider.user?.phone,
              provider.country,
              provider.city,
              provider.area,
              provider.verificationStatus,
              ...(provider.categories || []),
            ],
            search
          );

          return matchesStatus && matchesSearch;
        })
        .sort((first, second) => {
          const statusOrder = { pending: 0, rejected: 1, approved: 2 };
          const firstOrder = statusOrder[first.verificationStatus] ?? 3;
          const secondOrder = statusOrder[second.verificationStatus] ?? 3;

          if (firstOrder !== secondOrder) {
            return firstOrder - secondOrder;
          }

          return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
        }),
    [providerStatusFilter, providers, search]
  );

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        includesSearch(
          [
            service.name,
            service.category,
            service.description,
            service.provider?.businessName,
            service.provider?.user?.name,
          ],
          search
        )
      ),
    [search, services]
  );

  const filteredAdCards = useMemo(
    () =>
      adCards.filter((adCard) =>
        includesSearch(
          [
            adCard.title,
            adCard.subtitle,
            adCard.ctaText,
            ...(adCard.placements || []),
          ],
          search
        )
      ),
    [adCards, search]
  );

  const filteredAppUpdates = useMemo(
    () =>
      appUpdates.filter((update) =>
        includesSearch(
          [
            update.title,
            update.summary,
            update.body,
            update.status,
            ...(update.audiences || []),
          ],
          search
        )
      ),
    [appUpdates, search]
  );

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        includesSearch(
          [
            booking.client?.name,
            booking.client?.phone,
            booking.provider?.businessName,
            booking.provider?.user?.name,
            booking.service?.name,
            booking.status,
          ],
          search
        )
      ),
    [bookings, search]
  );

  const exportWaitlistCsv = () => {
    downloadCsv({
      filename: "vuta-waitlist.csv",
      headers: [
        "Name",
        "Email",
        "Phone",
        "Country",
        "Location",
        "User type",
        "Service offered",
        "Portfolio",
        "Joined",
        "Legal consent",
        "Legal consent email",
        "Legal consent accepted at",
        "Legal document version",
      ],
      rows: filteredWaitlist.map((entry) => [
        entry.name,
        entry.email,
        entry.phone,
        entry.country,
        entry.location,
        entry.userType,
        entry.serviceOffered,
        entry.portfolioLink,
        entry.createdAt,
        entry.legalConsent?.accepted ? "Accepted" : "N/A",
        entry.legalConsent?.email,
        entry.legalConsent?.acceptedAt,
        entry.legalConsent?.documents?.termsAndConditions?.version,
      ]),
    });
  };

  const exportPartnershipsCsv = () => {
    downloadCsv({
      filename: "vuta-partnerships.csv",
      headers: [
        "Organization",
        "Contact",
        "Email",
        "Phone",
        "Country",
        "City",
        "Website",
        "Partnership type",
        "Audience",
        "Message",
        "Status",
        "Admin notes",
        "Submitted",
        "Legal consent",
        "Legal consent email",
        "Legal consent accepted at",
        "Legal document version",
      ],
      rows: filteredPartnerships.map((lead) => [
        lead.organizationName,
        lead.contactName,
        lead.email,
        lead.phone,
        lead.country,
        lead.city,
        lead.website,
        lead.partnershipType,
        lead.audience,
        lead.message,
        lead.status,
        lead.adminNotes,
        lead.createdAt,
        lead.legalConsent?.accepted ? "Accepted" : "N/A",
        lead.legalConsent?.email,
        lead.legalConsent?.acceptedAt,
        lead.legalConsent?.documents?.termsAndConditions?.version,
      ]),
    });
  };

  return {
    actions: {
      clearAdminSession,
      exportPartnershipsCsv,
      exportWaitlistCsv,
      handleAdCardActiveToggle,
      handleAdCardSubmit,
      handleAppUpdateStatusChange,
      handleAppUpdateSubmit,
      handleBookingStatusChange,
      handleDeleteAdCard,
      handleDeleteAppUpdate,
      handleDeleteFeedback,
      handleDeletePartnershipLead,
      handleDeleteWaitlistEntry,
      handleFeedbackNotesChange,
      handleFeedbackStatusChange,
      handlePartnershipNotesChange,
      handlePartnershipStatusChange,
      handleBusinessNameChangeReview,
      handleProviderVerification,
      handleServiceStatusChange,
      handleUserStatusChange,
      handleUploadAppUpdateImage,
      refreshAll,
      refreshAdCards,
      refreshAppUpdates,
      refreshBookings,
      refreshFeedback,
      refreshHealth,
      refreshMobileUsers,
      refreshPartnerships,
      refreshProviders,
      refreshServices,
      refreshWaitlist,
      setAdminLoginSession,
    },
    filters: {
      adCardPlacementFilter,
      partnershipStatusFilter,
      partnershipTypeFilter,
      feedbackRoleFilter,
      feedbackStatusFilter,
      feedbackTopicFilter,
      providerStatusFilter,
      search,
      serviceStatusFilter,
      updateAudienceFilter,
      updateStatusFilter,
      userRoleFilter,
      waitlistFilter,
    },
    loading,
    session: adminSession,
    setters: {
      setAdCardPlacementFilter,
      setPartnershipStatusFilter,
      setPartnershipTypeFilter,
      setFeedbackRoleFilter,
      setFeedbackStatusFilter,
      setFeedbackTopicFilter,
      setProviderStatusFilter,
      setSearch,
      setServiceStatusFilter,
      setUpdateAudienceFilter,
      setUpdateStatusFilter,
      setUserRoleFilter,
      setWaitlistFilter,
    },
    state: {
      adCards: filteredAdCards,
      appUpdates: filteredAppUpdates,
      bookings: filteredBookings,
      feedback: filteredFeedback,
      health,
      partnerships: filteredPartnerships,
      providers: filteredProviders,
      services: filteredServices,
      users: filteredMobileUsers,
      waitlist: filteredWaitlist,
    },
    stats: {
      adCardStats,
      feedbackStats,
      partnershipStats,
      providerStats,
      serviceStats,
      updateStats,
      userStats,
      waitlistStats,
    },
    status,
  };
}
