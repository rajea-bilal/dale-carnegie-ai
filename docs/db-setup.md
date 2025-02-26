1. Create new (serverless neon) postgres db on Vercel (click on a random project, then go to "Storage", then click on "Create Database", then click on "Neon", and follow the instructions)
2. Update your .env.local with POSTGRES_URL, ... (see .env)
3. Create the tables by executing the following command in Neon SQL Editor:

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- This will store the Clerk user ID
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL,  -- 'user', 'assistant', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

