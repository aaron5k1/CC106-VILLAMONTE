import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  description?: string;
  coverUrl?: string;
  quantity: number;
  availableCount: number;
  createdAt: Timestamp;
  isDigital?: boolean;
  content?: string;
  contentUrl?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: Timestamp;
  dueDate: Timestamp;
  returnDate: Timestamp | null;
  status: 'active' | 'returned';
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverUrl?: string;
  readingProgress?: number;
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  requestDate: Timestamp;
  status: 'pending' | 'fulfilled' | 'cancelled' | 'expired';
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverUrl?: string;
}
