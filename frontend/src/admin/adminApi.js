import axios from "axios";
import API from "../services/api";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5050/api"
).replace(/\/$/, "");
const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, "");

const authHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

export const getAdminErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

export const fetchApiHealth = async () => {
  const { data } = await axios.get(`${API_ROOT_URL}/health`);

  return data;
};

export const loginAdmin = async (payload) => {
  const { data } = await API.post("/auth/login", payload);
  const session = data.data;

  if (session.user.role !== "admin") {
    throw new Error("This account does not have admin access.");
  }

  return session;
};

export const fetchWaitlist = async (accessToken) => {
  const { data } = await API.get("/waitlist", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
    },
  });

  return data;
};

export const deleteWaitlistEntry = async (accessToken, entryId) => {
  await API.delete(`/waitlist/${entryId}`, {
    headers: authHeaders(accessToken),
  });
};

export const fetchPartnershipLeads = async (accessToken, params = {}) => {
  const { data } = await API.get("/partnerships/admin", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const updatePartnershipLead = async (accessToken, leadId, payload) => {
  const { data } = await API.patch(`/partnerships/admin/${leadId}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data.data;
};

export const deletePartnershipLead = async (accessToken, leadId) => {
  await API.delete(`/partnerships/admin/${leadId}`, {
    headers: authHeaders(accessToken),
  });
};

export const fetchAdminProviders = async (accessToken, params = {}) => {
  const { data } = await API.get("/providers/admin", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const updateProviderVerification = async (
  accessToken,
  providerId,
  verificationStatus
) => {
  const { data } = await API.patch(
    `/providers/${providerId}/verification`,
    { verificationStatus },
    {
      headers: authHeaders(accessToken),
    }
  );

  return data.data;
};

export const reviewBusinessNameChange = async (
  accessToken,
  providerId,
  payload
) => {
  const { data } = await API.patch(
    `/providers/${providerId}/business-name-change`,
    payload,
    {
      headers: authHeaders(accessToken),
    }
  );

  return data.data;
};

export const fetchAdminServices = async (accessToken, params = {}) => {
  const { data } = await API.get("/services/admin", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const updateServiceStatus = async (accessToken, serviceId, isActive) => {
  const { data } = await API.patch(
    `/services/admin/${serviceId}/status`,
    { isActive },
    {
      headers: authHeaders(accessToken),
    }
  );

  return data.data;
};

export const fetchAdminAdCards = async (accessToken, params = {}) => {
  const { data } = await API.get("/ad-cards/admin", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const fetchAdminUpdates = async (accessToken, params = {}) => {
  const { data } = await API.get("/updates/admin", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const createAppUpdate = async (accessToken, payload) => {
  const { data } = await API.post("/updates/admin", payload, {
    headers: authHeaders(accessToken),
  });

  return data.data;
};

export const updateAppUpdate = async (accessToken, updateId, payload) => {
  const { data } = await API.patch(`/updates/admin/${updateId}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data.data;
};

export const deleteAppUpdate = async (accessToken, updateId) => {
  await API.delete(`/updates/admin/${updateId}`, {
    headers: authHeaders(accessToken),
  });
};

export const uploadAppUpdateImage = async (accessToken, file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await API.post("/updates/admin/images", formData, {
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data.media;
};

export const createAdCard = async (accessToken, formData) => {
  const { data } = await API.post("/ad-cards/admin", formData, {
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data.adCard;
};

export const updateAdCard = async (accessToken, adCardId, formData) => {
  const { data } = await API.patch(`/ad-cards/admin/${adCardId}`, formData, {
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data.adCard;
};

export const deleteAdCard = async (accessToken, adCardId) => {
  await API.delete(`/ad-cards/admin/${adCardId}`, {
    headers: authHeaders(accessToken),
  });
};

export const fetchAdminBookings = async (accessToken) => {
  const { data } = await API.get("/bookings", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
    },
  });

  return data;
};

export const updateBookingStatus = async (accessToken, bookingId, status) => {
  const { data } = await API.patch(
    `/bookings/${bookingId}/status`,
    { status },
    {
      headers: authHeaders(accessToken),
    }
  );

  return data.data;
};

export const fetchMobileUsers = async (accessToken, params = {}) => {
  const { data } = await API.get("/users", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const updateMobileUserStatus = async (accessToken, userId, payload) => {
  const { data } = await API.patch(`/users/${userId}/status`, payload, {
    headers: authHeaders(accessToken),
  });

  return data.data;
};

export const fetchAdminFeedback = async (accessToken, params = {}) => {
  const { data } = await API.get("/feedback/admin", {
    headers: authHeaders(accessToken),
    params: {
      limit: 100,
      ...params,
    },
  });

  return data;
};

export const updateFeedback = async (accessToken, feedbackId, payload) => {
  const { data } = await API.patch(`/feedback/admin/${feedbackId}`, payload, {
    headers: authHeaders(accessToken),
  });

  return data.data;
};

export const deleteFeedback = async (accessToken, feedbackId) => {
  await API.delete(`/feedback/admin/${feedbackId}`, {
    headers: authHeaders(accessToken),
  });
};
