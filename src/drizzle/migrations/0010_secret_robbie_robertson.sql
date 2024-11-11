ALTER TABLE "permissions" DROP CONSTRAINT "permissions_name_unique";--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "document_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "permissionType" varchar(50) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permissions" ADD CONSTRAINT "permissions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permissions" ADD CONSTRAINT "permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN IF EXISTS "description";