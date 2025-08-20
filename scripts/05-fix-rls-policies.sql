-- Fix RLS policies to allow user registration
-- This script updates the user_profiles table policies to allow users to create their own profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile during sign-up
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles (when role column exists)
-- This will work once the role column is added
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT 
    USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR role IS NULL)
        )
    );

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
