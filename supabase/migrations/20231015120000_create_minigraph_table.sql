-- Create the minigraph table
CREATE TABLE minigraphs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    url VARCHAR(2048) NOT NULL,
    screenshot_url TEXT,
    facebook BOOLEAN DEFAULT FALSE,
    instagram BOOLEAN DEFAULT FALSE,
    twitter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_minigraphs_user_id ON minigraphs(user_id);

-- Enable Row Level Security
ALTER TABLE minigraphs ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to see only their own minigraphs
CREATE POLICY "Users can view their own minigraphs" ON minigraphs
    FOR SELECT USING (auth.uid() = user_id);

-- Create a policy to allow users to insert their own minigraphs
CREATE POLICY "Users can insert their own minigraphs" ON minigraphs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow users to update their own minigraphs
CREATE POLICY "Users can update their own minigraphs" ON minigraphs
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a policy to allow users to delete their own minigraphs
CREATE POLICY "Users can delete their own minigraphs" ON minigraphs
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the update_modified_column function
CREATE TRIGGER update_minigraph_modtime
    BEFORE UPDATE ON minigraphs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
