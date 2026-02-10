export interface AuditLog {
  id: number;
  hospitalId: string | null;
  userId: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestUri: string | null;
  requestMethod: string | null;
  description: string | null;
  createdAt: string;
}
