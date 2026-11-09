'use client';

import { EntityAvatar } from '@kortix/ui/entity-avatar';
import { AgentMark } from '@kortix/ui/internal/components/agent-mark';
import { DitherTextureShader } from '@kortix/ui/wallpaper-shaders';
import { HOME_GREETINGS, spaceBefore } from '@kortix/ui/workspace/home/home-greeting';
import { ArrowUpIcon, CaretDownIcon, CaretUpDownIcon, PaperclipIcon } from '@phosphor-icons/react';

import { useTranslations } from '@/i18n/use-translations';

/**
 * The right half of `/workspaces`: a blue field with a window that shows the
 * workspace being made, as the person will first see it: the sidebar's
 * workspace button and the project home (its greeting and its composer). The
 * name the person types appears in both places, so the field on the left
 * visibly becomes the workspace on the right.
 *
 * An art module (`kortix-brand` › `visual/graphic-elements.md`): the gradient
 * is legal here and nowhere in app chrome. Every stop derives from
 * `--kortix-base`, so a white-label host that re-points the brand accent
 * re-colors the field. A dither texture (`DitherTextureShader`) lies over it
 * at low opacity with an overlay blend: it adds grain without breaking the
 * gradient, and before WebGL starts the plain gradient shows. The window uses
 * the theme's own tokens, so it reads as the product in light and in dark.
 *
 * Decorative: `aria-hidden`. The form on the left carries every word a screen
 * reader needs.
 */
const FIELD_BACKGROUND = [
  'radial-gradient(120% 90% at 0% 0%, color-mix(in oklch, var(--kortix-base) 35%, white) 0%, transparent 60%)',
  'linear-gradient(160deg, color-mix(in oklch, var(--kortix-base) 70%, white) 0%, var(--kortix-base) 55%, color-mix(in oklch, var(--kortix-base) 75%, black) 100%)',
].join(', ');

/** The project home's "What's next for {name}?", the same line it shows. */
const GREETING = HOME_GREETINGS[1];

export function WorkspacePreviewArt({ name }: { name: string | null }) {
  const t = useTranslations('threads');
  const label = name?.trim() ?? '';
  return (
    <div
      aria-hidden
      data-testid="workspace-preview-art"
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background: FIELD_BACKGROUND }}
    >
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <DitherTextureShader />
      </div>

      {/* The window bleeds off the right and bottom edges: a corner of the
          product, not a framed screenshot. */}
      <div className="bg-background border-foreground/10 absolute top-[14%] -right-px -bottom-px left-[12%] flex overflow-hidden rounded-tl-xl border-t border-l shadow-xl">
        <div className="bg-sidebar border-border flex w-56 shrink-0 flex-col gap-6 border-r p-2">
          {/* The sidebar's workspace button, drawn as the real one is. */}
          <div className="bg-sidebar-row flex h-8 items-center gap-2 rounded-md px-1">
            {label ? (
              <EntityAvatar label={label} size="sm" />
            ) : (
              <span className="bg-muted size-6 shrink-0 rounded-sm" />
            )}
            <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium tracking-tight">
              {label}
            </span>
            <CaretUpDownIcon className="text-muted-foreground size-3.5 shrink-0" />
          </div>
          <div className="flex flex-col gap-3 px-2">
            {['w-20', 'w-28', 'w-16', 'w-24'].map((width) => (
              <div key={width} className="flex items-center gap-2">
                <span className="bg-muted size-4 shrink-0 rounded-sm" />
                <span className={`bg-muted h-2.5 rounded-sm ${width}`} />
              </div>
            ))}
          </div>
        </div>

        {/* The project home: the greeting over the composer. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-8">
          <div className="flex w-full max-w-md flex-col gap-4">
            <p className="text-muted-foreground text-2xl tracking-tight text-balance">
              {GREETING.before} <span className="text-foreground">{label}</span>
              {spaceBefore(GREETING.after) ? ' ' : ''}
              {GREETING.after}
            </p>
            <div className="border-border bg-card flex flex-col gap-6 rounded-2xl border p-3">
              <span className="text-muted-foreground truncate px-1 text-sm">{t('hintMentions')}</span>
              <div className="flex items-center gap-3">
                <PaperclipIcon className="text-muted-foreground size-4 shrink-0" />
                <span className="text-foreground flex min-w-0 items-center gap-1.5 text-sm">
                  <AgentMark slug="kortix" />
                  Kortix
                  <CaretDownIcon className="text-muted-foreground size-3 shrink-0" />
                </span>
                <span className="bg-muted-foreground text-background ml-auto flex size-7 shrink-0 items-center justify-center rounded-full">
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
