import { prisma } from '@roua/db';

const ACTION_LABEL: Record<string, string> = {
  created: 'created',
  updated: 'updated',
  published: 'published',
  unpublished: 'unpublished',
  deleted: 'deleted',
  duplicated: 'duplicated',
  restored: 'restored',
  archived: 'archived',
  ai_generated: 'AI-generated',
  find_replace: 'find & replaced',
};

const ENTITY_LABEL: Record<string, string> = {
  page: 'page',
  project: 'project',
  template: 'template',
  service: 'service',
  testimonial: 'testimonial',
  settings: 'settings',
  inquiry: 'inquiry',
  media: 'media',
};

export async function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const items = await prisma.activityLog
    .findMany({ orderBy: { createdAt: 'desc' }, take: limit })
    .catch(() => []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted py-4">
        No activity yet. Edits across the admin will show up here.
      </p>
    );
  }

  return (
    <ul className="border border-ink/10 divide-y divide-ink/10 bg-surface">
      {items.map((a) => (
        <li key={a.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
          <span className="text-xs uppercase tracking-widest text-muted w-16 shrink-0 hidden sm:inline">
            {ENTITY_LABEL[a.entityType] ?? a.entityType}
          </span>
          <span className="flex-1 truncate">
            <span className="text-muted">{a.userEmail.split('@')[0]}</span>{' '}
            <span className="text-ink">{ACTION_LABEL[a.action] ?? a.action}</span>
            {a.entityName && <span> &ldquo;{a.entityName}&rdquo;</span>}
          </span>
          <span className="text-[10px] text-muted shrink-0 font-mono">
            {timeAgo(a.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return date.toLocaleDateString();
}
