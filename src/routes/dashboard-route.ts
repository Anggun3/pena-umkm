import { Elysia } from "elysia";
import { DashboardService } from "../services/dashboard-service";
import { requireRoles } from "../middleware/auth-middleware";

export const dashboardRoute = new Elysia({ prefix: "/api/admin" })
  .use(requireRoles(["admin"]))
  .get("/dashboard/overview", async ({ set }) => {
    try {
      const overview = await DashboardService.getDashboardOverview();
      return overview;
    } catch (error: any) {
      set.status = 500;
      return { error: error.message || "Gagal mengambil data ringkasan dashboard" };
    }
  });
