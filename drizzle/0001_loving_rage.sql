CREATE TABLE `glances_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`apiUrl` varchar(512) NOT NULL,
	`apiKey` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `glances_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jexactyl_servers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`apiUrl` varchar(512) NOT NULL,
	`apiKey` text NOT NULL,
	`serverId` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jexactyl_servers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qbittorrent_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`apiUrl` varchar(512) NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qbittorrent_instances_id` PRIMARY KEY(`id`)
);
