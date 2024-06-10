ALTER TABLE `posts` ADD `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_title_unique` ON `posts` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `titleSlug` ON `posts` (`slug`);