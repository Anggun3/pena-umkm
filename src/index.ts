import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { staticPlugin } from "@elysiajs/static";
import { shopRoute } from "./routes/shop-route";
import { usersRoute } from "./routes/users-route";
import { authRoute } from "./routes/auth-route";
import { adminProductsRoute } from "./routes/admin-products-route";
import { productsRoute } from "./routes/products-route";
import { transactionsRoute } from "./routes/transactions-route";
import { dashboardRoute } from "./routes/dashboard-route";
import { reportsRoute } from "./routes/reports-route";

const app = new Elysia()
  // Static file server — sajikan folder /public secara publik
  .use(staticPlugin({ assets: "public", prefix: "/public" }))
  // Setup CORS secara global
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  // Setup JWT plugin secara global
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super_secret_jwt_key_change_me_in_production",
    })
  )
  // Rute-rute API
  .use(shopRoute)
  .use(usersRoute)
  .use(authRoute)
  .use(adminProductsRoute)
  .use(productsRoute)
  .use(transactionsRoute)
  .use(dashboardRoute)
  .use(reportsRoute)
  // Rute dasar (health-check)
  .get("/", () => {
    return {
      status: "ok",
      message: "Server ElysiaJS Pena UMKM berhasil berjalan!",
      timestamp: new Date().toISOString(),
    };
  })
  .listen({
    port: process.env.PORT || 3000,
    hostname: process.env.HOST || "0.0.0.0",
  });

console.log(
  `🦊 Server ElysiaJS berjalan di http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
