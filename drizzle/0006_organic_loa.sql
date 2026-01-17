CREATE TABLE `file_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serverId` int NOT NULL,
	`filePath` varchar(1024) NOT NULL,
	`content` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(255) NOT NULL,
	`lastEditedBy` int,
	`lastEditedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `file_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `file_content_filePath_unique` UNIQUE(`filePath`)
);
--> statement-breakpoint
CREATE TABLE `file_edit_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serverId` int NOT NULL,
	`filePath` varchar(1024) NOT NULL,
	`content` text NOT NULL,
	`previousContent` text,
	`changeSize` int,
	`editMessage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_edit_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `content_user_server_file_idx` ON `file_content` (`userId`,`serverId`,`filePath`);--> statement-breakpoint
CREATE INDEX `content_updated_at_idx` ON `file_content` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `edit_user_server_file_idx` ON `file_edit_history` (`userId`,`serverId`,`filePath`);--> statement-breakpoint
CREATE INDEX `edit_created_at_idx` ON `file_edit_history` (`createdAt`);