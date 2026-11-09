'use client';

import { EntityAvatar } from '@kortix/ui/entity-avatar';
import { AgentMark } from '@kortix/ui/internal/components/agent-mark';
import { DitherTextureShader } from '@kortix/ui/wallpaper-shaders';
import { HOME_GREETINGS, spaceBefore } from '@kortix/ui/workspace/home/home-greeting';
import { ArrowUpIcon, CaretDownIcon, CaretUpDownIcon, GearSixIcon, PaperclipIcon } from '@phosphor-icons/react';
import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { useTranslations } from '@/i18n/use-translations';

/**
 * The right half of `/workspaces` and `/workspaces/new`: a blue field with a
 * window that shows the workspace being made as the person will first see
 * it, the project home: the sidebar's workspace button over the Sessions
 * list, and the home's greeting over the composer. The home is laid out at
 * the app's own proportions and scaled down as one picture, so it never
 * reflows into a cramped copy of itself. Only the name the person types is live; what a new
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

/** The project home's "What's next for {name}?", the same line it shows. */
const GREETING = HOME_GREETINGS[1];

/** The Sessions list: skeleton titles at uneven lengths, as real titles are. */
const SESSION_WIDTHS = ['w-40', 'w-32', 'w-44', 'w-28', 'w-36', 'w-24', 'w-40', 'w-44', 'w-28', 'w-36', 'w-32', 'w-40', 'w-24', 'w-36', 'w-44', 'w-28'];

/** The width the project home is laid out at before it is scaled to the box. */
const DESIGN_WIDTH = 960;

/** The box's size, kept current as the window resizes. Null before the first measure. */
function useBoxSize(ref: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0) setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function Bar({ className }: { className: string }) {
  return <span className={`bg-muted block h-2 rounded-full ${className}`} />;
}

export function WorkspacePreviewArt({ name }: { name: string | null }) {
  const t = useTranslations('sidebar');
  const boxRef = useRef<HTMLDivElement>(null);
  const box = useBoxSize(boxRef);
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

      {/* The window sits in the field with one fixed inset on the top and
          both sides, and bleeds off the bottom edge: the top of the product,
          not a framed screenshot. The fixed inset keeps the field an even
          frame at every window size. */}
      <div
        ref={boxRef}
        className="bg-background border-foreground/10 absolute top-12 right-12 -bottom-px left-12 overflow-hidden rounded-t-md border-x border-t shadow-xl"
      >
        {/* The project home at the app's own proportions (a DESIGN_WIDTH-wide
            window), scaled as one picture to the box: nothing reflows, so the
            sidebar, the greeting and the composer keep the real layout at
            every size. Hidden until the box is measured. */}
        <div
          className="flex origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            height: box ? box.height / (box.width / DESIGN_WIDTH) : 0,
            transform: box ? `scale(${box.width / DESIGN_WIDTH})` : undefined,
            visibility: box ? 'visible' : 'hidden',
          }}
        >
          <div className="bg-sidebar border-border flex w-[240px] shrink-0 flex-col gap-1 border-r p-2">
            {/* The sidebar's workspace button, the full width of the sidebar. */}
            <div className="flex h-9 items-center gap-2 px-1">
              {label ? (
                <EntityAvatar label={label} size="sm" />
              ) : (
                <span className="bg-muted size-6 shrink-0 rounded-sm" />
              )}
              <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium tracking-tight">{label}</span>
              <CaretUpDownIcon className="text-muted-foreground size-3.5 shrink-0" />
            </div>

            <span className="text-muted-foreground mt-3 px-2 pb-1 text-sm">{t('sessions')}</span>
            <div className="flex flex-col">
              {SESSION_WIDTHS.map((width, index) => (
                <div key={index} className="flex h-8 items-center gap-2 px-2">
                  <span className="border-muted-foreground/40 size-3.5 shrink-0 rounded-full border" />
                  <Bar className={width} />
                </div>
              ))}
            </div>
          </div>

          {/* The project home: the greeting over the composer, centered as
              the real home centers them. */}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-10">
            <div className="flex w-full max-w-[560px] flex-col gap-4">
              <p className="text-muted-foreground text-2xl tracking-tight">
                {GREETING.before} <span className="text-foreground">{label}</span>
                {spaceBefore(GREETING.after) ? ' ' : ''}
                {GREETING.after}
              </p>
              <div className="border-border bg-background flex flex-col gap-8 rounded-2xl border p-3">
                <Bar className="mt-1 ml-1 w-56" />
                <div className="flex items-center gap-3">
                  <PaperclipIcon className="text-muted-foreground size-4 shrink-0" />
                  <span className="text-foreground flex shrink-0 items-center gap-1.5 text-sm">
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
    </div>
  );
}
