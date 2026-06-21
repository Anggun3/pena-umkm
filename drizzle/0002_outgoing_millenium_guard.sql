CREATE TABLE `transaction_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transaction_id` int NOT NULL,
	`product_id` int NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	CONSTRAINT `transaction_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`cashier_id` int NOT NULL,
	`total_amount` int NOT NULL,
	`payment_method` enum('tunai','qris') NOT NULL,
	`payment_status` enum('pending','lunas','batal') NOT NULL DEFAULT 'pending',
	`cash_received` int DEFAULT 0,
	`cash_change` int DEFAULT 0,
	`qris_payload` text DEFAULT (null),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
ALTER TABLE `transaction_details` ADD CONSTRAINT `transaction_details_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_details` ADD CONSTRAINT `transaction_details_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_cashier_id_users_id_fk` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;