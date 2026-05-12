import type { Block } from './types';

// ────────────────────────────────────────────────────────────────────────────
// Page layout templates.
//
// Each template returns a fresh array of blocks with unique IDs. Surface them
// in the admin when:
//   • creating a brand new page ("Start from template")
//   • or inserting into an empty page editor
//
// Adding a template? Pick a memorable id, a one-line description that says
// what shows up on the resulting page, and a build() that emits localized
// blocks with sensible defaults.
// ────────────────────────────────────────────────────────────────────────────

function id(): string {
  // crypto.randomUUID is available in modern Node and browsers. Falls back to
  // Math.random for ancient runtimes (the value just needs to be unique within
  // the page).
  try {
    return crypto.randomUUID();
  } catch {
    return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

const emptyLoc = () => ({ en: '', ar: '' });

export type PageTemplate = {
  id: string;
  name: string;
  description: string;
  // ASCII preview shown next to the name in the picker. Each line = a block.
  preview: string;
  build(): Block[];
};

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from nothing. Add blocks one by one.',
    preview: '\n         (empty)\n',
    build: () => [],
  },

  {
    id: 'landing',
    name: 'Landing / Home',
    description: 'Hero, services, featured work, testimonials, and a closing CTA — the classic portfolio home.',
    preview: '─────────────\n  HERO       \n─────────────\n  ▸ marquee  \n─────────────\n  services   \n─────────────\n  projects ▦ \n─────────────\n  ❝quotes❞   \n─────────────\n  → CTA      \n─────────────',
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'fullscreen',
        eyebrow: { en: '@studio', ar: '@studio' },
        heading: { en: 'Visual power,\nin every frame.', ar: 'قوة بصرية،\nفي كل إطار.' },
        subheading: { en: 'A creative studio building brands, photography, and motion.', ar: 'ستوديو إبداعي يبني الهويات، التصوير والموشن.' },
        cta: { label: { en: 'See the work', ar: 'شاهد الأعمال' }, href: '/projects' },
      },
      { id: id(), type: 'marquee', words: { en: 'Brand · Editorial · Photography · Podcast · Motion', ar: 'هوية · تحرير · تصوير · بودكاست · موشن' } },
      { id: id(), type: 'services', heading: { en: 'What I do', ar: 'ما أقدّمه' } },
      { id: id(), type: 'projects', heading: { en: 'Selected work', ar: 'مختارات' }, featuredOnly: true, limit: 6 },
      { id: id(), type: 'testimonials', heading: { en: 'Words from clients', ar: 'كلمات من العملاء' }, featuredOnly: true, limit: 3, variant: 'cards' },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Have a vision?', ar: 'لديك رؤية؟' },
        subheading: { en: 'Tell me about your project — I reply within 48 hours.', ar: 'حدّثني عن مشروعك — أرد خلال 48 ساعة.' },
        button: { label: { en: 'Start a project', ar: 'ابدأ مشروعاً' }, href: '/contact' },
      },
    ],
  },

  {
    id: 'about',
    name: 'About / Studio',
    description: 'A short, editorial layout: minimal hero, story, big stats, a gallery of work, and a closing CTA.',
    preview: '─────────────\n  about ▭    \n─────────────\n  story…     \n─────────────\n  12  4  8   \n─────────────\n  ▦ ▦ ▦      \n─────────────\n  → CTA      \n─────────────',
    build: () => [
      {
        id: id(),
        type: 'hero',
        variant: 'minimal',
        heading: { en: 'About', ar: 'من نحن' },
        subheading: { en: 'On craft, process, and the people I work with.', ar: 'عن الحرفة، العملية، والأشخاص الذين أعمل معهم.' },
      },
      {
        id: id(),
        type: 'text',
        heading: { en: 'Studio', ar: 'الستوديو' },
        content: {
          en: "I'm a creative professional based in Lebanon, working across brand identity, photography, podcasting, and video editing.\n\nI combine illustration, art direction, motion, and Adobe-suite craft to help brands and concepts find their visual voice.",
          ar: 'مبدعة مقيمة في لبنان تعمل على الهويات البصرية، التصوير، البودكاست والمونتاج.\n\nأمزج الرسم، التوجيه الفني، الموشن وأدوات أدوبي لمساعدة العلامات والمشاريع على إيجاد صوتها البصري.',
        },
        align: 'left',
      },
      {
        id: id(),
        type: 'stats',
        items: [
          { value: '12+', label: { en: 'Years', ar: 'سنوات' } },
          { value: '80', label: { en: 'Projects shipped', ar: 'مشاريع منجزة' } },
          { value: '30', label: { en: 'Brands', ar: 'علامات تجارية' } },
          { value: '5', label: { en: 'Awards', ar: 'جوائز' } },
        ],
      },
      { id: id(), type: 'gallery', heading: { en: 'In the studio', ar: 'في الستوديو' }, columns: 3, images: [] },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Want to work together?', ar: 'هل تودّ التعاون؟' },
        button: { label: { en: 'Get in touch', ar: 'تواصل معي' }, href: '/contact' },
      },
    ],
  },

  {
    id: 'longform',
    name: 'Long-form / Journal',
    description: 'Quiet, editorial cadence: minimal hero, alternating text and full-bleed images. For case studies and journal posts.',
    preview: '─────────────\n  ▭ minimal  \n─────────────\n  ¶ text     \n─────────────\n  ▦ image    \n─────────────\n  ¶ text     \n─────────────\n  ▦ image    \n─────────────\n  ¶ text     \n─────────────\n  → CTA      \n─────────────',
    build: () => [
      { id: id(), type: 'hero', variant: 'minimal', heading: { en: 'A new headline', ar: 'عنوان جديد' }, subheading: emptyLoc() },
      { id: id(), type: 'text', content: { en: 'Lead paragraph. Set the scene in two or three sentences.', ar: 'الفقرة الافتتاحية. اضبط السياق في جملتين أو ثلاث.' } },
      { id: id(), type: 'image', src: '', alt: emptyLoc(), caption: emptyLoc(), width: 'wide' },
      { id: id(), type: 'text', content: { en: 'Continue the story. Photographs do the heavy lifting between paragraphs.', ar: 'تابع الحكاية. تتولّى الصور الجزء الأكبر بين الفقرات.' } },
      { id: id(), type: 'image', src: '', alt: emptyLoc(), caption: emptyLoc(), width: 'full' },
      { id: id(), type: 'text', content: { en: 'Closing thoughts. What did you learn? What\'s next?', ar: 'خاتمة. ماذا تعلّمت؟ ما القادم؟' } },
      {
        id: id(),
        type: 'cta',
        heading: { en: 'Liked this?', ar: 'أعجبك؟' },
        button: { label: { en: 'More writing', ar: 'المزيد من الكتابة' }, href: '/projects' },
      },
    ],
  },
];

export function getTemplate(templateId: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.id === templateId);
}
