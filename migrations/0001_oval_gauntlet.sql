CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text,
	`date` integer NOT NULL,
	`type` text DEFAULT 'article' NOT NULL,
	`image` text,
	`textColor` text DEFAULT 'defaultText',
	`backgroundColor` text DEFAULT 'defaultBackground',
	`_deleted_at` integer
);
--> statement-breakpoint
ALTER TABLE `statuses` ADD `image` text;