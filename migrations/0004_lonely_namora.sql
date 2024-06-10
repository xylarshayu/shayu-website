-- Custom SQL migration file, put you code below! --
CREATE TABLE `posts_new` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `text` text,
  `date` integer NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  `type` text DEFAULT 'article' NOT NULL,
  `image` text,
  `textColor` text DEFAULT 'var(--defaultText)',
  `backgroundColor` text DEFAULT 'var(--defaultBackground)',
  `_deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `posts_new` (`id`, `title`, `slug`, `text`, `date`, `type`, `image`, `textColor`, `backgroundColor`, `_deleted_at`)
SELECT `id`, `title`, `slug`, `text`, `date`, `type`, `image`, `textColor`, `backgroundColor`, `_deleted_at` FROM `posts`;
--> statement-breakpoint
DROP TABLE `posts`;
--> statement-breakpoint
ALTER TABLE `posts_new` RENAME TO `posts`;