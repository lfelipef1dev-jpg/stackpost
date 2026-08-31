import { getSupabase } from '@/lib/supabase';

interface AuditParams {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function logAudit({
  userId,
  action,
  resource,
  resourceId,
  metadata = {},
  ip,
  userAgent,
}: AuditParams) {
  const supabase = getSupabase();
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId,
    metadata,
    ip_address: ip || null,
    user_agent: userAgent || null,
    created_at: new Date().toISOString(),
  });
}
