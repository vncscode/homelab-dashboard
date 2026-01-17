ALTER TABLE `jexactyl_servers` ADD `domainUrl` varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE `jexactyl_servers` DROP COLUMN `apiUrl`;--> statement-breakpoint
ALTER TABLE `jexactyl_servers` DROP COLUMN `serverId`;