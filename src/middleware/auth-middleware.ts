import { Elysia } from "elysia";
import { AuthService } from "../services/auth-service";

/**
 * Middleware autentikasi berbasis session database.
 * Membaca token dari header Authorization: Bearer <token>
 * dan memverifikasi keberadaannya di tabel `sessions`.
 */
export const authMiddleware = new Elysia()
  .derive({ as: "global" }, async ({ headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }
    const token = authHeader.substring(7);
    const userData = await AuthService.verifySession(token);
    if (!userData) {
      return { user: null };
    }
    return { user: userData };
  });

export const requireRoles = (roles: ("admin" | "kasir")[]) => {
  return new Elysia()
    .use(authMiddleware)
    .onBeforeHandle({ as: "global" }, ({ user, set }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized: Token tidak valid atau tidak ditemukan" };
      }
      if (!roles.includes(user.role)) {
        set.status = 403;
        return { error: "Forbidden: Anda tidak memiliki hak akses" };
      }
    });
};
