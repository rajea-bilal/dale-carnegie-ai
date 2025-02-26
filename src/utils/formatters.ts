// Convert snake_case database fields to camelCase
export function formatDbChat(dbChat: any) {
    if (!dbChat) return null;

    return {
        id: dbChat.id,
        title: dbChat.title,
        createdAt: dbChat.created_at,
        updatedAt: dbChat.updated_at,
    };
}

// Convert snake_case database message fields to camelCase
export function formatDbMessage(dbMessage: any) {
    if (!dbMessage) return null;

    return {
        id: dbMessage.id,
        role: dbMessage.role,
        content: dbMessage.content,
        createdAt: dbMessage.created_at
    };
} 