CREATE TABLE `statuses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text,
	`date` integer NOT NULL,
	`theme` text DEFAULT 'light' NOT NULL,
	`mood` text DEFAULT 'neutral' NOT NULL,
	`spotify_link` text,
	`_deleted_at` integer
);
