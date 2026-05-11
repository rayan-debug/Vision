import { PrismaClient, PageStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();
const blockId = () => randomUUID();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? 'change-me';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash },
    create: { email, password: passwordHash, name: 'Roua Bou Ghanem', role: 'ADMIN' },
  });
  console.log(`✓ Admin user: ${email}`);

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      i18n: {
        en: {
          siteName: 'The Vision',
          tagline: 'Visual power, in every frame.',
          bio: "I'm a passionate and ambitious creative professional based in Lebanon, specialising in media production, visual storytelling, and digital content creation. My work combines creative strategy, art-direction and a relentless attention to detail across graphic design, photography, podcasting and video editing.",
        },
        ar: {
          siteName: 'ذا فيجن',
          tagline: 'قوة بصرية في كل إطار.',
          bio: 'مبدعة شغوفة وطموحة مقيمة في لبنان، متخصصة في الإنتاج الإعلامي والسرد البصري وصناعة المحتوى الرقمي. أمزج في عملي بين الاستراتيجية الإبداعية والتوجيه الفني واهتمام دقيق بالتفاصيل، عبر التصميم الجرافيكي والتصوير والبودكاست ومونتاج الفيديو.',
        },
      },
      email: 'hello@thevision.studio',
      location: 'Beirut, Lebanon · Remote worldwide',
      instagram: 'https://instagram.com/_msvision_studio',
      behance: '',
      primaryColor: '#0a0a0a',
      accentColor: '#ff5a1f',
      faqs: [
        {
          q: { en: 'What services do you offer?', ar: 'ما الخدمات التي تقدّمينها؟' },
          a: {
            en: 'Graphic design, photography, podcast production, and video editing — across brand, editorial, and social.',
            ar: 'التصميم الجرافيكي، التصوير، إنتاج البودكاست ومونتاج الفيديو — للهويات التجارية، الإعلانات التحريرية ومنصات التواصل.',
          },
        },
        {
          q: { en: 'Do you take on long-term retainers?', ar: 'هل تقبلين عقود تعاون شهرية طويلة الأمد؟' },
          a: {
            en: 'Yes — I reserve a small number of monthly retainers for brands that need consistent visual output.',
            ar: 'نعم — أحتفظ بعدد محدود من الاشتراكات الشهرية للعلامات التي تحتاج إنتاجاً بصرياً منتظماً.',
          },
        },
        {
          q: { en: 'Where are you based?', ar: 'أين تقيمين؟' },
          a: {
            en: 'Beirut, Lebanon — and I work remotely with clients across the MENA region, Europe, and North America.',
            ar: 'في بيروت، لبنان — وأعمل عن بُعد مع عملاء في منطقة الشرق الأوسط وشمال إفريقيا وأوروبا وأمريكا الشمالية.',
          },
        },
      ],
    },
  });
  console.log('✓ Site settings');

  const homeBlocks = [
    {
      id: blockId(),
      type: 'hero',
      variant: 'fullscreen',
      eyebrow: { en: '@_msvision_studio', ar: '@_msvision_studio' },
      heading: { en: 'Graphic Designer', ar: 'مصمّمة جرافيك' },
      subheading: {
        en: 'Roua Bou Ghanem — visual power, in every frame.',
        ar: 'روى بو غانم — قوة بصرية في كل إطار.',
      },
      cta: { label: { en: 'See the work', ar: 'شاهد الأعمال' }, href: '/projects' },
    },
    {
      id: blockId(),
      type: 'marquee',
      words: {
        en: 'Graphic design · Photography · Podcast · Video editing · Brand · Editorial',
        ar: 'تصميم جرافيكي · تصوير · بودكاست · مونتاج فيديو · هويات · إعلانات',
      },
    },
    {
      id: blockId(),
      type: 'services',
      heading: { en: 'What I do', ar: 'ما أقدّمه' },
    },
    {
      id: blockId(),
      type: 'projects',
      heading: { en: 'Selected work', ar: 'مختارات من الأعمال' },
      featuredOnly: true,
      limit: 6,
    },
    {
      id: blockId(),
      type: 'text',
      heading: { en: 'A short note', ar: 'كلمة قصيرة' },
      content: {
        en: "I'm a passionate and ambitious creative professional based in Lebanon, skilled in producing high-quality design concepts and strategies. I combine illustration, art-direction, motion, and Adobe-suite craft to help brands and concepts find their visual voice.",
        ar: 'مبدعة شغوفة وطموحة مقيمة في لبنان، أُتقن إنتاج المفاهيم والاستراتيجيات التصميمية عالية الجودة. أمزج بين الرسم والتوجيه الفني والموشن وأدوات أدوبي لمساعدة العلامات والمشاريع على إيجاد صوتها البصري.',
      },
    },
    {
      id: blockId(),
      type: 'faq',
      heading: { en: 'Frequently asked', ar: 'أسئلة متكرّرة' },
      items: [
        {
          q: { en: 'How do we start a project?', ar: 'كيف نبدأ مشروعاً؟' },
          a: {
            en: 'Send a brief through the contact page. I reply within 48 hours with availability and next steps.',
            ar: 'أرسل/ي ملخّصاً عبر صفحة التواصل، وأردّ خلال 48 ساعة بمواعيدي والخطوات التالية.',
          },
        },
        {
          q: { en: 'Do you ship physical deliverables?', ar: 'هل تُسلّمين منتجات مطبوعة؟' },
          a: {
            en: 'Print-ready files, yes. Production and shipping I coordinate with vetted print partners.',
            ar: 'ملفات جاهزة للطباعة نعم. أمّا التنفيذ والشحن فأنسّقهما مع شركاء طباعة موثوقين.',
          },
        },
      ],
    },
    {
      id: blockId(),
      type: 'cta',
      heading: { en: 'Have a vision?', ar: 'لديك رؤية؟' },
      subheading: {
        en: "Let's give it a shape. Tell me about your project.",
        ar: 'لنمنحها شكلاً. حدّثيني/حدّثني عن مشروعك.',
      },
      button: { label: { en: 'Start a project', ar: 'ابدأ مشروعاً' }, href: '/contact' },
    },
  ];

  await prisma.page.upsert({
    where: { slugEn: 'home' },
    update: { blocks: homeBlocks },
    create: {
      slugEn: 'home',
      slugAr: 'home',
      isHome: true,
      showInNav: false,
      navOrder: 0,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: {
          title: 'The Vision — Roua Bou Ghanem · Graphic Designer',
          description:
            'Graphic design, photography, podcast production, and video editing by Roua Bou Ghanem. Independent creative studio based in Lebanon, working worldwide.',
          keywords: 'graphic designer, photographer, podcast producer, video editor, Lebanon, brand, editorial, portfolio',
        },
        ar: {
          title: 'ذا فيجن — روى بو غانم · مصمّمة جرافيك',
          description:
            'تصميم جرافيكي وتصوير وإنتاج بودكاست ومونتاج فيديو لـ روى بو غانم. ستوديو إبداعي مستقل في لبنان يعمل حول العالم.',
          keywords: 'مصممة جرافيك, مصور, بودكاست, مونتاج فيديو, لبنان, هوية بصرية, إعلانات, أعمال',
        },
      },
      blocks: homeBlocks,
    },
  });
  console.log('✓ Home page');

  await prisma.page.upsert({
    where: { slugEn: 'about' },
    update: {},
    create: {
      slugEn: 'about',
      slugAr: 'about',
      navOrder: 1,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: { title: 'About — The Vision', description: 'About Roua Bou Ghanem, independent graphic designer.' },
        ar: { title: 'من نحن — ذا فيجن', description: 'عن روى بو غانم، مصمّمة جرافيك مستقلة.' },
      },
      blocks: [
        {
          id: blockId(),
          type: 'hero',
          variant: 'minimal',
          heading: { en: 'About', ar: 'من نحن' },
          subheading: {
            en: 'On craft, process, and the people I work with.',
            ar: 'عن الحرفة، العملية، والأشخاص الذين أعمل معهم.',
          },
        },
        {
          id: blockId(),
          type: 'text',
          content: {
            en: "I'm a passionate and ambitious creative professional based in Lebanon, skilled in the production of high-quality design concepts and strategies. I combine illustration, art-direction, motion, and Adobe-suite craft to help brands and concepts find their visual voice.\n\nI'm flexible, hard-working, well-organised, and a clear communicator — equally comfortable working solo on a single deliverable or leading a small team on a long-running engagement. My goal on every project is to secure ongoing partnerships, not just one-off output.",
            ar: 'مبدعة شغوفة وطموحة مقيمة في لبنان، أُتقن إنتاج المفاهيم والاستراتيجيات التصميمية عالية الجودة. أمزج بين الرسم والتوجيه الفني والموشن وأدوات أدوبي لأساعد العلامات والمشاريع على إيجاد صوتها البصري.\n\nأمتاز بالمرونة والجدية والتنظيم ووضوح التواصل — مرتاحة في العمل منفردة على مهمّة محدّدة أو في قيادة فريق صغير ضمن تعاون طويل الأمد. هدفي في كل مشروع هو بناء شراكة مستمرّة، لا تسليم لمرّة واحدة.',
          },
        },
        {
          id: blockId(),
          type: 'cta',
          heading: { en: 'Want to work together?', ar: 'هل تودّ التعاون؟' },
          button: { label: { en: 'Get in touch', ar: 'تواصل معي' }, href: '/contact' },
        },
      ],
    },
  });
  console.log('✓ About page');

  await prisma.page.upsert({
    where: { slugEn: 'services' },
    update: {},
    create: {
      slugEn: 'services',
      slugAr: 'services',
      navOrder: 2,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: { title: 'Services — The Vision', description: 'Graphic design, photography, podcast, video editing.' },
        ar: { title: 'الخدمات — ذا فيجن', description: 'تصميم جرافيكي، تصوير، بودكاست، مونتاج فيديو.' },
      },
      blocks: [
        {
          id: blockId(),
          type: 'hero',
          variant: 'minimal',
          heading: { en: 'Services', ar: 'الخدمات' },
          subheading: { en: 'Four disciplines, one vision.', ar: 'أربعة تخصّصات، رؤية واحدة.' },
        },
        { id: blockId(), type: 'services' },
        {
          id: blockId(),
          type: 'cta',
          heading: { en: 'Ready to start?', ar: 'جاهز للبدء؟' },
          button: { label: { en: 'Send a brief', ar: 'أرسل ملخّصاً' }, href: '/contact' },
        },
      ],
    },
  });
  console.log('✓ Services page');

  await prisma.page.upsert({
    where: { slugEn: 'contact' },
    update: {},
    create: {
      slugEn: 'contact',
      slugAr: 'contact',
      navOrder: 4,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: { title: 'Contact — The Vision', description: 'Start a project with Roua.' },
        ar: { title: 'تواصل — ذا فيجن', description: 'ابدأ مشروعاً مع روى.' },
      },
      blocks: [
        {
          id: blockId(),
          type: 'hero',
          variant: 'minimal',
          heading: { en: 'Let’s talk.', ar: 'لنتحدّث.' },
          subheading: {
            en: 'Tell me about your project — I respond within two working days.',
            ar: 'حدّثني عن مشروعك — أردّ خلال يومَي عمل.',
          },
        },
        { id: blockId(), type: 'contact' },
      ],
    },
  });
  console.log('✓ Contact page');

  const services = [
    {
      icon: '✦',
      en: { title: 'Graphic design', description: 'Brand identity, editorial, posters, social systems, packaging — built to scale across every touchpoint.' },
      ar: { title: 'التصميم الجرافيكي', description: 'هويات بصرية، تصميم إعلاني وتحريري، ملصقات، أنظمة سوشيال، تغليف — مصمّمة للتوسّع عبر كل نقطة تواصل.' },
    },
    {
      icon: '◐',
      en: { title: 'Photography', description: 'Portrait, product, and editorial photography with a directed, story-led approach.' },
      ar: { title: 'التصوير', description: 'تصوير شخصي ومنتجات وتصوير إعلاني بمنهجية موجَّهة وسردٍ بصري.' },
    },
    {
      icon: '◉',
      en: { title: 'Podcast', description: 'End-to-end podcast production: brand, art direction, recording, editing, and release.' },
      ar: { title: 'البودكاست', description: 'إنتاج بودكاست كامل: الهوية، التوجيه الفني، التسجيل، المونتاج والنشر.' },
    },
    {
      icon: '▷',
      en: { title: 'Video editing', description: 'Cuts for campaigns, social, and long-form — colour, sound, motion typography included.' },
      ar: { title: 'مونتاج الفيديو', description: 'مونتاج للحملات والسوشيال والفيديوهات الطويلة — مع تصحيح ألوان وصوت وتايبوغرافيا متحرّكة.' },
    },
  ];

  await prisma.service.deleteMany();
  for (const [index, s] of services.entries()) {
    await prisma.service.create({
      data: { order: index, icon: s.icon, i18n: { en: s.en, ar: s.ar } },
    });
  }
  console.log(`✓ ${services.length} services`);

  const projects = [
    {
      slugEn: 'maison-or-identity',
      slugAr: 'maison-or-identity',
      category: 'Brand identity',
      year: 2025,
      featured: true,
      tags: ['Identity', 'Type', 'Print'],
      coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1600',
      images: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1600',
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1600',
      ],
      i18n: {
        en: { title: 'Maison Or', description: 'Wordmark and editorial system for a patisserie.', fullContent: '', client: 'Maison Or', role: 'Identity, type, art direction' },
        ar: { title: 'ميزون أور', description: 'شعار نصّي ونظام تحريري لمحل حلويات.', fullContent: '', client: 'ميزون أور', role: 'هوية، تايبوغرافيا، توجيه فني' },
      },
    },
    {
      slugEn: 'kairos-magazine',
      slugAr: 'kairos-magazine',
      category: 'Editorial',
      year: 2024,
      featured: true,
      tags: ['Editorial', 'Print'],
      coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600',
      images: ['https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600'],
      i18n: {
        en: { title: 'Kairos Magazine', description: 'Quarterly print magazine on slow culture.', fullContent: '', client: 'Kairos', role: 'Art direction, layout' },
        ar: { title: 'مجلة كايروس', description: 'مجلة فصلية مطبوعة عن الثقافة الهادئة.', fullContent: '', client: 'كايروس', role: 'توجيه فني، تنضيد' },
      },
    },
    {
      slugEn: 'late-hours-podcast',
      slugAr: 'late-hours-podcast',
      category: 'Podcast',
      year: 2024,
      featured: true,
      tags: ['Podcast', 'Sound', 'Brand'],
      coverImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600',
      images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600'],
      i18n: {
        en: { title: 'Late Hours', description: 'Identity and production for a night-shift culture podcast.', fullContent: '', client: 'Late Hours', role: 'Identity, production' },
        ar: { title: 'ليت آورز', description: 'هوية وإنتاج لبودكاست عن ثقافة العمل الليلي.', fullContent: '', client: 'ليت آورز', role: 'هوية، إنتاج' },
      },
    },
    {
      slugEn: 'verde-packaging',
      slugAr: 'verde-packaging',
      category: 'Packaging',
      year: 2024,
      featured: true,
      tags: ['Packaging', 'Sustainability'],
      coverImage: 'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=1600',
      images: ['https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=1600'],
      i18n: {
        en: { title: 'Verde', description: 'Sustainable packaging for a cold-pressed juice brand.', fullContent: '', client: 'Verde', role: 'Packaging, identity' },
        ar: { title: 'فيردي', description: 'تغليف مستدام لعلامة عصائر مضغوطة على البارد.', fullContent: '', client: 'فيردي', role: 'تغليف، هوية' },
      },
    },
    {
      slugEn: 'atlas-app',
      slugAr: 'atlas-app',
      category: 'Digital',
      year: 2024,
      featured: false,
      tags: ['UI', 'Motion'],
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600',
      images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600'],
      i18n: {
        en: { title: 'Atlas', description: 'Visual system for a maps-first travel app.', fullContent: '', client: 'Atlas', role: 'UI, motion direction' },
        ar: { title: 'أطلس', description: 'نظام بصري لتطبيق سفر يعتمد الخرائط أولاً.', fullContent: '', client: 'أطلس', role: 'واجهات، توجيه موشن' },
      },
    },
    {
      slugEn: 'nuit-festival-campaign',
      slugAr: 'nuit-festival-campaign',
      category: 'Art direction',
      year: 2023,
      featured: false,
      tags: ['Campaign', 'Photo', 'Print'],
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600',
      images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600'],
      i18n: {
        en: { title: 'Nuit Festival', description: 'Campaign, posters, and motion for an electronic music festival.', fullContent: '', client: 'Nuit', role: 'Art direction, photo' },
        ar: { title: 'مهرجان نوي', description: 'حملة وملصقات وموشن لمهرجان موسيقى إلكترونية.', fullContent: '', client: 'نوي', role: 'توجيه فني، تصوير' },
      },
    },
  ];

  for (const [i, p] of projects.entries()) {
    await prisma.project.upsert({
      where: { slugEn: p.slugEn },
      update: {},
      create: { ...p, order: i, status: PageStatus.PUBLISHED, publishedAt: new Date() },
    });
  }
  console.log(`✓ ${projects.length} projects`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
