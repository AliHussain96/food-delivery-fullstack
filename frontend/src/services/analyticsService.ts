
import type {
  DashboardAnalytics,
} from "@/types/analytics";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function getDashboardAnalytics():
  Promise<DashboardAnalytics> {
  const response = await fetch(
    `${API_URL}/api/analytics/dashboard`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      "Failed to fetch dashboard analytics."
    );
  }

  return result.data as DashboardAnalytics;
}
