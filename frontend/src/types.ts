export type Event = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  price: number;
  ticketsLeft: number;
  info: string;
  organizerId: string;
  studentDiscount: boolean;
  soldCount?: number;
  revenue?: number;
  sales?: TicketSale[];
};

export type Ticket = {
  id: string;
  code: string | null;
  eventId: string;
  userId: string;
  buyerUsername?: string;
  purchasePrice: number;
  discountApplied: boolean;
  discountReviewStatus?: "pending" | "approved";
  createdAt: string;
  studentDocument?: {
    id: string;
    originalName: string | null;
    mimetype?: string | null;
    uploadedAt: string | Date | null;
  };
  event?: Event;
};

export type TicketSale = {
  id: string;
  code: string | null;
  purchasedAt: string;
  purchasePrice: number;
  discountApplied: boolean;
  discountReviewStatus?: "pending" | "approved";
  buyerUsername: string;
  buyerUserId?: string;
  studentDocument?: {
    id: string;
    originalName: string | null;
    mimetype?: string | null;
    uploadedAt: string | Date | null;
  };
};

export type Document = {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  type: string;
  userId: string;
  uploadedAt: string;
};

