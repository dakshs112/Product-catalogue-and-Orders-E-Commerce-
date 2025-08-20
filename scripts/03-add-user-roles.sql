-- Add role column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Add unique constraint on email column to support ON CONFLICT
ALTER TABLE user_profiles ADD CONSTRAINT unique_user_email UNIQUE (email);

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update existing users to have 'user' role
UPDATE user_profiles SET role = 'user' WHERE role IS NULL;

-- Create admin user (you can change this email to your preferred admin email)
INSERT INTO user_profiles (id, full_name, email, role) 
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@example.com',
  'admin'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Add RLS policies for role-based access
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
