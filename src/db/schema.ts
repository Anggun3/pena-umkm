import { mysqlTable, varchar, text, timestamp, int, mysqlEnum } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "kasir"]).notNull().default("kasir"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const shopProfile = mysqlTable("shop_profile", {
  id: int("id").primaryKey().default(1),
  shopName: varchar("shop_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  receiptGreeting: text("receipt_greeting"),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  costPrice: int("cost_price").notNull(),
  sellingPrice: int("selling_price").notNull(),
  stock: int("stock").notNull().default(0),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).default(null),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  cashierId: int("cashier_id").notNull().references(() => users.id),
  totalAmount: int("total_amount").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["tunai", "qris"]).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "lunas", "batal"]).notNull().default("pending"),
  cashReceived: int("cash_received").default(0),
  cashChange: int("cash_change").default(0),
  qrisPayload: text("qris_payload").default(null),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionDetails = mysqlTable("transaction_details", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transaction_id").notNull().references(() => transactions.id),
  productId: int("product_id").notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(),
});

