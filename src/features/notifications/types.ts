export type NotificationItem = {
  id: string;
  type: string;
  category?: string;
  title?: string;
  message: string;
  createdAt: number;
  read: boolean;
  metadata?: Record<string, unknown>;
};
