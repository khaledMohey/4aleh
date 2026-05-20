import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "حدث خطأ غير متوقع";
    return Promise.reject(new Error(typeof message === "object" ? JSON.stringify(message) : message));
  }
);

export const endpoints = {
  dashboard: "/dashboard/",
  search: "/search/",
  reports: "/reports/",
  chalets: "/chalets/",
  owners: "/owners/owners/",
  contracts: "/owners/contracts/",
  bookings: "/bookings/",
  customers: "/bookings/customers/",
  calendar: "/bookings/calendar/",
  expenses: "/expenses/",
  notifications: "/notifications/",
};
