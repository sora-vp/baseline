CREATE TABLE `sora_candidate` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`counter` int NOT NULL DEFAULT 0,
	`image` varchar(100) NOT NULL,
	CONSTRAINT `sora_candidate_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sora_participant` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`sub_part` varchar(50) NOT NULL,
	`qr_id` varchar(30),
	`already_attended` boolean NOT NULL DEFAULT false,
	`attended_at` timestamp,
	`already_choosing` boolean NOT NULL DEFAULT false,
	`choosing_at` timestamp,
	CONSTRAINT `sora_participant_id` PRIMARY KEY(`id`),
	CONSTRAINT `qr_id_unique_index` UNIQUE(`qr_id`)
);
--> statement-breakpoint
CREATE TABLE `sora_user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`verified_at` timestamp,
	`role` enum('admin','comittee'),
	CONSTRAINT `sora_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_unique_index` UNIQUE(`email`)
);
