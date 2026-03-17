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
  code: string;
  eventId: string;
  userId: string;
  purchasePrice: number;
  discountApplied: boolean;
  createdAt: string;
  event?: Event;
};

export type TicketSale = {
  id: string;
  code: string;
  purchasedAt: string;
  purchasePrice: number;
  discountApplied: boolean;
  buyerUsername: string;
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

