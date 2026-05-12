import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireSession } from '@/lib/session';
import { randomId } from '@/lib/id';
import type { Block } from '@roua/db';

// ────────────────────────────────────────────────────────────────────────────
// AI Assistant endpoint.
//
// Intents supported:
//   • generate-page   — full block list from a one-paragraph brief
//   • improve-copy    — rewrite text (tighter, punchier, more on-brand)
//   • translate       — EN ↔ AR
//   • tagline         — N short brand taglines from name/bio
//   • alt-text        — image alt text from a context blurb
//
// Uses Claude Opus 4.7 with adaptive thinking and prompt caching on the
// stable system prompt. Falls back gracefully when ANTHROPIC_API_KEY is unset
// so the rest of the admin keeps working before the key is configured.
// ────────────────────────────────────────────────────────────────────────────

const MODEL = 'claude-opus-4-7';

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

// Anchored, stable system prompt — large enough to benefit from caching.
const BLOCK_SCHEMA_DOC = `
You generate content for a bilingual (English + Arabic, ar) portfolio CMS for a
Lebanese creative studio. The site is dark-on-light editorial, with serif
display type. Default tone: confident, concise, lightly poetic. Avoid
buzzwords ("synergy", "leverage", "solutions"); avoid clichés.

When producing JSON, output ONLY the JSON object — no markdown fences, no
prose around it. Strings should be plain text (no HTML, no markdown).
Every translatable field MUST include BOTH "en" and "ar" keys.

The available block types are:

1. hero
   { type: "hero", variant: "fullscreen" | "split" | "minimal",
     eyebrow?: { en, ar }, heading: { en, ar }, subheading?: { en, ar },
     image?: string, cta?: { label: { en, ar }, href } }
2. text
   { type: "text", heading?: { en, ar }, content: { en, ar }, align?: "left" | "center" }
3. image
   { type: "image", src: string, alt: { en, ar }, caption?: { en, ar },
     width?: "narrow" | "wide" | "full" }
4. gallery
   { type: "gallery", heading?: { en, ar }, images: [{ src, alt: {en,ar} }],
     columns?: 2 | 3 | 4 }
5. video
   { type: "video", url: string, caption?: { en, ar }, poster?: string }
6. projects
   { type: "projects", heading?: { en, ar }, limit?: number,
     category?: string, featuredOnly?: boolean }
7. services
   { type: "services", heading?: { en, ar } }
8. testimonials
   { type: "testimonials", heading?: { en, ar }, variant?: "cards" | "quote-stack",
     featuredOnly?: boolean, limit?: number }
9. stats
   { type: "stats", heading?: { en, ar },
     items: [{ value: string, label: { en, ar } }] }
10. faq
    { type: "faq", heading?: { en, ar },
      items: [{ q: { en, ar }, a: { en, ar } }] }
11. contact
    { type: "contact", heading?: { en, ar } }
12. cta
    { type: "cta", heading: { en, ar }, subheading?: { en, ar },
      button: { label: { en, ar }, href } }
13. marquee
    { type: "marquee", words: { en, ar } }   // ar is RTL-safe
14. spacer
    { type: "spacer", size: "sm" | "md" | "lg" | "xl" }

Rules:
- Open with a hero block unless the user clearly asks otherwise.
- Close with a CTA or contact block unless told otherwise.
- 5–9 blocks is the right length for a normal page.
- Use real, specific copy — never lorem ipsum, never placeholder URLs.
- For Arabic, write idiomatic Arabic (not literal English-to-Arabic word order).
- For images, leave src as "" — the admin fills these in later via media picker.
- For href on CTAs/buttons, use realistic site paths like /contact, /projects.
- Do NOT invent the "id" field on blocks — the server adds them.
`;

// ────────────────────────────────────────────────────────────────────────────
// Block normalization
// ────────────────────────────────────────────────────────────────────────────

// The model may return slight schema drift (extra fields, missing optionals).
// We sanitize and inject IDs so the editor gets a Block[] it can render.
function normalizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return [];
  const out: Block[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const id = randomId();
    const type = String(r.type ?? '').toLowerCase();
    switch (type) {
      case 'hero':
        out.push({
          id,
          type: 'hero',
          variant: (r.variant as 'fullscreen' | 'split' | 'minimal') ?? 'fullscreen',
          eyebrow: localized(r.eyebrow),
          heading: localized(r.heading) ?? { en: '', ar: '' },
          subheading: localized(r.subheading),
          image: typeof r.image === 'string' ? r.image : undefined,
          cta: cta(r.cta),
        });
        break;
      case 'text':
        out.push({
          id,
          type: 'text',
          heading: localized(r.heading),
          content: localized(r.content) ?? { en: '', ar: '' },
          align: r.align === 'center' ? 'center' : 'left',
        });
        break;
      case 'image':
        out.push({
          id,
          type: 'image',
          src: typeof r.src === 'string' ? r.src : '',
          alt: localized(r.alt) ?? { en: '', ar: '' },
          caption: localized(r.caption),
          width: (r.width as 'narrow' | 'wide' | 'full') ?? 'wide',
        });
        break;
      case 'gallery':
        out.push({
          id,
          type: 'gallery',
          heading: localized(r.heading),
          columns: ([2, 3, 4].includes(Number(r.columns)) ? Number(r.columns) : 3) as 2 | 3 | 4,
          images: Array.isArray(r.images)
            ? r.images.map((g) => ({
                src: typeof (g as { src?: unknown }).src === 'string' ? (g as { src: string }).src : '',
                alt: localized((g as { alt?: unknown }).alt) ?? { en: '', ar: '' },
              }))
            : [],
        });
        break;
      case 'video':
        out.push({
          id,
          type: 'video',
          url: typeof r.url === 'string' ? r.url : '',
          caption: localized(r.caption),
          poster: typeof r.poster === 'string' ? r.poster : undefined,
        });
        break;
      case 'projects':
        out.push({
          id,
          type: 'projects',
          heading: localized(r.heading),
          limit: typeof r.limit === 'number' ? r.limit : 6,
          category: typeof r.category === 'string' ? r.category : undefined,
          featuredOnly: Boolean(r.featuredOnly),
        });
        break;
      case 'services':
        out.push({ id, type: 'services', heading: localized(r.heading) });
        break;
      case 'testimonials':
        out.push({
          id,
          type: 'testimonials',
          heading: localized(r.heading),
          variant: (r.variant as 'cards' | 'quote-stack') ?? 'cards',
          featuredOnly: Boolean(r.featuredOnly),
          limit: typeof r.limit === 'number' ? r.limit : 3,
        });
        break;
      case 'stats':
        out.push({
          id,
          type: 'stats',
          heading: localized(r.heading),
          items: Array.isArray(r.items)
            ? r.items.map((s) => ({
                value: String((s as { value?: unknown }).value ?? ''),
                label: localized((s as { label?: unknown }).label) ?? { en: '', ar: '' },
              }))
            : [],
        });
        break;
      case 'faq':
        out.push({
          id,
          type: 'faq',
          heading: localized(r.heading),
          items: Array.isArray(r.items)
            ? r.items.map((item) => ({
                q: localized((item as { q?: unknown }).q) ?? { en: '', ar: '' },
                a: localized((item as { a?: unknown }).a) ?? { en: '', ar: '' },
              }))
            : [],
        });
        break;
      case 'contact':
        out.push({ id, type: 'contact', heading: localized(r.heading) });
        break;
      case 'cta': {
        const b = cta(r.button);
        out.push({
          id,
          type: 'cta',
          heading: localized(r.heading) ?? { en: '', ar: '' },
          subheading: localized(r.subheading),
          button: b ?? { label: { en: 'Get in touch', ar: 'تواصل' }, href: '/contact' },
        });
        break;
      }
      case 'marquee':
        out.push({
          id,
          type: 'marquee',
          words: localized(r.words) ?? { en: '', ar: '' },
        });
        break;
      case 'spacer':
        out.push({
          id,
          type: 'spacer',
          size: (r.size as 'sm' | 'md' | 'lg' | 'xl') ?? 'md',
        });
        break;
      default:
        // Unknown block type — skip.
        break;
    }
  }
  return out;
}

function localized(v: unknown): { en: string; ar: string } | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  return {
    en: typeof o.en === 'string' ? o.en : '',
    ar: typeof o.ar === 'string' ? o.ar : '',
  };
}

function cta(v: unknown): { label: { en: string; ar: string }; href: string } | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const label = localized(o.label);
  const href = typeof o.href === 'string' ? o.href : '';
  if (!label) return undefined;
  return { label, href };
}

// ────────────────────────────────────────────────────────────────────────────
// JSON extraction
// ────────────────────────────────────────────────────────────────────────────

// Pull the first JSON object/array out of a possibly-markdown-wrapped string.
function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fence ? fence[1] : text).trim();
  // Find the first {…} or […] balanced enough to parse.
  const candidates = [body, body.slice(body.indexOf('{')), body.slice(body.indexOf('['))];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return JSON.parse(c);
    } catch {
      // try next
    }
  }
  throw new Error('AI response was not valid JSON.');
}

// ────────────────────────────────────────────────────────────────────────────
// Intent handlers
// ────────────────────────────────────────────────────────────────────────────

async function generatePage(
  client: Anthropic,
  brief: string,
  title?: string,
): Promise<{ blocks: Block[] }> {
  const userPrompt = `Generate a portfolio page based on this brief:

"""
${brief.trim()}
"""

${title ? `The page is titled: "${title}".\n` : ''}
Return ONLY a JSON object of the form:
{ "blocks": [ ... ] }

Where each entry follows the block schemas above. Open with a hero, close
with a CTA or contact block unless the brief suggests otherwise. 5–9 blocks
total. Use real, specific copy in both English and Arabic.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system: [
      { type: 'text', text: BLOCK_SCHEMA_DOC, cache_control: { type: 'ephemeral' } },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = textOf(response);
  const parsed = extractJson(text) as { blocks?: unknown };
  const blocks = normalizeBlocks(parsed.blocks ?? parsed);
  return { blocks };
}

async function improveCopy(
  client: Anthropic,
  text: string,
  locale: 'en' | 'ar',
  instruction: string,
): Promise<{ text: string }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium' },
    system: [
      { type: 'text', text: BLOCK_SCHEMA_DOC, cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: `Rewrite the following ${locale === 'ar' ? 'Arabic' : 'English'} copy.

Instruction: ${instruction || 'Tighten and improve, keep the meaning intact.'}

Return ONLY the rewritten copy, nothing else — no explanation, no quotes.

Original:
${text}`,
      },
    ],
  });
  return { text: textOf(response).trim() };
}

async function translate(
  client: Anthropic,
  text: string,
  from: 'en' | 'ar',
  to: 'en' | 'ar',
): Promise<{ text: string }> {
  if (!text.trim()) return { text: '' };
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' },
    messages: [
      {
        role: 'user',
        content: `Translate the following from ${from === 'ar' ? 'Arabic' : 'English'} to ${to === 'ar' ? 'Arabic' : 'English'}. Match the tone — confident, concise, lightly editorial. Return ONLY the translation, nothing else.

${text}`,
      },
    ],
  });
  return { text: textOf(response).trim() };
}

async function taglines(
  client: Anthropic,
  context: { siteName: string; bio: string; locale: 'en' | 'ar'; count: number },
): Promise<{ taglines: string[] }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium' },
    system: [
      { type: 'text', text: BLOCK_SCHEMA_DOC, cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: `Suggest ${context.count} short, confident taglines (each under 60 characters) for "${context.siteName}" in ${context.locale === 'ar' ? 'Arabic' : 'English'}.

Studio bio:
${context.bio || '(no bio provided)'}

Return a JSON array of strings ONLY, like ["...", "...", "..."]. No prose, no explanation.`,
      },
    ],
  });
  const text = textOf(response);
  const parsed = extractJson(text);
  return { taglines: Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [] };
}

async function altText(
  client: Anthropic,
  context: { contextText: string; locale: 'en' | 'ar' },
): Promise<{ text: string }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' },
    messages: [
      {
        role: 'user',
        content: `Write a single ${context.locale === 'ar' ? 'Arabic' : 'English'} alt-text caption (under 120 characters) for an image used on this page section: "${context.contextText}". Describe the image concretely. Return ONLY the alt text, no quotes, no explanation.`,
      },
    ],
  });
  return { text: textOf(response).trim() };
}

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

// ────────────────────────────────────────────────────────────────────────────
// Route handler
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  await requireSession();

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      {
        error:
          'AI assistant disabled — ANTHROPIC_API_KEY is not configured. Add it to Vercel env vars and redeploy.',
      },
      { status: 503 },
    );
  }

  const body = await req.json();
  const intent = String(body.intent ?? '');

  try {
    switch (intent) {
      case 'generate-page': {
        const brief = String(body.brief ?? '').trim();
        if (!brief) return NextResponse.json({ error: 'Brief is required.' }, { status: 400 });
        const result = await generatePage(client, brief, body.title);
        return NextResponse.json(result);
      }
      case 'improve-copy': {
        const text = String(body.text ?? '');
        const locale = (body.locale ?? 'en') as 'en' | 'ar';
        const instruction = String(body.instruction ?? '');
        const result = await improveCopy(client, text, locale, instruction);
        return NextResponse.json(result);
      }
      case 'translate': {
        const text = String(body.text ?? '');
        const from = (body.from ?? 'en') as 'en' | 'ar';
        const to = (body.to ?? 'ar') as 'en' | 'ar';
        const result = await translate(client, text, from, to);
        return NextResponse.json(result);
      }
      case 'tagline': {
        const result = await taglines(client, {
          siteName: String(body.siteName ?? ''),
          bio: String(body.bio ?? ''),
          locale: (body.locale ?? 'en') as 'en' | 'ar',
          count: typeof body.count === 'number' ? Math.min(Math.max(body.count, 1), 8) : 5,
        });
        return NextResponse.json(result);
      }
      case 'alt-text': {
        const result = await altText(client, {
          contextText: String(body.contextText ?? ''),
          locale: (body.locale ?? 'en') as 'en' | 'ar',
        });
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: 'Unknown intent.' }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid Anthropic API key.' }, { status: 401 });
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: 'AI rate-limited. Try again in a moment.' }, { status: 429 });
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `AI service error: ${e.message}` }, { status: e.status ?? 500 });
    }
    const message = e instanceof Error ? e.message : 'AI request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
