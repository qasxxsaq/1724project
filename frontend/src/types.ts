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
};

export type Ticket = {
  id: string;
  code: string;
  eventId: string;
  userId: string;
  createdAt: string;
  event?: Event;
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

