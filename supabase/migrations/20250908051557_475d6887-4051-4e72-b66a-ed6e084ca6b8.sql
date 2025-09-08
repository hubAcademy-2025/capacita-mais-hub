-- Update existing meeting to have proper host_user_id
UPDATE meetings 
SET host_user_id = (
  SELECT cp.professor_id 
  FROM class_professors cp 
  WHERE cp.class_id = meetings.class_id 
  LIMIT 1
)
WHERE host_user_id IS NULL;