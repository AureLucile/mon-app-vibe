-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  audience TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL,
  overall_score NUMERIC NOT NULL,
  criteria_scores JSONB NOT NULL,
  strengths JSONB NOT NULL,
  improvements JSONB NOT NULL,
  suggestions JSONB NOT NULL,
  encouragement TEXT NOT NULL,
  improved_storage_path TEXT,
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth for this app)
CREATE POLICY "Allow all on submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on reports" ON reports FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for presentations
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentations', 'presentations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public upload/read on presentations bucket
CREATE POLICY "Public read presentations" ON storage.objects
  FOR SELECT USING (bucket_id = 'presentations');

CREATE POLICY "Public insert presentations" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'presentations');
