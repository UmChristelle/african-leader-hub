-- Merge content fields into descriptionHtml and drop old columns

-- First, update descriptionHtml by prepending content from old fields
-- Only for programs where descriptionHtml is empty or doesn't already contain the content
DO $$
DECLARE
    prog RECORD;
    merged_html TEXT;
BEGIN
    FOR prog IN SELECT id, "descriptionHtml", "backgroundHtml", "goalHtml", "whoServesHtml", "introductionHtml" FROM "Program" LOOP
        merged_html := prog."descriptionHtml";
        
        -- Prepend background if exists and not already in descriptionHtml
        IF prog."backgroundHtml" IS NOT NULL AND prog."backgroundHtml" != '' AND prog."backgroundHtml" != '<p></p>' 
           AND (merged_html IS NULL OR merged_html = '' OR merged_html NOT ILIKE '%' || replace(prog."backgroundHtml", '<p>', '') || '%') THEN
            merged_html := '<h2>Background</h2>' || prog."backgroundHtml" || merged_html;
        END IF;
        
        -- Prepend goal if exists and not already in descriptionHtml
        IF prog."goalHtml" IS NOT NULL AND prog."goalHtml" != '' AND prog."goalHtml" != '<p></p>'
           AND (merged_html IS NULL OR merged_html = '' OR merged_html NOT ILIKE '%' || replace(prog."goalHtml", '<p>', '') || '%') THEN
            merged_html := '<h2>Goal</h2>' || prog."goalHtml" || merged_html;
        END IF;
        
        -- Prepend whoServes if exists and not already in descriptionHtml
        IF prog."whoServesHtml" IS NOT NULL AND prog."whoServesHtml" != '' AND prog."whoServesHtml" != '<ul></ul>'
           AND (merged_html IS NULL OR merged_html = '' OR merged_html NOT ILIKE '%' || replace(prog."whoServesHtml", '<ul>', '') || '%') THEN
            merged_html := '<h2>Who the Program Serves</h2>' || prog."whoServesHtml" || merged_html;
        END IF;
        
        -- Prepend introduction if exists and not already in descriptionHtml
        IF prog."introductionHtml" IS NOT NULL AND prog."introductionHtml" != '' AND prog."introductionHtml" != '<p></p>'
           AND (merged_html IS NULL OR merged_html = '' OR merged_html NOT ILIKE '%' || replace(prog."introductionHtml", '<p>', '') || '%') THEN
            merged_html := '<h2>Overview</h2>' || prog."introductionHtml" || merged_html;
        END IF;
        
        -- Update the program
        IF merged_html != prog."descriptionHtml" THEN
            UPDATE "Program" SET "descriptionHtml" = merged_html WHERE id = prog.id;
        END IF;
    END LOOP;
END $$;

-- Drop old content columns
ALTER TABLE "Program" DROP COLUMN IF EXISTS "backgroundHtml";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "backgroundJson";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "goalHtml";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "goalJson";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "whoServesHtml";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "whoServesJson";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "introductionHtml";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "objectives";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "keyActivities";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "expectedOutcomes";

-- Drop old show switches
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showBackground";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showGoal";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showWhoServes";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showIntroduction";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showObjectives";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showKeyActivities";
ALTER TABLE "Program" DROP COLUMN IF EXISTS "showExpectedOutcomes";