import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth-service";
import { authMiddleware } from "../middleware/auth-middleware";

export const authRoute = new Elysia({ prefix: "/api/auth" })
  // POST /api/auth/login — Login dan buat session baru
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const result = await AuthService.login(body.email, body.password);
        return {
          data: {
            token: result.token,
            role: result.role,
          },
        };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || "Email atau password salah" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  // POST /api/auth/logout — Hapus session dari database
  .use(authMiddleware)
  .post("/logout", async ({ user, headers, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized: Token tidak valid atau tidak ditemukan" };
    }
    const authHeader = headers["authorization"];
    const token = authHeader!.substring(7);
    await AuthService.logout(token);
    return { data: "Logout berhasil" };
  });
