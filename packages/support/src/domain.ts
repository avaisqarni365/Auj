import { z } from 'zod';

/** Ticket lifecycle: OPEN (awaiting staff) → PENDING (awaiting customer) → RESOLVED → CLOSED. */
export const TicketStatusSchema = z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const TicketCategorySchema = z.enum(['BOOKING', 'VISA', 'PAYMENT', 'GENERAL']);
export type TicketCategory = z.infer<typeof TicketCategorySchema>;

export type TicketAuthor = 'USER' | 'STAFF';

export interface TicketMessage {
  author: TicketAuthor;
  authorName: string;
  body: string;
  at: string; // ISO-8601
}

export interface Ticket {
  id: string;
  ref: string; // human-shareable, e.g. AUJ-T-3F9A2C
  userId: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  bookingRef?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export const OpenTicketSchema = z.object({
  subject: z.string().min(3, 'Give your request a short subject'),
  category: TicketCategorySchema.default('GENERAL'),
  body: z.string().min(1, 'Describe how we can help'),
  bookingRef: z.string().optional(),
});
export type OpenTicketInput = z.infer<typeof OpenTicketSchema>;
