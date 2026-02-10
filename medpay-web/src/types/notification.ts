export interface Notification {
  id: string;
  hospitalId: string | null;
  userId: string;
  type: string;
  title: string;
  content: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  channel: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}
