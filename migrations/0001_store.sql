CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`customer` text NOT NULL,
	`status` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` integer NOT NULL,
	`stock` integer NOT NULL,
	`icon` text NOT NULL,
	`description` text NOT NULL
);
