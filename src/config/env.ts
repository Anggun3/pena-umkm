export const config = {
  databaseUrl: process.env.DATABASE_URL || "mysql://root:password@localhost:3306/pena_umkm",
  jwtSecret: process.env.JWT_SECRET || "super_secret_jwt_key_change_me_in_production",
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Validasi Keamanan: Jika di production, JWT_SECRET tidak boleh menggunakan fallback default
if (
  config.nodeEnv === "production" &&
  config.jwtSecret === "super_secret_jwt_key_change_me_in_production"
) {
  throw new Error(
    "CRITICAL SECURITY ERROR: JWT_SECRET must be set to a secure, custom value in production mode!"
  );
}
