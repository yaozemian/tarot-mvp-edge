CREATE TABLE `reading_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question` text NOT NULL,
	`mode` text NOT NULL,
	`cards_json` text NOT NULL,
	`ai_summary` text NOT NULL,
	`ai_full_text` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reading_records_user_created_idx` ON `reading_records` (`user_id`,`created_at`);
