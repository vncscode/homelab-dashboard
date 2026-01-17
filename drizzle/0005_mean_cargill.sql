CREATE TABLE `file_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serverId` int NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`fileSize` int NOT NULL,
	`filePath` varchar(1024) NOT NULL,
	`mimeType` varchar(255) NOT NULL,
	`s3Key` varchar(512),
	`s3Url` text,
	`status` enum('pending','uploading','completed','failed') NOT NULL DEFAULT 'pending',
	`progress` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`uploadedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `file_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `server_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serverId` int NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`filePath` varchar(1024) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(255) NOT NULL,
	`isDirectory` int NOT NULL DEFAULT 0,
	`lastModified` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `server_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `upload_user_server_idx` ON `file_uploads` (`userId`,`serverId`);--> statement-breakpoint
CREATE INDEX `upload_status_idx` ON `file_uploads` (`status`);--> statement-breakpoint
CREATE INDEX `upload_created_at_idx` ON `file_uploads` (`createdAt`);--> statement-breakpoint
CREATE INDEX `file_user_server_path_idx` ON `server_files` (`userId`,`serverId`,`filePath`);--> statement-breakpoint
CREATE INDEX `file_created_at_idx` ON `server_files` (`createdAt`);