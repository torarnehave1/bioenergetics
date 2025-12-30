-- Body Experience App Database Schema
-- D1 SQLite Database

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  consent_tracking INTEGER DEFAULT 0,
  instructor_id TEXT,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Magic link tokens for authentication
CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions for authenticated users
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reich's 7 body segments
CREATE TABLE IF NOT EXISTS body_segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  color TEXT
);

-- Insert default body segments (Reich's 7 segments)
INSERT OR IGNORE INTO body_segments (id, name, description, order_index, color) VALUES
  ('ocular', 'Ocular', 'Eyes, forehead, scalp - visual perception and expression', 1, '#8B5CF6'),
  ('oral', 'Oral', 'Mouth, jaw, throat - oral expression and intake', 2, '#EC4899'),
  ('cervical', 'Cervical', 'Neck and upper shoulders - control and vulnerability', 3, '#3B82F6'),
  ('thoracic', 'Thoracic', 'Chest, arms, hands - heartfelt emotions and reaching', 4, '#10B981'),
  ('diaphragmatic', 'Diaphragmatic', 'Diaphragm, solar plexus - breath and anxiety', 5, '#F59E0B'),
  ('abdominal', 'Abdominal', 'Abdomen, lower back - gut feelings and support', 6, '#EF4444'),
  ('pelvic', 'Pelvic', 'Pelvis, legs, feet - grounding and sexuality', 7, '#6366F1');

-- Exercise categories
CREATE TABLE IF NOT EXISTS exercise_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default exercise categories
INSERT OR IGNORE INTO exercise_categories (id, name, description, icon) VALUES
  ('grounding', 'Grounding', 'Exercises to connect with the earth and body', 'earth'),
  ('breathing', 'Breathing', 'Breath awareness and regulation exercises', 'wind'),
  ('body_segments', 'Body Segments', 'Work with specific body segments', 'body'),
  ('expression', 'Expression', 'Emotional expression and release exercises', 'voice'),
  ('movement', 'Movement', 'Movement and flow exercises', 'movement');

-- Exercise library
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  duration_minutes INTEGER,
  category_id TEXT,
  target_segments TEXT, -- JSON array of segment IDs
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  safety_notes TEXT,
  created_by TEXT,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES exercise_categories(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert some default exercises
INSERT OR IGNORE INTO exercises (id, title, description, instructions, duration_minutes, category_id, target_segments, difficulty, safety_notes, is_public) VALUES
  ('grounding-basic', 'Basic Grounding', 'Simple standing grounding exercise',
   'Stand with feet hip-width apart. Bend knees slightly. Feel your weight pressing into the floor. Breathe naturally and notice sensations in your feet and legs.',
   5, 'grounding', '["pelvic"]', 'beginner', 'Stop if you feel dizzy. Keep breathing naturally.', 1),
  ('breathing-awareness', 'Breath Awareness', 'Notice your natural breathing pattern',
   'Sit or lie comfortably. Place one hand on chest, one on belly. Notice which hand moves more. Do not try to change anything, just observe.',
   10, 'breathing', '["thoracic", "diaphragmatic", "abdominal"]', 'beginner', 'If anxiety increases, open your eyes and ground yourself.', 1),
  ('jaw-release', 'Jaw Release', 'Release tension in the jaw and oral segment',
   'Gently open and close your mouth. Let your jaw hang loose. Make soft sounds. Notice any tension or holding.',
   5, 'body_segments', '["oral"]', 'beginner', 'Be gentle. Do not force any movement.', 1);

-- Body experience logs (main tracking table)
CREATE TABLE IF NOT EXISTS body_experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id TEXT,
  experience_type TEXT DEFAULT 'general' CHECK (experience_type IN ('before', 'after', 'general')),
  session_id TEXT, -- Groups before/after experiences
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 10),
  grounding_rating INTEGER CHECK (grounding_rating BETWEEN 1 AND 10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Segment sensations within a body experience
CREATE TABLE IF NOT EXISTS segment_sensations (
  id TEXT PRIMARY KEY,
  experience_id TEXT NOT NULL,
  segment_id TEXT NOT NULL,
  sensation_type TEXT, -- e.g., 'tension', 'warmth', 'tingling', 'numbness', 'pain', 'pleasure', 'neutral'
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  notes TEXT,
  FOREIGN KEY (experience_id) REFERENCES body_experiences(id),
  FOREIGN KEY (segment_id) REFERENCES body_segments(id)
);

-- Safety check-ins for emotional/physical responses
CREATE TABLE IF NOT EXISTS safety_checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  experience_id TEXT,
  feeling_safe INTEGER DEFAULT 1,
  needs_support INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (experience_id) REFERENCES body_experiences(id)
);

-- Instructor-student relationships
CREATE TABLE IF NOT EXISTS instructor_students (
  id TEXT PRIMARY KEY,
  instructor_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  consent_given INTEGER DEFAULT 0,
  consent_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE(instructor_id, student_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_body_experiences_user ON body_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_body_experiences_session ON body_experiences(session_id);
CREATE INDEX IF NOT EXISTS idx_segment_sensations_experience ON segment_sensations(experience_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
