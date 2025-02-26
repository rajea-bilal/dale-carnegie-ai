import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { formatDbChat, formatDbMessage } from '@/utils/formatters';

// GET /chats/{id} - Retrieves a specific chat by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = getAuth(req);
        console.log('userId', userId);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const chatId = params?.id;
        console.log('chatId', chatId);

        // Fetch the chat and verify it belongs to the current user
        const { rows } = await sql`
      SELECT * FROM chats 
      WHERE id = ${chatId} AND user_id = ${userId}
    `;

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Fetch messages for this chat
        const { rows: messageRows } = await sql`
      SELECT * FROM messages 
      WHERE chat_id = ${chatId}
      ORDER BY created_at ASC
    `;

        // Combine chat with its messages
        const chatData = {
            ...formatDbChat(rows[0]),
            messages: messageRows.map(formatDbMessage)
        };

        return NextResponse.json(chatData);
    } catch (error) {
        console.error('Error fetching chat:', error);
        return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }
}

// PUT /chats/{id} - Updates an existing chat
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const chatId = params?.id;
        const { updates } = await req.json();

        // First verify the chat belongs to the user
        const { rows: existingChat } = await sql`
            SELECT * FROM chats 
            WHERE id = ${chatId} AND user_id = ${userId}
        `;

        if (existingChat.length === 0) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        const now = new Date().toISOString();

        // Update the chat's basic info
        const { rows } = await sql`
            UPDATE chats 
            SET 
                title = COALESCE(${updates.title}, title),
                updated_at = ${now}
            WHERE id = ${chatId} AND user_id = ${userId}
            RETURNING *
        `;

        // If messages are provided, update them
        if (updates.messages && updates.messages.length > 0) {
            // First delete existing messages
            await sql`DELETE FROM messages WHERE chat_id = ${chatId}`;

            // Then insert the new messages
            for (const message of updates.messages) {
                await sql`
                    INSERT INTO messages (chat_id, role, content, created_at)
                    VALUES (${chatId}, ${message.role}, ${message.content}, ${message.createdAt || now})
                `;
            }
        }

        // Get the updated chat with messages
        const { rows: messageRows } = await sql`
            SELECT * FROM messages 
            WHERE chat_id = ${chatId}
            ORDER BY created_at ASC
        `;

        const chatData = {
            ...formatDbChat(rows[0]),
            messages: messageRows.map(formatDbMessage)
        };

        return NextResponse.json(chatData);
    } catch (error) {
        console.error('Error updating chat:', error);
        return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
    }
}

// DELETE /chats/{id} - Deletes a chat
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const chatId = params.id;

        // First verify the chat belongs to the user
        const { rows: existingChat } = await sql`
      SELECT * FROM chats 
      WHERE id = ${chatId} AND user_id = ${userId}
    `;

        if (existingChat.length === 0) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Delete associated messages first (cascade should handle this, but being explicit)
        await sql`DELETE FROM messages WHERE chat_id = ${chatId}`;

        // Delete the chat
        await sql`DELETE FROM chats WHERE id = ${chatId} AND user_id = ${userId}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error);
        return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }
} 