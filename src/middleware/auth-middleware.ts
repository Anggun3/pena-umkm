import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_jwt_key_change_me_in_production",
    })
  )
  .derive({ as: "global" }, async ({ jwt, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }
    const token = authHeader.substring(7);
    const payload = await jwt.verify(token);
    if (!payload) {
      return { user: null };
    }
    return {
      user: {
        id: Number(payload.id),
        role: payload.role as "admin" | "kasir",
      },
    };
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
