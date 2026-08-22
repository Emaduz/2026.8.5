CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientNameEn` varchar(255),
	`clientNameAr` varchar(255),
	`role` varchar(255) NOT NULL,
	`roleEn` varchar(255),
	`roleAr` varchar(255),
	`quote` text NOT NULL,
	`quoteEn` text,
	`quoteAr` text,
	`avatarUrl` text,
	`published` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
