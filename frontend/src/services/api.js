import axios from "axios";

const LOCAL_API_URL = "http://localhost:5050/api";
const PRODUCTION_API_URL = "https://api.vuta.app/api";

const isLocalHost = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (isLocalHost() ? LOCAL_API_URL : PRODUCTION_API_URL)
).replace(/\/$/, "");

export const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
