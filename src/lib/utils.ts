import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCitation(chapter: string, pageNumber: number) {
  return `${chapter}, Page ${pageNumber}`;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15);
} 