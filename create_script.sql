PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "user_entity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uuid" varchar NOT NULL, "created_at" integer NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_40ee3aba50fe5a16602bf4614df" UNIQUE ("uuid"), CONSTRAINT "UQ_9b998bada7cff93fcb953b0c37e" UNIQUE ("username"));
INSERT INTO user_entity VALUES(1,'e3959ba9-d16d-4ddd-ae52-1d64c26d70a4',1737909706767,'admin','administrator');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('user_entity',1);
COMMIT;
