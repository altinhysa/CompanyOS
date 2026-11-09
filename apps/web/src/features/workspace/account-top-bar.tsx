'use client';

import { CaretDownIcon, GearSixIcon, SignOutIcon } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@kortix/ui';
import { Button } from '@kortix/ui/button';
import { BackPillBody, backPillClass } from '@kortix/ui/back-pill';
import { EntityAvatar } from '@kortix/ui/entity-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kortix/ui/dropdown-menu';
import Loading from '@kortix/ui/loading';
import { useTranslations } from '@/i18n/use-translations';

// Client only: the inbox is per signed-in person and polls, so the server
// renders no button and these pages' static tests need no query client.
const InboxButton = dynamic(
  () => import('@/features/notifications/inbox-button').then((mod) => mod.InboxButton),
  { ssr: false },
);

/**
 * The top row of the account-level pages that sit outside a project —
 * `/workspaces` and `/workspaces/new`.
 *
 * Left: an optional way back. Right: the Inbox button (KRTX-1742: the unread
 * count, opens `/inbox`), then who you are, as a button. Log out lives
 * in its menu rather than as a bare button in the corner — it is the rarest
 * action on these pages, and the identity above it is what a user checks
 * first ("am I in the right account?").
 *
 * Presentational on purpose: the page owns sign-out (`performSignOut` replaces
 * the document, so `signingOut` is never cleared) and passes the state in.
 *
 * `kx-desktop-band-row` keeps the row under the desktop title-bar band, clear
 * of the macOS traffic lights and the Win/Linux window controls.
 */
export function AccountTopBar({
  email,
  name,
  signingOut,
  onLogOut,
  back,
  leading,
  trailing,
  inbox = true,
  pinned = false,
  className,
}: {
  email: string | null;
  name?: string | null;
  signingOut: boolean;
  onLogOut: () => void;
  /** Rendered as a ghost link on the left. Omit on a page with nowhere to go back to. */
  back?: { href: string; label: string };
  /** Shown on the left when there is no `back` link (the Kortix mark on `/workspaces`). */
  leading?: ReactNode;
  /** Extra controls after the account button (the desktop close button). */
  trailing?: ReactNode;
  /** The Inbox button. Off on `/inbox` itself, where it would open the page on screen. */
  inbox?: boolean;
  /**
   * Keep the row on screen while the page scrolls, at `lg` and up only
   * (`/workspaces`, `/workspaces/new`). On a phone the row scrolls away with
   * the page, so it never covers the form under the thumb.
   */
  pinned?: boolean;
  /** Layout overrides for the row (the `/workspaces` split keeps it over the left half). */
  className?: string;
}) {
  const t = useTranslations('newWorkspace');
  const identity = name?.trim() || email;

  return (
    <div
      className={cn(
        'kx-desktop-band-row absolute inset-x-0 top-3 z-10 flex items-center justify-between gap-3 px-4 sm:top-4 sm:px-6',
        // Pinned at `lg`: fixed, on the page background, so content that
        // scrolls under it never collides with the logo or the account.
        // The padding keeps the controls where `top-4` put them; the desktop
        // app's band offset replaces it (`kx-pinned-account-row`).
        pinned && 'kx-pinned-account-row lg:bg-background lg:fixed lg:top-0 lg:pt-4 lg:pb-2',
        className,
      )}
    >
      {back ? (
        // The web needs an in-page exit; Electron supplies Back in its band.
        <Button
          asChild
          variant="ghost"
          size="xs"
          className={backPillClass('kx-web-only-back')}
        >
          <Link href={back.href}>
            <BackPillBody label={back.label} />
          </Link>
        </Button>
      ) : (
        (leading ?? <span aria-hidden />)
      )}

      <div className="flex min-w-0 items-center gap-2">
        {inbox ? <InboxButton /> : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={signingOut}
              aria-label={identity ? `${t('account.loggedInAs')} ${identity}` : t('account.label')}
              className="hover:bg-hover data-[state=open]:bg-hover focus-visible:ring-ring flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-left transition-colors duration-(--duration-normal) ease-out focus-visible:ring-2 focus-visible:outline-none"
            >
              {/* One line: who you are, no "Logged in as" caption. The
                  caption stays in the accessible name above. */}
              {identity ? <EntityAvatar label={identity} size="xs" /> : null}
              {/* On a phone the tile alone is the button; the address would crowd the logo. */}
              <span
                className={cn('text-foreground max-w-48 truncate text-sm', identity && 'hidden sm:inline')}
              >
                {identity ?? t('account.label')}
              </span>
              {signingOut ? (
                <Loading className="size-4 shrink-0" />
              ) : (
                <CaretDownIcon className="text-muted-foreground size-3.5 shrink-0" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Settings must be reachable from every account-level page,
                regardless of project count: with no projects this menu was
                Log out only, and /settings/profile had no link at all
                (KRTX-1327). A real anchor, so the menu closes on navigate. */}
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" prefetch>
                <GearSixIcon />
                {t('actions.settings')}
              </Link>
            </DropdownMenuItem>

            {/* Log out is the only row that ends something, so it gets its own
                group — the last item in a menu is the one a slipped pointer
                lands on. */}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={signingOut} onSelect={onLogOut}>
              <SignOutIcon />
              {signingOut ? t('actions.signingOut') : t('actions.logOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {trailing}
      </div>
    </div>
  );
}
