import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "../services/auth-service";
import { config } from "../config/env";

export const authRoute = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: config.jwtSecret,
    })
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const user = await AuthService.login(body.email, body.password);
        
        // Generate session token
        const token = await jwt.sign({
          id: user.id,
          role: user.role,
        });

        return {
          token,
          role: user.role,
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
  .post(
    "/logout",
    async () => {
      // Pada arsitektur stateless JWT, logout biasanya menghapus token di sisi klien.
      // Di sini kita sekadar merespons status sukses untuk memicu klien melakukan pembersihan.
      return { data: "Logout berhasil" };
    }
  );
