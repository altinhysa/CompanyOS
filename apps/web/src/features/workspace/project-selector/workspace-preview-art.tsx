'use client';

import { EntityAvatar } from '@kortix/ui/entity-avatar';
import { BlueDitherShader } from '@kortix/ui/wallpaper-shaders';
import { CaretUpDownIcon } from '@phosphor-icons/react';

/**
 * The right half of `/workspaces`: a blue dithered field with a window that shows the
 * workspace being made. The name the person types appears in the window's
 * sidebar, in the same tile and row the real sidebar draws
 * (`WorkspaceSwitcher`), so the field on the left visibly becomes the thing
 * on the right.
 *
 * An art module (`kortix-brand` › `visual/graphic-elements.md`): the blue
 * gradient is legal here and nowhere in app chrome. Every stop derives from
 * `--kortix-base`, so a white-label host that re-points the brand accent
 * re-colors the field. The window inside uses the theme's own surface
 * tokens, so it reads as the product in light and in dark.
 *
 * Decorative: `aria-hidden`. The form on the left carries every word a screen
 * reader needs.
 */
const FIELD_BACKGROUND = [
  'radial-gradient(120% 90% at 0% 0%, color-mix(in oklch, var(--kortix-base) 35%, white) 0%, transparent 60%)',
  'linear-gradient(160deg, color-mix(in oklch, var(--kortix-base) 70%, white) 0%, var(--kortix-base) 55%, color-mix(in oklch, var(--kortix-base) 75%, black) 100%)',
].join(', ');

export function WorkspacePreviewArt({ name }: { name: string | null }) {
  const label = name?.trim() ?? '';
  return (
    <div
      aria-hidden
      data-testid="workspace-preview-art"
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background: FIELD_BACKGROUND }}
    >
      {/* The dithered field (WebGL) over the CSS gradient above, which
          stays as the fallback while the shader loads. */}
      <BlueDitherShader />
      {/* The window bleeds off the right and bottom edges: a corner of the
          product, not a framed screenshot. */}
      <div className="bg-background border-foreground/10 absolute top-[14%] -right-px -bottom-px left-[12%] flex overflow-hidden rounded-tl-xl border-t border-l shadow-xl">
        <div className="bg-sidebar border-border flex w-56 shrink-0 flex-col gap-6 border-r p-3">
          <div className="flex items-center gap-2 px-1">
            {label ? (
              <EntityAvatar label={label} size="sm" />
            ) : (
              <span className="bg-muted size-6 shrink-0 rounded-sm" />
            )}
            {label ? (
              <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium tracking-tight">
                {label}
              </span>
            ) : (
              <span className="bg-muted h-3 w-24 rounded-sm" />
            )}
            <CaretUpDownIcon className="text-muted-foreground size-3.5 shrink-0" />
          </div>
          <div className="flex flex-col gap-3 px-1">
            {['w-20', 'w-28', 'w-16', 'w-24'].map((width) => (
              <div key={width} className="flex items-center gap-2">
                <span className="bg-muted size-4 shrink-0 rounded-sm" />
                <span className={`bg-muted h-2.5 rounded-sm ${width}`} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-end gap-3 p-8">
          <span className="bg-muted h-2.5 w-1/2 rounded-sm" />
          <span className="bg-muted h-2.5 w-3/4 rounded-sm" />
          <div className="border-border bg-card mt-3 h-24 w-full max-w-md rounded-xl border" />
        </div>
      </div>
    </div>
  );
}
