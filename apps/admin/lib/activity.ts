import { prisma } from '@roua/db';

export type ActivityEntityType =
  | 'page'
  | 'project'
  | 'template'
  | 'service'
  | 'testimonial'
  | 'settings'
  | 'inquiry'
  | 'media';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'unpublished'
  | 'deleted'
  | 'duplicated'
  | 'restored'
  | 'archived'
  | 'ai_generated'
  | 'find_replace';

// Best-effort write — never throws. If the ActivityLog table is missing
// (schema not yet pushed) we swallow the error so admin actions still succeed.
export async function logActivity(opts: {
  userEmail: string;
  entityType: ActivityEntityType;
  entityId: string;
  entityName?: string | null;
  action: ActivityAction;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userEmail: opts.userEmail,
        entityType: opts.entityType,
        entityId: opts.entityId,
        entityName: opts.entityName ?? null,
        action: opts.action,
        ...(opts.meta ? { meta: opts.meta as object } : {}),
      },
    });
  } catch (e) {
    // Silently ignore — activity logging shouldn't break admin actions.
    if (process.env.NODE_ENV !== 'production') console.error('logActivity:', e);
  }
}
