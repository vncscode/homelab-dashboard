CREATE TABLE `alert_thresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instanceId` int NOT NULL,
	`cpuThreshold` decimal(5,2) NOT NULL DEFAULT '80',
	`memoryThreshold` decimal(5,2) NOT NULL DEFAULT '85',
	`diskThreshold` decimal(5,2) NOT NULL DEFAULT '90',
	`isEnabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_thresholds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instanceId` int NOT NULL,
	`alertType` enum('cpu','memory','disk') NOT NULL,
	`severity` enum('warning','critical') NOT NULL,
	`currentValue` decimal(5,2) NOT NULL,
	`threshold` decimal(5,2) NOT NULL,
	`message` text NOT NULL,
	`isResolved` int NOT NULL DEFAULT 0,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `threshold_user_instance_idx` ON `alert_thresholds` (`userId`,`instanceId`);--> statement-breakpoint
CREATE INDEX `alert_user_instance_idx` ON `alerts` (`userId`,`instanceId`);--> statement-breakpoint
CREATE INDEX `alert_type_idx` ON `alerts` (`alertType`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `alerts` (`severity`);--> statement-breakpoint
CREATE INDEX `is_resolved_idx` ON `alerts` (`isResolved`);--> statement-breakpoint
CREATE INDEX `alert_created_at_idx` ON `alerts` (`createdAt`);