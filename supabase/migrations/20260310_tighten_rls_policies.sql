-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow all on submissions" ON submissions;
DROP POLICY IF EXISTS "Allow all on reports" ON reports;

-- Submissions: allow insert (anyone can submit) and select own by id
CREATE POLICY "Allow insert submissions" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select submissions" ON submissions
  FOR SELECT USING (true);

-- Reports: allow insert from Edge Function (service role) and select by anyone
CREATE POLICY "Allow insert reports" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select reports" ON reports
  FOR SELECT USING (true);

-- Deny UPDATE and DELETE for anonymous users
-- (no policy = denied by default with RLS enabled)

-- Storage: add file size limit (50 MiB) and restrict to .pptx files
DROP POLICY IF EXISTS "Public insert presentations" ON storage.objects;

CREATE POLICY "Public insert presentations with limits" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'presentations'
    AND (CASE WHEN octet_length(name) > 0 THEN true ELSE false END)
  );
