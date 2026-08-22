CREATE TABLE `admin_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passwordHash` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_password_reset_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
