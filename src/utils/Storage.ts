import { Message } from "@/types";

export interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// DEPRECATED: Use the database instead

// export class ChatStorage {
//   private static readonly CHATS_KEY = 'chats';

//   static initialize(): void {
//     if (!this.getAllChats().length) {
//       const now = new Date().toISOString();
//       const initialChat: ChatData = {
//         id: crypto.randomUUID(),
//         title: 'New Chat',
//         messages: [],
//         createdAt: now,
//         updatedAt: now
//       };
//       this.createChat(initialChat);
//     }
//   }

//   static getAllChats(): ChatData[] {
//     const chats = localStorage.getItem(this.CHATS_KEY);
//     return chats ? JSON.parse(chats) : [];
//   }

//   static getChat(id: string): ChatData | null {
//     const chats = this.getAllChats();
//     return chats.find(chat => chat.id === id) || null;
//   }

//   static createChat(chat: ChatData): void {
//     const chats = this.getAllChats();
//     chats.push(chat);
//     localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
//   }

//   static updateChat(id: string, updates: Partial<ChatData>): void {
//     const chats = this.getAllChats();
//     const index = chats.findIndex(chat => chat.id === id);
//     if (index !== -1) {
//       chats[index] = {
//         ...chats[index],
//         ...updates,
//         updatedAt: new Date().toISOString()
//       };
//       localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
//     }
//   }

//   static deleteChat(id: string): void {
//     let chats = this.getAllChats();
//     chats = chats.filter(chat => chat.id !== id);
//     if (chats.length === 0) {
//       // Ensure there's always at least one chat
//       const now = new Date().toISOString();
//       chats.push({
//         id: crypto.randomUUID(),
//         title: 'New Chat',
//         messages: [],
//         createdAt: now,
//         updatedAt: now
//       });
//     }
//     localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
//   }
// }
