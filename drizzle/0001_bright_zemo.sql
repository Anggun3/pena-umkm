CREATE TABLE `shop_profile` (
	`id` int NOT NULL DEFAULT 1,
	`shop_name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`phone` varchar(20) NOT NULL,
	`receipt_greeting` text,
	CONSTRAINT `shop_profile_id` PRIMARY KEY(`id`)
);
