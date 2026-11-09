'use client';

import { EntityAvatar } from '@kortix/ui/entity-avatar';
import { AgentMark } from '@kortix/ui/internal/components/agent-mark';
import { CustomizeGlyph } from '@kortix/ui/internal/layout/project-settings-nav';
import { DitherTextureShader } from '@kortix/ui/wallpaper-shaders';
import { HOME_GREETINGS, spaceBefore } from '@kortix/ui/workspace/home/home-greeting';
import {
  AppWindowIcon,
  ArrowUpIcon,
  CardsThreeIcon,
  CaretDownIcon,
  CaretUpDownIcon,
  GearSixIcon,
  HardDrivesIcon,
  MagnifyingGlassIcon,
  NavigationArrowIcon,
  PaperclipIcon,
  SidebarSimpleIcon,
  TargetIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { useTranslations } from '@/i18n/use-translations';

/**
 * The right half of `/workspaces` and `/workspaces/new`: a blue field with a
 * window that shows the workspace being made as the person will first see
 * it, the project home. It copies the real screen: the sidebar (workspace
 * button, the six nav rows, Sessions) and the home (its greeting over the
 * composer). Only the name the person types is live; the content a new
 * workspace does not have yet (sessions, the prompt, the model) is drawn as
 * skeleton bars.
 *
 * An art module (`kortix-brand` › `visual/graphic-elements.md`): the gradient
 * is legal here and nowhere in app chrome. Every stop derives from
 * `--kortix-base`, so a white-label host that re-points the brand accent
 * re-colors the field. A dither texture (`DitherTextureShader`) lies over it
 * at low opacity with an overlay blend: it adds grain without breaking the
 * gradient, fades in when its canvas arrives, and before WebGL starts the
 * plain gradient shows. The window uses the theme's own tokens, so it reads
 * as the product in light and in dark.
 *
 * Decorative: `aria-hidden`. The form on the left carries every word a screen
 * reader needs.
 */
const FIELD_BACKGROUND = [
  'radial-gradient(120% 90% at 0% 0%, color-mix(in oklch, var(--kortix-base) 35%, white) 0%, transparent 60%)',
  'linear-gradient(160deg, color-mix(in oklch, var(--kortix-base) 70%, white) 0%, var(--kortix-base) 55%, color-mix(in oklch, var(--kortix-base) 75%, black) 100%)',
].join(', ');

/** The project home's dotted ground, in the theme's own ink. */
const HOME_GROUND = {
  backgroundImage: 'radial-gradient(color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 1px)',
  backgroundSize: '18px 18px',
};

/** The project home's "What's next for {name}?", the same line it shows. */
const GREETING = HOME_GREETINGS[1];

/** The Sessions list: skeleton titles at uneven lengths, as real titles are. */
const SESSION_WIDTHS = ['w-32', 'w-28', 'w-36', 'w-24', 'w-32', 'w-20', 'w-28', 'w-36', 'w-24'];

function Bar({ className }: { className: string }) {
  return <span className={`bg-muted block h-2 rounded-full ${className}`} />;
}

function NavRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="text-sidebar-foreground flex h-8 items-center gap-2 px-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

export function WorkspacePreviewArt({ name }: { name: string | null }) {
  const t = useTranslations('sidebar');
  const tUi = useTranslations('hardcodedUi.i18nComplete');
  const label = name?.trim() ?? '';
  return (
    <div
      aria-hidden
      data-testid="workspace-preview-art"
      className="relative h-full w-full overflow-hidden rounded-lg"
      style={{ background: FIELD_BACKGROUND }}
    >
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <DitherTextureShader />
      </div>

      {/* The window bleeds off the right and bottom edges: a corner of the
          product, not a framed screenshot. */}
      <div className="bg-background border-foreground/10 absolute top-[12%] -right-px -bottom-px left-[10%] flex overflow-hidden rounded-tl-md border-t border-l shadow-xl">
        <div className="bg-sidebar border-border flex w-60 shrink-0 flex-col gap-1 border-r p-2">
          <div className="flex h-9 items-center gap-1 pr-1">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
              {label ? (
                <EntityAvatar label={label} size="sm" />
              ) : (
                <span className="bg-muted size-6 shrink-0 rounded-sm" />
              )}
              <span className="text-foreground min-w-0 truncate text-sm font-medium tracking-tight">{label}</span>
              <CaretUpDownIcon className="text-muted-foreground size-3.5 shrink-0" />
            </div>
            <MagnifyingGlassIcon className="text-sidebar-foreground size-4 shrink-0" />
            <SidebarSimpleIcon className="text-sidebar-foreground size-4 shrink-0" />
          </div>

          <div className="flex flex-col">
            <NavRow icon={<NavigationArrowIcon className="rotate-90" />} label={t('newSession')} />
            <NavRow icon={<CustomizeGlyph />} label={t('customize')} />
            <NavRow icon={<HardDrivesIcon />} label={t('drive')} />
            <NavRow icon={<AppWindowIcon />} label={tUi.raw('text89dd748442c1')} />
            <NavRow icon={<TargetIcon />} label={t('goals')} />
            <NavRow icon={<CardsThreeIcon />} label={t('artifacts')} />
          </div>

          <span className="text-muted-foreground mt-4 px-2 pb-1 text-sm">{t('sessions')}</span>
          <div className="flex flex-col">
            {SESSION_WIDTHS.map((width, index) => (
              <div key={index} className="flex h-8 items-center gap-2 px-2">
                <span className="border-muted-foreground/40 size-3.5 shrink-0 rounded-full border" />
                <Bar className={width} />
              </div>
            ))}
          </div>
        </div>

        {/* The project home: the greeting over the composer. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-10" style={HOME_GROUND}>
          <div className="flex w-full max-w-lg flex-col gap-4">
            <p className="text-muted-foreground text-2xl tracking-tight text-balance">
              {GREETING.before} <span className="text-foreground">{label}</span>
              {spaceBefore(GREETING.after) ? ' ' : ''}
              {GREETING.after}
            </p>
            <div className="border-border bg-background flex flex-col gap-8 rounded-xl border p-3">
              <Bar className="mt-1 ml-1 w-40" />
              <div className="flex items-center gap-3">
                <PaperclipIcon className="text-muted-foreground size-4 shrink-0" />
                <span className="text-foreground flex min-w-0 items-center gap-1.5 text-sm">
                  <AgentMark slug="kortix" />
                  Kortix
                  <CaretDownIcon className="text-muted-foreground size-3 shrink-0" />
                </span>
                <Bar className="w-24" />
                <GearSixIcon className="text-muted-foreground ml-auto size-4 shrink-0" />
                <span className="bg-muted-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-full">
                  <ArrowUpIcon className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
