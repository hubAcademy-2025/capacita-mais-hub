-- Insert a test meeting for demonstration
INSERT INTO meetings (
  title,
  description,
  date_time,
  duration,
  class_id,
  status
) VALUES (
  'Aula de Introdução ao Sistema',
  'Primeira aula demonstrativa do sistema',
  NOW() + INTERVAL '1 hour',
  60,
  (SELECT id FROM classes LIMIT 1),
  'scheduled'
);