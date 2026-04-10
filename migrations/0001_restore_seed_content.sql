CREATE TABLE IF NOT EXISTS "stewardship_types" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "group" text DEFAULT 'testimony' NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stewardship_types_name_unique') THEN
    ALTER TABLE "stewardship_types" ADD CONSTRAINT "stewardship_types_name_unique" UNIQUE("name");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stewardship_types_slug_unique') THEN
    ALTER TABLE "stewardship_types" ADD CONSTRAINT "stewardship_types_slug_unique" UNIQUE("slug");
  END IF;
END $$;

INSERT INTO "stewardship_types" ("name", "slug", "group", "order", "is_active")
VALUES
  ('Debt Freedom', 'debt-freedom', 'testimony', 1, true),
  ('Business Breakthrough', 'business-breakthrough', 'testimony', 2, true),
  ('Family Restoration', 'family-restoration', 'testimony', 3, true),
  ('Job Miracle', 'job-miracle', 'testimony', 4, true),
  ('Home Purchased', 'home-purchased', 'testimony', 5, true),
  ('Investment Win', 'investment-win', 'testimony', 6, true),
  ('General', 'general', 'testimony', 7, true)
ON CONFLICT ("slug") DO UPDATE
SET "name" = EXCLUDED."name",
    "group" = EXCLUDED."group",
    "order" = EXCLUDED."order",
    "is_active" = EXCLUDED."is_active";

INSERT INTO "songs" ("title", "artist", "category", "song_key", "tempo", "display_on")
VALUES
  ('How Great Thou Art', 'Traditional', 'Hymn', 'G', '72 BPM', 'both'),
  ('Great Is Thy Faithfulness', 'Traditional', 'Hymn', 'C', '68 BPM', 'worship'),
  ('Way Maker', 'Sinach', 'Worship', 'E', '76 BPM', 'both'),
  ('Goodness of God', 'Bethel Music', 'Contemporary', 'G', '63 BPM', 'sing-along')
ON CONFLICT DO NOTHING;

INSERT INTO "quiz_questions" ("scripture", "question", "option_a", "option_b", "option_c", "option_d", "correct_option")
VALUES
  ('Matthew 6:24', 'According to Jesus, what cannot a person serve two masters of at the same time?', 'God and man', 'God and Money', 'Truth and lies', 'Faith and fear', 1),
  ('Proverbs 22:7', 'What does Proverbs 22:7 say about the borrower?', 'The borrower is wise', 'The borrower is free', 'The borrower is slave to the lender', 'The borrower is blessed', 2),
  ('Malachi 3:10', 'What does God challenge us to do in Malachi 3:10 to test His faithfulness?', 'Pray without ceasing', 'Bring the full tithe into the storehouse', 'Give to the poor generously', 'Fast and seek His face', 1)
ON CONFLICT DO NOTHING;

INSERT INTO "word_search_words" ("word", "category")
VALUES
  ('BETHLEHEM', 'places'),
  ('JERUSALEM', 'places'),
  ('NAZARETH', 'places'),
  ('MATTHEW', 'books'),
  ('MARK', 'books'),
  ('LUKE', 'books'),
  ('JOHN', 'books')
ON CONFLICT DO NOTHING;
