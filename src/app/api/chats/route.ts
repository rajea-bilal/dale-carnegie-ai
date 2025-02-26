import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getAuth } from "@clerk/nextjs/server";
import { formatDbChat, formatDbMessage } from '@/utils/formatters';

// GET /chats - Retrieves all chats for the current user with their messages
export async function GET(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First get all chats
        const { rows: chats } = await sql`
            SELECT * FROM chats 
            WHERE user_id = ${userId} 
            ORDER BY updated_at DESC
        `;

        // For each chat, get its messages
        const chatsWithMessages = await Promise.all(
            chats.map(async (chat) => {
                const { rows: messages } = await sql`
                    SELECT * FROM messages 
                    WHERE chat_id = ${chat.id}
                    ORDER BY created_at ASC
                `;

                return {
                    ...formatDbChat(chat),
                    messages: messages.map(formatDbMessage)
                };
            })
        );

        return NextResponse.json(chatsWithMessages);
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }
}

// POST /chats - Creates a new chat for the current user
export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Handle the case where body might be undefined
        let title = "New Chat";
        try {
            const body = await req.json();
            if (body.chatData && body.chatData.title) {
                title = body.chatData.title;
            } else if (body.title) {
                title = body.title;
            }
        } catch (e) {
            // If JSON parsing fails, use default title
            console.log("Could not parse request body, using default title");
        }

        const now = new Date().toISOString();

        const { rows } = await sql`
            INSERT INTO chats (title, user_id, created_at, updated_at)
            VALUES (${title}, ${userId}, ${now}, ${now})
            RETURNING *
        `;

        return NextResponse.json(formatDbChat(rows[0]), { status: 201 });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }
} 