CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cost_price` int NOT NULL,
	`selling_price` int NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`category` varchar(100) NOT NULL,
	`image_url` varchar(255) DEFAULT null,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
