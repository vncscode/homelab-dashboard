CREATE TABLE `plugin_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pluginId` int NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plugin_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('jexactyl','qbittorrent','glances') NOT NULL,
	`isInstalled` int NOT NULL DEFAULT 0,
	`isEnabled` int NOT NULL DEFAULT 0,
	`version` varchar(50),
	`description` text,
	`icon` varchar(255),
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plugins_id` PRIMARY KEY(`id`)
);
