import { Elysia, t } from "elysia";
import { ReportsService } from "../services/reports-service";
import { requireRoles } from "../middleware/auth-middleware";

export const reportsRoute = new Elysia({ prefix: "/api/admin/reports" })
  .use(requireRoles(["admin"]))
  .get(
    "/excel",
    async ({ query, set }) => {
      try {
        const buffer = await ReportsService.generateExcelReport(query.start_date, query.end_date);
        
        set.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        set.headers["Content-Disposition"] = `attachment; filename="laporan-keuangan-${query.start_date}-to-${query.end_date}.xlsx"`;
        
        return buffer;
      } catch (error: any) {
        set.status = 500;
        return { error: error.message || "Gagal memproses ekspor laporan Excel" };
      }
    },
    {
      query: t.Object({
        start_date: t.String(),
        end_date: t.String(),
      }),
    }
  )
  .get(
    "/pdf",
    async ({ query, set }) => {
      try {
        const buffer = await ReportsService.generatePDFReport(query.start_date, query.end_date);
        
        set.headers["Content-Type"] = "application/pdf";
        set.headers["Content-Disposition"] = `attachment; filename="laporan-keuangan-${query.start_date}-to-${query.end_date}.pdf"`;
        
        return buffer;
      } catch (error: any) {
        set.status = 500;
        return { error: error.message || "Gagal memproses ekspor laporan PDF" };
      }
    },
    {
      query: t.Object({
        start_date: t.String(),
        end_date: t.String(),
      }),
    }
  );
