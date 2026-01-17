CREATE TABLE `cloudflare_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`apiToken` text NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`accountEmail` varchar(320) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cloudflare_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uptime_kuma_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`apiUrl` varchar(512) NOT NULL,
	`apiKey` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uptime_kuma_instances_id` PRIMARY KEY(`id`)
);
