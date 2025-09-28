
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text(255) NOT NULL,
	`auth` text(255) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`user_id` integer,
	'_deleted_at' integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_endpoint_unique` ON `subscriptions` (`endpoint`);
