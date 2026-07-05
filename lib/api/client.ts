import axios from "axios";

// Axios instance pre-configured with /api base URL.
// All frontend API calls go through this client.
export const apiClient = axios.create({
  baseURL: "/api",
});
