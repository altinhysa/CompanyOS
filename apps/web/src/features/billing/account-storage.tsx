'use client';

import { Label } from '@kortix/ui/label';
import { Skeleton } from '@kortix/ui/skeleton';
import { StorageMeter, StorageNotice, formatStorageBytes, storageTone } from '@kortix/ui/files';
import { useAccountStorageUsage } from '@kortix/sdk/react';
import { useLocale, useTranslations } from '@/i18n/use-translations';

/**
 * Files storage of the account: the total against the plan's account limit,
 * then each project's Files against the plan's project limit, largest first.
 * The API decides every figure (`GET /drives/usage`); a member without
 * `billing.read` gets a 403 and the section stays out.
 */
export function AccountStorageSection({ accountId }: { accountId: string | undefined }) {
  const t = useTranslations('drives');
  const locale = useLocale();
  // No id: the caller's own account, as the API answers it.
  const usage = useAccountStorageUsage(accountId);

  if (usage.isLoading) {
    return (
      <section className="space-y-4">
        <Label>{t('accountStorageTitle')}</Label>
        <Skeleton className="h-24 w-full rounded-md" />
      </section>
    );
  }
  const data = usage.data;
  if (!data) return null;
  // An answer without limits (an older API) shows usage with no limit, never a crashed billing tab.
  const projectBytes = data.limits?.projectBytes ?? null;
  const accountBytes = data.limits?.accountBytes ?? null;
  const tone = storageTone(data.usedBytes, accountBytes);

  return (
    <section className="space-y-4" data-testid="account-storage">
      <Label>{t('accountStorageTitle')}</Label>
      <div className="bg-popover rounded-md border px-4 py-4">
        <StorageMeter label={t('storageLabel')} usedBytes={data.usedBytes} limitBytes={accountBytes} />
        {projectBytes !== null && accountBytes !== null ? (
          <p className="text-muted-foreground mt-2 text-xs">
            {t('accountStorageDescription', {
              project: formatStorageBytes(projectBytes, locale),
              account: formatStorageBytes(accountBytes, locale),
            })}
          </p>
        ) : null}
        {tone !== 'ok' ? (
          <div className="mt-3">
            <StorageNotice>{tone === 'full' ? t('storageFull') : t('storageNearFull')}</StorageNotice>
          </div>
        ) : null}
      </div>
      {data.projects.length === 0 ? (
        <p className="text-muted-foreground text-xs">{t('accountStorageEmpty')}</p>
      ) : (
        <ul className="bg-popover divide-border divide-y rounded-md border">
          {data.projects.map((p) => (
            <li key={p.driveId} className="px-4 py-3">
              <StorageMeter label={p.name || p.projectId} usedBytes={p.usedBytes ?? 0} limitBytes={projectBytes} />
            </li>
          ))}
        </ul>
      )}
      {!data.complete ? <p className="text-muted-foreground text-xs">{t('accountStorageIncomplete')}</p> : null}
    </section>
  );
}

/** Ring fill by how full a folder is: blue while there is room, orange near
 *  the limit, red at it. The same three states `storageTone` reports. */
const RING_TONE_COLOR = {
  ok: 'var(--kortix-blue)',
  near: 'var(--kortix-orange)',
  full: 'var(--kortix-red)',
} as const;

const RING_RADIUS = 27;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** A share of a limit as a whole percent, `<1%` for a real but tiny share. */
export function formatStorageShare(usedBytes: number, limitBytes: number | null): string | null {
  if (!limitBytes || limitBytes <= 0) return null;
  if (usedBytes <= 0) return '0%';
  const share = (usedBytes / limitBytes) * 100;
  if (share < 1) return '<1%';
  return `${Math.min(100, Math.round(share))}%`;
}

function StorageRing({
  label,
  usedBytes,
  limitBytes,
  locale,
}: {
  label: string;
  usedBytes: number;
  limitBytes: number | null;
  locale: string;
}) {
  const t = useTranslations('drives');
  const tone = storageTone(usedBytes, limitBytes);
  const share = limitBytes ? Math.min(1, usedBytes / limitBytes) : 0;
  // A real but tiny folder still shows a sliver, so it never reads as empty.
  const arc = usedBytes > 0 ? Math.max(share * RING_CIRCUMFERENCE, 1.5) : 0;
  const used = formatStorageBytes(usedBytes, locale);
  const caption = limitBytes
    ? t('storageOfLimit', { used, limit: formatStorageBytes(limitBytes, locale) })
    : t('storageUsed', { used });

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span className="relative inline-flex size-16 items-center justify-center">
        <svg viewBox="0 0 64 64" className="absolute inset-0 size-16 -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r={RING_RADIUS} fill="none" strokeWidth="7" className="stroke-muted" />
          {arc > 0 ? (
            <circle
              cx="32"
              cy="32"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              stroke={RING_TONE_COLOR[tone]}
              strokeDasharray={`${arc} ${RING_CIRCUMFERENCE}`}
            />
          ) : null}
        </svg>
        <span className="text-foreground text-xs tabular-nums">
          {formatStorageShare(usedBytes, limitBytes) ?? used}
        </span>
      </span>
      <span className="text-foreground w-full truncate text-xs font-medium" title={label}>
        {label}
      </span>
      <span className="text-muted-foreground w-full truncate text-xs tabular-nums">{caption}</span>
    </li>
  );
}

/**
 * Files storage as one card: the account total against its limit in the
 * header, then a ring per workspace against the per-workspace limit. Built for
 * the Usage page, where it sits beside the balance card: four full-width bars
 * for a few megabytes took more of the page than the balance did.
 */
export function AccountStorageCard({ accountId }: { accountId: string | undefined }) {
  const t = useTranslations('drives');
  const locale = useLocale();
  const usage = useAccountStorageUsage(accountId);

  if (usage.isLoading) {
    return <Skeleton className="h-full min-h-40 w-full rounded-md" />;
  }
  const data = usage.data;
  if (!data) return null;
  const projectBytes = data.limits?.projectBytes ?? null;
  const accountBytes = data.limits?.accountBytes ?? null;
  const tone = storageTone(data.usedBytes, accountBytes);
  const used = formatStorageBytes(data.usedBytes, locale);
  // A ring per workspace that holds files; the empty ones fold into one line,
  // so a 25-workspace account does not draw 20 rings that all read 0 bytes.
  const holding = data.projects.filter((p) => (p.usedBytes ?? 0) > 0);
  const emptyCount = data.projects.length - holding.length;

  return (
    <section
      className="bg-popover flex min-w-0 flex-col gap-4 rounded-md border px-4 py-4"
      data-testid="account-storage"
      aria-label={t('accountStorageTitle')}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-foreground text-sm font-medium">{t('accountStorageTitle')}</h3>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {accountBytes
            ? t('storageOfLimit', { used, limit: formatStorageBytes(accountBytes, locale) })
            : t('storageUsed', { used })}
        </span>
      </div>
      {holding.length === 0 ? (
        <p className="text-muted-foreground text-xs">{t('accountStorageEmpty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
          {holding.map((p) => (
            <StorageRing
              key={p.driveId}
              label={p.name || p.projectId}
              usedBytes={p.usedBytes ?? 0}
              limitBytes={projectBytes}
              locale={locale}
            />
          ))}
        </ul>
      )}
      {holding.length > 0 && emptyCount > 0 ? (
        <p className="text-muted-foreground text-xs">{t('emptyWorkspaces', { count: emptyCount })}</p>
      ) : null}
      {tone !== 'ok' ? (
        <StorageNotice>{tone === 'full' ? t('storageFull') : t('storageNearFull')}</StorageNotice>
      ) : null}
      {!data.complete ? (
        <p className="text-muted-foreground text-xs">{t('accountStorageIncomplete')}</p>
      ) : null}
    </section>
  );
}
