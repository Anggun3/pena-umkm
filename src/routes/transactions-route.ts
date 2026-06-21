import { Elysia, t } from "elysia";
import { TransactionsService } from "../services/transactions-service";
import { requireRoles } from "../middleware/auth-middleware";

export const transactionsRoute = new Elysia({ prefix: "/api" })
  // Webhook verification QRIS (tidak butuh auth/token kasir)
  .post(
    "/webhook/qris-verify",
    async ({ body, set }) => {
      try {
        const result = await TransactionsService.verifyQRISPayment(
          body.invoice_number,
          body.status
        );
        return result;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || "Gagal memproses webhook QRIS" };
      }
    },
    {
      body: t.Object({
        invoice_number: t.String(),
        status: t.String(),
      }),
    }
  )
  // Endpoint yang memerlukan autentikasi role admin atau kasir
  .group("/transactions", (app) =>
    app
      .use(requireRoles(["admin", "kasir"]))
      .post(
        "/",
        async ({ body, user, set }) => {
          try {
            // user diperoleh dari middleware autentikasi derive
            const result = await TransactionsService.checkout(user!.id, {
              payment_method: body.payment_method as "tunai" | "qris",
              cash_received: body.cash_received,
              items: body.items,
            });
            return result;
          } catch (error: any) {
            set.status = 400;
            return { error: error.message || "Gagal memproses transaksi" };
          }
        },
        {
          body: t.Object({
            payment_method: t.Union([t.Literal("tunai"), t.Literal("qris")]),
            cash_received: t.Number({ default: 0 }),
            items: t.Array(
              t.Object({
                product_id: t.Number(),
                quantity: t.Number({ minimum: 1 }),
              })
            ),
          }),
        }
      )
      .get("/today", async ({ set }) => {
        try {
          const list = await TransactionsService.getTodayTransactions();
          return list;
        } catch (error: any) {
          set.status = 500;
          return { error: error.message || "Gagal mengambil data transaksi hari ini" };
        }
      })
  );
