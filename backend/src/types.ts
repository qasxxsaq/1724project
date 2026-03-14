export type User = {
  id: string;
  username: string;
  password: string;
  role: "organizer" | "customer";
};

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
};

