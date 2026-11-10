/**
 * `/careers` copy. The page is a job board, not an essay: the openings, the
 * bar, and how to apply. The two founding GTM roles each have a role page
 * (`/careers/<slug>`, `roles` below). The company thesis lives on `/about`.
 *
 * Plain English lives here, not in `apps/web/translations/*.json`, so the copy
 * can iterate before paying the 8-locale parity gate (`pnpm i18n:translations`).
 *
 * Voice rules: the `kortix-brand` skill. The bar is distilled from `CLAUDE.md`.
 *
 * ACCURACY GATE for this page specifically:
 *  - INVENT NOTHING about employment. No salary band, no equity percentage,
 *    no benefits, no headcount, no remote policy. Compensation is named only
 *    as its parts (base, variable, founding equity): the founder has not
 *    published numbers. Locations are per opening and come from the founder:
 *    FDE and MTS in **Belgrade** or **San Francisco**, both founding GTM roles
 *    in **San Francisco** or **New York**, in person (2026-11-10).
 *  - The openings are the founder's own list: FDE, two founding GTM roles
 *    (Enterprise, Developers and PLG; 2026-11-10) and MTS. FDE and MTS stay one
 *    broad line. The GTM role pages carry the founder-approved spec; the title
 *    is open (Founding GTM Lead, Head of GTM, Head of Business, CBO).
 *  - "How we sell" is the public half of the GTM thesis. No internal numbers.
 *  - Applications go through `ApplyModal`, which posts to the same
 *    `/api/demo-request` pipeline as "Book your demo". There is no ATS and no
 *    jobs@ alias — do not invent one. The three direct links (email, X,
 *    LinkedIn) are the ones this page already carried.
 *  - There is NO file upload on that pipeline (JSON in, one blob into
 *    `contact_forms`). Ask for a LINK to a CV or portfolio. Never promise an
 *    attachment.
 *  - Competitor names, exactly: **Claude Cowork** (one word, lowercase `w`) and
 *    **ChatGPT Work** (two words).
 *  - Never name a licence — "open source" and stop. Never claim a certification.
 *  - No culture-page filler. If a sentence restates the one above it, cut it.
 */

const BUILD_CITIES = 'Belgrade · San Francisco';
const GTM_CITIES = 'San Francisco · New York';

export const hero = {
  title: 'Open positions.',
  lead: 'Belgrade, San Francisco and New York.',
  description: 'An extremely small, talent-dense team. Each opening names its cities.',
  roleLabel: 'Role',
  summaryLabel: 'Summary',
  ctaPrimary: 'Apply',
  ctaSecondary: 'Why Kortix exists',
  ctaSecondaryHref: '/about',
  viewRole: 'View role',
  allOpenings: 'All openings',
} as const;

/** The two founding GTM role pages, by URL slug. */
export const ROLE_SLUGS = ['gtm-enterprise', 'gtm-developers'] as const;
export type RoleSlug = (typeof ROLE_SLUGS)[number];

/** The board: the role, its full name, one line and its cities. FDE and MTS stay broad; a GTM
 *  row links to its role page. */
export const openings: readonly {
  id: string;
  name: string;
  full: string;
  summary: string;
  cities: string;
  href?: `/careers/${RoleSlug}`;
}[] = [
  {
    id: 'fde',
    name: 'FDE',
    full: 'Forward Deployed Engineer',
    summary: 'Work with customers to put Kortix to work across their company.',
    cities: BUILD_CITIES,
  },
  {
    id: 'gtm-enterprise',
    name: 'Founding GTM',
    full: 'Enterprise',
    summary: 'Take Kortix from founder-led sales to an enterprise business: sales, consultancy, partners.',
    cities: GTM_CITIES,
    href: '/careers/gtm-enterprise',
  },
  {
    id: 'gtm-developers',
    name: 'Founding GTM',
    full: 'Developers and PLG',
    summary: 'Turn the open-source audience into teams that run real work on Kortix and pay for it.',
    cities: GTM_CITIES,
    href: '/careers/gtm-developers',
  },
  {
    id: 'mts',
    name: 'MTS',
    full: 'Member of Technical Staff',
    summary: 'Build Kortix itself, anywhere in the stack.',
    cities: BUILD_CITIES,
  },
];

/** What every founding GTM role page shows the same way. */
const gtmFacts = {
  reportsTo: { k: 'Reports to', v: 'Marko Kraemer, CEO' },
  location: { k: 'Location', v: 'San Francisco or New York, in person' },
  pay: { k: 'Compensation', v: 'Base salary, variable pay and founding equity' },
} as const;

/** The public half of the GTM thesis. Claims trace to kortix-brand `claims.md` / `positioning.md`. */
export const howWeSell = {
  title: 'How we sell.',
  titleMuted: 'Two motions, one account.',
  sub: 'Developers adopt Kortix bottom-up. Companies buy outcomes top-down. Each founding GTM lead owns one motion, and the two share one pipeline.',
  items: [
    {
      id: 'open-source',
      n: '01',
      k: 'Open source is the distribution',
      v: '20,000+ GitHub stars are the top of the funnel. A security reviewer can read the code, and self-host removes the lock-in fear. We never gate the core to make a sale.',
    },
    {
      id: 'champion',
      n: '02',
      k: 'The developer champions, the company buys',
      v: 'Developers find Kortix and run their agents on it. Revenue starts when a team runs real work on it, not when someone stars the repo.',
    },
    {
      id: 'outcomes',
      n: '03',
      k: 'Outcomes, not seats',
      v: 'Hand it an outcome, AI agents run it 24/7. A deal starts with one scoped outcome and grows one outcome at a time.',
    },
    {
      id: 'ownership',
      n: '04',
      k: 'Ownership, not intelligence',
      v: 'Claude Cowork and ChatGPT Work teach the market what agents can do. We win the company that must own its agents, data, models and infrastructure.',
    },
  ],
} as const;

/** The interview loop, the same for both GTM roles. */
const gtmProcess = [
  {
    id: 'intro',
    k: 'Intro call, 30 min',
    v: 'With Marko. Your best deal or launch, from first contact to result, in your own words.',
  },
  {
    id: 'product',
    k: 'Product week',
    v: 'You get a Kortix account, use it for a real task, and come back with what you would sell and to whom.',
  },
  {
    id: 'sample',
    k: 'Work sample, 60 min',
    v: 'One live exercise (a pitch to a security-minded buyer, or a launch plan), then your plan for the first 90 days.',
  },
  {
    id: 'team',
    k: 'Team call, 45 min',
    v: 'Two engineers ask how you would explain the technical parts of Kortix to a customer or a developer.',
  },
  {
    id: 'references',
    k: 'References, then the offer',
    v: 'Two people you sold to or grew with, and one former manager.',
  },
] as const;

/** One founding GTM role page. `applyArea` must equal one of `applyForm.areaOptions`. */
type RolePage = {
  hero: { title: string; titleMuted: string; sub: string };
  facts: readonly { k: string; v: string }[];
  own: { title: string; titleMuted: string; rows: readonly { id: string; k: string; v: string }[] };
  year: {
    title: string;
    titleMuted: string;
    items: readonly { id: string; n: string; k: string; v: string }[];
  };
  have: { title: string; titleMuted: string; rows: readonly { id: string; k: string; v: string }[] };
  process: { title: string; titleMuted: string; rows: readonly { id: string; k: string; v: string }[] };
  applyArea: string;
  meta: { title: string; description: string };
};

export const roles: Record<RoleSlug, RolePage> = {
  'gtm-enterprise': {
    hero: {
      title: 'Founding GTM, Enterprise.',
      titleMuted: 'San Francisco or New York.',
      sub: 'The first go-to-market hire for the companies that must own their AI. You take Kortix from founder-led sales to an enterprise business, and you have done it before.',
    },
    facts: [
      gtmFacts.reportsTo,
      gtmFacts.location,
      gtmFacts.pay,
      { k: 'Title', v: 'Founding GTM Lead, Head of GTM or CBO. Your pick.' },
    ],
    own: {
      title: 'What you own.',
      titleMuted: 'Everything that turns Kortix into enterprise revenue.',
      rows: [
        {
          id: 'zero-to-one',
          k: '0 to 1',
          v: 'The ideal customer, the pitch, the sales process and the first repeatable revenue.',
        },
        {
          id: 'enterprise-sales',
          k: 'Enterprise sales',
          v: 'Pipeline, pilots, security reviews, contracts, renewals and expansion.',
        },
        {
          id: 'consultancy',
          k: 'Consultancy',
          v: "Our done-for-you service, where forward-deployed engineers build a company's agents and apps. You decide who it is for and how it is scoped, sold and delivered.",
        },
        {
          id: 'partnerships',
          k: 'Partnerships',
          v: 'Agencies, consultancies and resellers that sell and deploy Kortix for their clients.',
        },
        {
          id: 'offer',
          k: 'The offer',
          v: 'Packaging and pricing across self-serve, Enterprise, self-host and services, decided with the CEO.',
        },
      ],
    },
    year: {
      title: 'The first 12 months.',
      titleMuted: 'From founder-led sales to a sales team.',
      items: [
        {
          id: 'learn',
          n: 'Days 0–30',
          k: 'Learn the buyer',
          v: 'Join every founder-led deal and take over the open pipeline. Talk to paying accounts. Write the pitch and the deal stages.',
        },
        {
          id: 'close',
          n: 'Days 31–90',
          k: 'Close without the founder',
          v: 'Close the first deals with no founder on the call. Ship the sales kit: deck, demo script, security review answers.',
        },
        {
          id: 'repeat',
          n: 'Days 91–180',
          k: 'Make it repeatable',
          v: 'Outbound and partner channels that add pipeline every week. Pilot to contract, end to end.',
        },
        {
          id: 'team',
          n: 'Days 181–365',
          k: 'Build the team',
          v: 'Hire and lead the first account executives. Own the revenue number and the forecast with the CEO.',
        },
      ],
    },
    have: {
      title: 'What you have done.',
      titleMuted: 'The non-negotiables.',
      rows: [
        {
          id: 'done-it',
          k: '0 to 1, before',
          v: 'You were the first GTM hire and took a company from founder-led sales to a repeatable motion, with revenue you can name.',
        },
        {
          id: 'close',
          k: 'You close',
          v: 'You closed technical software deals yourself, and you still want to.',
        },
        {
          id: 'security',
          k: 'Through security review',
          v: 'You took deals through security questionnaires, legal and procurement at large companies.',
        },
        {
          id: 'peer',
          k: 'A peer to engineers',
          v: "You demo the product live and answer a CTO's follow-up questions.",
        },
        {
          id: 'write',
          k: 'You write',
          v: 'Your emails, decks and one-pagers are short and exact. You write them yourself.',
        },
        {
          id: 'agents',
          k: 'You run on agents',
          v: 'You use AI agents in your own work today and know what they do well.',
        },
        {
          id: 'plus',
          k: 'A plus',
          v: 'You built a partner channel or a services line that brought in revenue.',
        },
      ],
    },
    process: { title: 'How we hire.', titleMuted: 'About two weeks.', rows: gtmProcess },
    applyArea: 'Founding GTM — Enterprise',
    meta: {
      title: 'Founding GTM, Enterprise — Kortix careers',
      description:
        'The first enterprise go-to-market hire at Kortix: 0 to 1 GTM, enterprise sales, consultancy and partnerships. San Francisco or New York.',
    },
  },
  'gtm-developers': {
    hero: {
      title: 'Founding GTM, Developers.',
      titleMuted: 'San Francisco or New York.',
      sub: 'You turn the open-source audience into teams that run real work on Kortix and pay for it. Product-led growth and developer relations, in one seat.',
    },
    facts: [
      gtmFacts.reportsTo,
      gtmFacts.location,
      gtmFacts.pay,
      { k: 'Title', v: 'Founding GTM Lead or Head of Growth. Your pick.' },
    ],
    own: {
      title: 'What you own.',
      titleMuted: 'The path from a GitHub star to a paying team.',
      rows: [
        {
          id: 'funnel',
          k: 'The funnel',
          v: 'From GitHub and the site to signup, a first working session, a team workspace and a paid plan.',
        },
        {
          id: 'activation',
          k: 'Activation',
          v: 'With the engineers: the CLI, onboarding and templates, until a new user gets real work done on day one.',
        },
        {
          id: 'launches',
          k: 'Launches',
          v: 'Every release, launch and demo: what we say, where, and to whom.',
        },
        {
          id: 'community',
          k: 'Content and community',
          v: 'Technical writing, demos, templates and the places developers talk.',
        },
        {
          id: 'handoff',
          k: 'The hand-off',
          v: 'Spot the companies where a team already runs on Kortix and bring them to the enterprise lead.',
        },
      ],
    },
    year: {
      title: 'The first 12 months.',
      titleMuted: 'From an audience to a growth engine.',
      items: [
        {
          id: 'read',
          n: 'Days 0–30',
          k: 'Read the funnel',
          v: 'Measure the path from visit to paid. Talk to active users. Name where people drop.',
        },
        {
          id: 'activate',
          n: 'Days 31–90',
          k: 'Fix activation',
          v: 'Ship the onboarding and template changes that get a new user to a working session on day one. Run one launch.',
        },
        {
          id: 'repeat',
          n: 'Days 91–180',
          k: 'Make growth repeatable',
          v: 'A weekly launch and content rhythm, templates and integrations that bring users in, and a weekly funnel report.',
        },
        {
          id: 'team',
          n: 'Days 181–365',
          k: 'Build the team',
          v: 'Hire the next people in growth and developer relations. Own self-serve revenue with the CEO.',
        },
      ],
    },
    have: {
      title: 'What you have done.',
      titleMuted: 'The non-negotiables.',
      rows: [
        {
          id: 'grew',
          k: '0 to 1, before',
          v: 'You owned growth, developer relations or GTM at a developer tool or open-source company, with numbers you can name.',
        },
        {
          id: 'build',
          k: 'You build',
          v: 'You write code, ship demos and read the funnel in SQL yourself.',
        },
        {
          id: 'write',
          k: 'You write and record',
          v: 'Launch posts, docs, demos and videos that developers share.',
        },
        {
          id: 'experiments',
          k: 'You run experiments',
          v: 'You kept what worked, killed what did not, and can show both.',
        },
        {
          id: 'agents',
          k: 'You run on agents',
          v: 'You use coding agents every day and know where they fail.',
        },
        {
          id: 'plus',
          k: 'A plus',
          v: 'You built an open-source community, or turned free users into paying teams.',
        },
      ],
    },
    process: { title: 'How we hire.', titleMuted: 'About two weeks.', rows: gtmProcess },
    applyArea: 'Founding GTM — Developers and PLG',
    meta: {
      title: 'Founding GTM, Developers — Kortix careers',
      description:
        'The first developer and product-led growth hire at Kortix: the funnel, activation, launches and community. San Francisco or New York.',
    },
  },
};

export function isRoleSlug(value: string): value is RoleSlug {
  return (ROLE_SLUGS as readonly string[]).includes(value);
}

export const bar = {
  title: 'What we look for.',
  titleMuted: 'Ownership, agency and skill.',
  lead: 'An extremely small, talent-dense team. Everyone can AGI-max now, so the one chokepoint left is judgement. Either you are performing or you are not.',
  items: [
    {
      id: 'prolonged',
      title: 'Prolonged ownership',
      body: 'You owned something for a long stretch. Whether it worked out matters less than the stretch.',
    },
    {
      id: 'room',
      title: 'The room test',
      body: 'I hand you something at a high level, walk out, come back, and find it done well. Ideally better than I would have done it.',
    },
    {
      id: 'end-to-end',
      title: 'End to end',
      body: 'From "we have a problem" to "nobody has to think about this again". If someone still has to track it, you did not own it.',
    },
    {
      id: 'not-done',
      title: 'It is not done if',
      body: 'it is not implemented, the implementation is ugly, it is not documented, nobody can discover it, or you cannot market it.',
    },
    {
      id: 'problem-first',
      title: 'Problem first',
      body: '"Move from X to Y" is a solution you pre-committed to. Slow, flaky, breaks for this one customer — those are problems.',
    },
    {
      id: 'prove',
      title: 'Prove it',
      body: 'Not "the tests pass". Prove it, then confirm it is live in production, which is not the same as merged.',
    },
    {
      id: 'no-net',
      title: 'No PMs, no QA',
      body: 'Ask for help, ask questions, redo things. Never quietly assume someone else will catch the part you skipped.',
    },
  ],
} as const;

export const apply = {
  title: 'Tell me what you have worked on.',
  titleMuted: 'I read every application.',
  body: 'One open question, no form to game. Products, campaigns, companies, things you built for yourself — whatever you want me to know. It comes straight to me. I am Marko.',
  cta: 'Apply',
  directLead: 'Or write to me directly:',
  links: [
    { id: 'email', label: 'marko@kortix.com', href: 'mailto:marko@kortix.com', external: false },
    { id: 'x', label: '@markokraemer', href: 'https://x.com/markokraemer', external: true },
    {
      id: 'linkedin',
      label: 'linkedin.com/in/markokraemer',
      href: 'https://linkedin.com/in/markokraemer',
      external: true,
    },
  ],
} as const;

/** Copy for `ApplyModal`. Short, and one open question carries the weight. */
export const applyForm = {
  title: 'Apply to Kortix',
  description: 'Short. One open question does the work.',
  areaLabel: 'Which opening',
  areaPlaceholder: 'Pick the closest one',
  areaOptions: [
    'FDE — Forward Deployed Engineer',
    'Founding GTM — Enterprise',
    'Founding GTM — Developers and PLG',
    'MTS — Member of Technical Staff',
    'Not sure — read it and tell me',
  ],
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  emailLabel: 'Email',
  emailPlaceholder: 'you@wherever.com',
  ownedLabel: 'What have you worked on?',
  ownedPlaceholder:
    'Products, campaigns, companies, things you built for yourself. Whatever you want to tell me.',
  linkLabel: 'Link to a CV, portfolio, GitHub or profile',
  /* No attachment: the lead pipeline takes JSON only. Ask for a link. */
  linkPlaceholder: 'https://',
  submit: 'Send application',
  submitting: 'Sending',
  doneTitle: 'Application received.',
  doneBody: 'It lands in the inbox I read every day. If it is a fit, you hear from me directly.',
  doneCta: 'Done',
  errors: {
    email: 'Enter an email address I can reply to.',
    owned: 'Tell me what you have worked on.',
    area: 'Pick the closest opening.',
  },
} as const;

export function getLocalizedCareersContent(tI18nComplete: UiTranslator) {
  return localizeUiCatalog(
    { hero, openings, roles, howWeSell, bar, apply, applyForm },
    tI18nComplete,
    MARKETING_SECONDARY_TRANSLATION_KEYS,
  );
}
import { localizeUiCatalog } from '@kortix/ui/i18n';
import { MARKETING_SECONDARY_TRANSLATION_KEYS } from '@/i18n/marketing-secondary-translation-keys.generated';
import type { UiTranslator } from '@/i18n/translator';
