-- Update the meeting to be in the past so it appears as available to join
UPDATE meetings 
SET date_time = NOW() - INTERVAL '30 minutes',
    status = 'live'
WHERE id = 'f73828bf-8676-4caa-80f2-4adc26341fbb';

-- Also add the admin user to the class so they can see the meeting
INSERT INTO enrollments (student_id, class_id, progress) 
VALUES ('7fb40508-a6e3-4f3a-a871-a1d2f95ad925', '1cac5c04-b220-4ad8-80a2-022151641610', 0)
ON CONFLICT DO NOTHING;