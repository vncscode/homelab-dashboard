CREATE TABLE `server_metrics_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instanceId` int NOT NULL,
	`cpuPercent` decimal(5,2) NOT NULL,
	`cpuCores` int NOT NULL,
	`memoryUsed` int NOT NULL,
	`memoryTotal` int NOT NULL,
	`memoryPercent` decimal(5,2) NOT NULL,
	`diskUsed` int NOT NULL,
	`diskTotal` int NOT NULL,
	`diskPercent` decimal(5,2) NOT NULL,
	`networkBytesIn` int NOT NULL,
	`networkBytesOut` int NOT NULL,
	`networkPacketsIn` int NOT NULL,
	`networkPacketsOut` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `server_metrics_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `torrent_download_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instanceId` int NOT NULL,
	`torrentHash` varchar(255) NOT NULL,
	`torrentName` varchar(512) NOT NULL,
	`progress` decimal(5,2) NOT NULL,
	`downloadSpeed` int NOT NULL,
	`uploadSpeed` int NOT NULL,
	`eta` int NOT NULL,
	`status` enum('downloading','seeding','paused','stopped','error') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `torrent_download_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_instance_idx` ON `server_metrics_history` (`userId`,`instanceId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `server_metrics_history` (`timestamp`);--> statement-breakpoint
CREATE INDEX `torrent_user_instance_idx` ON `torrent_download_history` (`userId`,`instanceId`);--> statement-breakpoint
CREATE INDEX `torrent_hash_idx` ON `torrent_download_history` (`torrentHash`);--> statement-breakpoint
CREATE INDEX `torrent_timestamp_idx` ON `torrent_download_history` (`timestamp`);