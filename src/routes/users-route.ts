import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" }).post(
  "/",
  async ({ body, set }) => {
    try {
      await UsersService.registerUser({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
      });
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
);
