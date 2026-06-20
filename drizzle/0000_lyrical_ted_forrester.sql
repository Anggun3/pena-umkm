CREATE TABLE `shop_profile` (
	`id` int NOT NULL DEFAULT 1,
	`shop_name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`phone` varchar(20) NOT NULL,
	`receipt_greeting` text,
	CONSTRAINT `shop_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','kasir') NOT NULL DEFAULT 'kasir',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
