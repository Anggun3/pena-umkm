import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";
import { authMiddleware } from "../middleware/auth-middleware";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  // POST /api/users — Registrasi user baru
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await UsersService.registerUser({
          name: body.name,
          email: body.email,
          password: body.password,
          role: body.role,
        });
        set.status = 201;
        return { data: "OK" };
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || "Terjadi kesalahan internal" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
        role: t.Union([t.Literal("admin"), t.Literal("kasir")]),
      }),
    }
  )
  // GET /api/users/me — Ambil profil user yang sedang login
  .use(authMiddleware)
  .get("/me", async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized: Token tidak valid atau tidak ditemukan" };
    }
    try {
      const profile = await UsersService.getUserById(user.id);
      return { data: profile };
    } catch (error: any) {
      set.status = 404;
      return { error: error.message || "User tidak ditemukan" };
    }
  });
