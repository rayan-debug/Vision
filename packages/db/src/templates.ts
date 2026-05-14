import type { Block } from './types';

// ────────────────────────────────────────────────────────────────────────────
// Starter page templates.
//
// These are seeded into the PageTemplate table on first run (`npm run
// seed:templates`). Once seeded they live in the database and become editable
// like any other content — name, description, preview, and blocks can all be
// changed in the admin. Re-running the seeder upserts based on the `key` so
// you can ship improvements without wiping admin edits to unrelated rows.
//
// Each template has a unique `key`, a human name, a short description, an
// ASCII preview shown in the picker, and a build() that emits a fresh set of
// blocks with unique IDs.
// ────────────────────────────────────────────────────────────────────────────

function id(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

const emptyLoc = () => ({ en: '', ar: '' });

// Stable, seeded placeholder photos. Using picsum.photos with a `seed`
// keeps the same image every render (no flicker) while still feeling
// "real" — admins immediately see a populated, magazine-style page
// instead of broken-image squares.
const photo = (seed: string, w = 1600, h = 1100) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const galleryImages = (
  prefix: string,
  count: number,
  alts: { en: string; ar: string }[],
) =>
  Array.from({ length: count }).map((_, i) => ({
    src: photo(`${prefix}-${i + 1}`, 1200, 1500),
    alt: alts[i % alts.length],
  }));

export type StarterTemplate = {
  key: string;
  name: string;
  description: string;
  preview: string;
  order: number;
  build(): Block[];
};

export const STARTER_TEMPLATES: StarterTemplate[] = [
  // ──────────────────────────────────────────────────────────────────────
  // 1. Editorial Cover
  // ──────────────────────────────────────────────────────────────────────
  {
    key: 'editorial-cover',
    name: 'Editorial cover',
    description: 'Magazine-style opener with massive serif type, alternating images and copy, and a quiet quote stack to close. For statement projects and brand stories.',
    preview: '─────────────\n  ▭ COVER ▭   \n─────────────\n  ▸ marquee  \n─────────────\n  ¶ ¶ ¶ text \n─────────────\n  ▦ full     \n─────────────\n  ▦  ▦  ▦    \n─────────────\n  ❝ quotes ❞ \n─────────────\n  → CTA      \n─────────────',
    order: 0,
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'minimal',
        eyebrow: { en: 'Issue 01 · 2026', ar: 'العدد 01 · 2026' },
        heading: { en: 'A new\nway to see.', ar: 'طريقة\nجديدة للرؤية.' },
        subheading: { en: 'Editorial design, photography, and visual systems by Roua Bou Ghanem.', ar: 'تصميم تحريري، تصوير، وأنظمة بصرية لـ روى بو غانم.' },
      },
      { id: id(), type: 'marquee', words: { en: 'Editorial · Identity · Print · Photography · Direction', ar: 'تحرير · هوية · طباعة · تصوير · توجيه' } },
      {
        id: id(),
        type: 'text',
        heading: { en: 'On craft', ar: 'عن الحرفة' },
        content: {
          en: 'Every page begins as a question: what is this story trying to say, and what shape does it want to take? The answer is rarely just typography. It\'s rhythm, weight, the silence between paragraphs, and the photograph that pulls the eye to the next idea.',
          ar: 'تبدأ كل صفحة بسؤال: ما القصة التي يحاول هذا النص قولها، وما الشكل الذي تريد أن تأخذه؟ الجواب نادراً ما يكون مجرد طباعة. إنه إيقاع، ووزن، وصمت بين الفقرات، وصورة تشدّ العين إلى الفكرة التالية.',
        },
        align: 'left',
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'image',
        src: photo('editorial-cover', 2000, 1100),
        alt: { en: 'Full-bleed editorial photograph', ar: 'صورة تحريرية ممتدة' },
        caption: { en: 'Cover image — Issue 01, shot on medium format.', ar: 'صورة الغلاف — العدد 01، تصوير متوسط الحجم.' },
        width: 'full',
      },
      {
        id: id(),
        type: 'gallery',
        heading: { en: 'Selected spreads', ar: 'صفحات مختارة' },
        columns: 3,
        images: galleryImages('editorial-spreads', 6, [
          { en: 'Cover spread', ar: 'صفحة الغلاف' },
          { en: 'Feature opening', ar: 'افتتاحية المقال' },
          { en: 'Typographic study', ar: 'دراسة طباعية' },
          { en: 'Portrait series', ar: 'سلسلة بورتريه' },
          { en: 'Index page', ar: 'صفحة الفهرس' },
          { en: 'Closing spread', ar: 'الصفحة الختامية' },
        ]),
      },
      {
        id: id(),
        type: 'testimonials',
        heading: { en: 'In their words', ar: 'بكلماتهم' },
        variant: 'quote-stack',
        featuredOnly: true,
        limit: 3,
      },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Want to build one with me?', ar: 'هل تريد أن نبني واحدة معاً؟' },
        subheading: { en: 'I take on a small number of editorial projects each season.', ar: 'أقبل عدداً محدوداً من المشاريع التحريرية في كل موسم.' },
        button: { label: { en: 'Start a brief', ar: 'ابدأ ملخصاً' }, href: '/contact' },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // 2. Studio Showcase (the new "Landing")
  // ──────────────────────────────────────────────────────────────────────
  {
    key: 'studio-showcase',
    name: 'Studio showcase',
    description: 'A dense landing page that proves the studio works: fullscreen hero, stats, featured projects, services, testimonials, and a closing call to action.',
    preview: '─────────────\n  HERO ████  \n─────────────\n  12  80  5  \n─────────────\n  ▸ marquee  \n─────────────\n  projects ▦ \n─────────────\n  services ◐ \n─────────────\n  ❝quotes❞   \n─────────────\n  → CTA      \n─────────────',
    order: 1,
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'fullscreen',
        eyebrow: { en: '@studio', ar: '@studio' },
        heading: { en: 'Visual power,\nin every frame.', ar: 'قوة بصرية،\nفي كل إطار.' },
        subheading: { en: 'A creative studio building brand identity, photography, podcast, and motion.', ar: 'ستوديو إبداعي يبني الهويات، التصوير، البودكاست، والموشن.' },
        image: photo('studio-hero', 2200, 1400),
        cta: { label: { en: 'See the work', ar: 'شاهد الأعمال' }, href: '/projects' },
      },
      {
        id: id(),
        type: 'stats',
        items: [
          { value: '12+', label: { en: 'Years in practice', ar: 'سنوات في الممارسة' } },
          { value: '80', label: { en: 'Projects shipped', ar: 'مشاريع منجزة' } },
          { value: '30', label: { en: 'Active brands', ar: 'علامات نشطة' } },
          { value: '5', label: { en: 'Awards', ar: 'جوائز' } },
        ],
      },
      { id: id(), type: 'marquee', words: { en: 'Identity · Editorial · Photography · Podcast · Motion · Direction', ar: 'هوية · تحرير · تصوير · بودكاست · موشن · توجيه' } },
      { id: id(), type: 'projects', heading: { en: 'Selected work', ar: 'مختارات' }, featuredOnly: true, limit: 6 },
      { id: id(), type: 'services', heading: { en: 'What I do', ar: 'ما أقدّمه' } },
      { id: id(), type: 'testimonials', heading: { en: 'Words from clients', ar: 'كلمات من العملاء' }, featuredOnly: true, limit: 3, variant: 'cards' },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Have a vision?', ar: 'لديك رؤية؟' },
        subheading: { en: 'Tell me about your project — I reply within 48 hours.', ar: 'حدّثني عن مشروعك — أردّ خلال 48 ساعة.' },
        button: { label: { en: 'Start a project', ar: 'ابدأ مشروعاً' }, href: '/contact' },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // 3. Visual Portfolio — image-first, minimal text
  // ──────────────────────────────────────────────────────────────────────
  {
    key: 'visual-portfolio',
    name: 'Visual portfolio',
    description: 'Image-first layout for photographers, art directors, and visual makers. Minimal type, generous photo blocks, dense projects grid.',
    preview: '─────────────\n  ▭ minimal  \n─────────────\n  ▦  ▦       \n─────────────\n  ▦ full     \n─────────────\n  ▸ marquee  \n─────────────\n  ▦  ▦  ▦    \n─────────────\n  → CTA      \n─────────────',
    order: 2,
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'minimal',
        heading: { en: 'Look,\nthen look again.', ar: 'انظر،\nثم انظر مجدداً.' },
        subheading: { en: 'A portfolio of images, identities, and ideas.', ar: 'محفظة من الصور، الهويات، والأفكار.' },
        style: { paddingY: 0.7 },
      },
      { id: id(), type: 'projects', limit: 4, featuredOnly: true },
      {
        id: id(),
        type: 'image',
        src: photo('visual-feature', 2200, 1300),
        alt: { en: 'Feature photograph', ar: 'صورة رئيسية' },
        caption: { en: 'Feature — selected from the 2026 series.', ar: 'مختارة — من سلسلة 2026.' },
        width: 'full',
      },
      { id: id(), type: 'marquee', words: { en: 'Photography · Direction · Print · Brand · Editorial', ar: 'تصوير · توجيه · طباعة · هوية · تحرير' } },
      {
        id: id(),
        type: 'gallery',
        columns: 3,
        images: galleryImages('visual-grid', 9, [
          { en: 'Studio still life', ar: 'حياة ساكنة' },
          { en: 'Portrait, daylight', ar: 'بورتريه نهاري' },
          { en: 'Texture study', ar: 'دراسة ملمس' },
          { en: 'Architectural detail', ar: 'تفصيل معماري' },
          { en: 'On set, day two', ar: 'في الموقع، اليوم الثاني' },
          { en: 'Color study', ar: 'دراسة لونية' },
          { en: 'Print mock-up', ar: 'نموذج طباعة' },
          { en: 'Wardrobe test', ar: 'اختبار الأزياء' },
          { en: 'Final selection', ar: 'الاختيار النهائي' },
        ]),
      },
      { id: id(), type: 'projects', heading: { en: 'More', ar: 'المزيد' }, limit: 6 },
      {
        id: id(),
        type: 'cta',
        heading: { en: "Let's make something.", ar: 'لنصنع شيئاً.' },
        button: { label: { en: 'Get in touch', ar: 'تواصل' }, href: '/contact' },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // 4. Brand case study
  // ──────────────────────────────────────────────────────────────────────
  {
    key: 'brand-case',
    name: 'Brand case study',
    description: 'Split hero, the brief, the work, results in numbers, gallery, and a video walkthrough. For a single deep-dive case study.',
    preview: '─────────────\n  ❘ split    \n─────────────\n  ¶ brief    \n─────────────\n  ▦  ▦  ▦    \n─────────────\n   2x  4x    \n─────────────\n  ▸ video    \n─────────────\n  ¶ outcome  \n─────────────\n  → CTA      \n─────────────',
    order: 3,
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'split',
        eyebrow: { en: 'Case study · 2026', ar: 'دراسة حالة · 2026' },
        heading: { en: 'Maison Aïda', ar: 'ميزون عايدة' },
        subheading: { en: 'Reintroducing a 40-year-old patisserie to a new generation — without losing the families that built it.', ar: 'إعادة تقديم محلّ حلويات عمره 40 عاماً إلى جيل جديد — دون خسارة العائلات التي بنته.' },
        image: photo('case-hero', 2000, 1300),
      },
      {
        id: id(),
        type: 'text',
        heading: { en: 'The brief', ar: 'الملخّص' },
        content: {
          en: 'Set the scene in one paragraph. What was the brief, who was the audience, what did the brand need that it didn\'t have?',
          ar: 'اضبط السياق في فقرة واحدة. ما كان الملخّص؟ من الجمهور؟ ما الذي احتاجته العلامة ولم يكن لديها؟',
        },
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'gallery',
        heading: { en: 'The work', ar: 'العمل' },
        columns: 3,
        images: galleryImages('case-work', 6, [
          { en: 'Logomark exploration', ar: 'استكشاف الشعار' },
          { en: 'Packaging system', ar: 'منظومة التغليف' },
          { en: 'In-store signage', ar: 'لافتات المحل' },
          { en: 'Print campaign', ar: 'حملة مطبوعة' },
          { en: 'Storefront after', ar: 'الواجهة بعد' },
          { en: 'Pattern library', ar: 'مكتبة الأنماط' },
        ]),
      },
      {
        id: id(),
        type: 'stats',
        heading: { en: 'Outcomes', ar: 'النتائج' },
        items: [
          { value: '2.4×', label: { en: 'Engagement vs prior identity', ar: 'تفاعل مقارنة بالهوية السابقة' } },
          { value: '40%', label: { en: 'Reduction in print costs', ar: 'تقليل تكلفة الطباعة' } },
          { value: '5', label: { en: 'Award nominations', ar: 'ترشيحات لجوائز' } },
        ],
      },
      {
        id: id(),
        type: 'video',
        url: 'https://vimeo.com/76979871',
        poster: photo('case-video-poster', 1600, 900),
        caption: { en: 'Brand film — 90 seconds.', ar: 'فيلم الهوية — 90 ثانية.' },
      },
      {
        id: id(),
        type: 'text',
        heading: { en: 'In their words', ar: 'بكلماتهم' },
        content: { en: '"A pull-quote from the client. Strong, specific, and short."', ar: '"اقتباس مميّز من العميل. قوي، محدّد، وقصير."' },
        align: 'center',
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Have a brief like this?', ar: 'لديك ملخّص مشابه؟' },
        button: { label: { en: 'Talk to me', ar: 'تحدّث معي' }, href: '/contact' },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // 5. About / Studio
  // ──────────────────────────────────────────────────────────────────────
  {
    key: 'about-studio',
    name: 'About / Studio',
    description: 'Minimal hero, the studio story, numbers that matter, behind-the-scenes gallery, client quotes, and a closing CTA. The "about" page done right.',
    preview: '─────────────\n  ▭ about    \n─────────────\n  ¶ story    \n─────────────\n  12  4  8   \n─────────────\n  ▦  ▦  ▦    \n─────────────\n  ❝quotes❞   \n─────────────\n  → CTA      \n─────────────',
    order: 4,
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'minimal',
        eyebrow: { en: 'Studio', ar: 'الستوديو' },
        heading: { en: 'About', ar: 'من نحن' },
        subheading: { en: 'On craft, process, and the people I work with.', ar: 'عن الحرفة، العملية، والأشخاص الذين أعمل معهم.' },
      },
      {
        id: id(),
        type: 'text',
        heading: { en: 'Hello.', ar: 'مرحباً.' },
        content: {
          en: "I'm a creative professional based in Lebanon, working across brand identity, photography, podcasting, and video editing.\n\nI combine illustration, art direction, motion, and Adobe-suite craft to help brands and concepts find their visual voice.",
          ar: 'مبدعة مقيمة في لبنان تعمل على الهويات البصرية، التصوير، البودكاست والمونتاج.\n\nأمزج الرسم، التوجيه الفني، الموشن وأدوات أدوبي لمساعدة العلامات والمشاريع على إيجاد صوتها البصري.',
        },
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'stats',
        heading: { en: 'In numbers', ar: 'بالأرقام' },
        items: [
          { value: '12+', label: { en: 'Years', ar: 'سنوات' } },
          { value: '80', label: { en: 'Projects shipped', ar: 'مشاريع' } },
          { value: '30', label: { en: 'Brands', ar: 'علامات' } },
          { value: '4', label: { en: 'Awards', ar: 'جوائز' } },
        ],
      },
      {
        id: id(),
        type: 'gallery',
        heading: { en: 'In the studio', ar: 'في الستوديو' },
        columns: 3,
        images: galleryImages('studio-bts', 6, [
          { en: 'The studio, morning light', ar: 'الستوديو، ضوء الصباح' },
          { en: 'Working desk', ar: 'مكتب العمل' },
          { en: 'Print samples on the wall', ar: 'عيّنات طباعة على الجدار' },
          { en: 'Camera at rest', ar: 'الكاميرا في الاستراحة' },
          { en: 'Coffee, always', ar: 'قهوة، دائماً' },
          { en: 'After hours', ar: 'بعد ساعات العمل' },
        ]),
      },
      { id: id(), type: 'testimonials', heading: { en: 'Words from clients', ar: 'كلمات من العملاء' }, featuredOnly: true, limit: 3, variant: 'cards' },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Want to work together?', ar: 'هل تودّ التعاون؟' },
        subheading: { en: 'I take on a small number of long-term partnerships each year.', ar: 'أقبل عدداً محدوداً من الشراكات طويلة الأمد كل عام.' },
        button: { label: { en: 'Get in touch', ar: 'تواصل معي' }, href: '/contact' },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // 6. Long-form story / Journal
  // ──────────────────────────────────────────────────────────────────────
  {
    key: 'longform-story',
    name: 'Long-form story',
    description: 'Editorial pacing: minimal hero, alternating text and full-bleed photographs, ending in a quiet CTA. For case studies, journal posts, and long reads.',
    preview: '─────────────\n  ▭ minimal  \n─────────────\n  ¶ text     \n─────────────\n  ▦ image    \n─────────────\n  ¶ text     \n─────────────\n  ▦ full     \n─────────────\n  ¶ text     \n─────────────\n  ❝ quote ❞  \n─────────────\n  → CTA      \n─────────────',
    order: 5,
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'minimal',
        eyebrow: { en: 'Journal', ar: 'يوميات' },
        heading: { en: 'A new headline', ar: 'عنوان جديد' },
        subheading: { en: 'The deck. One sentence that sets up the piece without giving it away.', ar: 'الافتتاحية. جملة واحدة تمهّد للقطعة دون أن تكشفها.' },
      },
      {
        id: id(),
        type: 'text',
        content: {
          en: 'Lead paragraph. Set the scene in two or three sentences. The reader should know, by the end of this graf, why they should keep reading.',
          ar: 'الفقرة الافتتاحية. اضبط السياق في جملتين أو ثلاث. يجب أن يعرف القارئ، بنهاية هذه الفقرة، لماذا عليه المتابعة.',
        },
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'image',
        src: photo('longform-open', 1800, 1100),
        alt: { en: 'Opening image of the story', ar: 'صورة افتتاح القصة' },
        caption: { en: 'A first image — sets the visual tone.', ar: 'صورة أولى — تضبط الإيقاع البصري.' },
        width: 'wide',
      },
      {
        id: id(),
        type: 'text',
        content: {
          en: 'Continue the story. Photographs do the heavy lifting between paragraphs. Each block should feel like a turning page.',
          ar: 'تابع الحكاية. تتولّى الصور الجزء الأكبر بين الفقرات. يجب أن يشبه كل بلوك صفحة تنقلب.',
        },
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'image',
        src: photo('longform-midfull', 2400, 1300),
        alt: { en: 'Full-bleed second image', ar: 'صورة ثانية ممتدة' },
        caption: { en: 'Midway image — give the reader a place to breathe.', ar: 'صورة وسطى — اترك للقارئ فسحة.' },
        width: 'full',
      },
      {
        id: id(),
        type: 'text',
        content: { en: '"A pull-quote, set apart from the body. Big serif, narrow column, plenty of air."', ar: '"اقتباس مميّز، منفصل عن النص. خط كبير، عمود ضيّق، وفسحة كبيرة."' },
        align: 'center',
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'text',
        content: {
          en: 'Closing thoughts. What did you learn from the project? What\'s next? Two short paragraphs, no more.',
          ar: 'الخاتمة. ماذا تعلّمت من المشروع؟ ما القادم؟ فقرتان قصيرتان لا أكثر.',
        },
        style: { maxWidth: 'narrow' },
      },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Liked this?', ar: 'أعجبك؟' },
        button: { label: { en: 'More writing', ar: 'المزيد من الكتابة' }, href: '/projects' },
      },
    ],
  },
];

// Compatibility shim: pre-DB code referenced PAGE_TEMPLATES + getTemplate().
// Those callers were updated to use the DB instead — these stay so any
// external consumer that imported them still works at runtime.
export const PAGE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from nothing. Add blocks one by one.',
    preview: '\n         (empty)\n',
    build: () => [] as Block[],
  },
  ...STARTER_TEMPLATES.map((t) => ({
    id: t.key,
    name: t.name,
    description: t.description,
    preview: t.preview,
    build: t.build,
  })),
];

export function getTemplate(key: string) {
  return PAGE_TEMPLATES.find((t) => t.id === key);
}
