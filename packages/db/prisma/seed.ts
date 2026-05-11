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
        fr: {
          siteName: 'The Vision',
          tagline: 'La puissance du visuel, dans chaque image.',
          bio: "Je suis une créative passionnée et ambitieuse, basée au Liban, spécialisée dans la production média, la narration visuelle et la création de contenu numérique. Mon travail combine stratégie créative, direction artistique et une attention obsessionnelle au détail, à travers le design graphique, la photographie, le podcast et le montage vidéo.",
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
          q: { en: 'What services do you offer?', fr: 'Quels services proposez-vous ?' },
          a: {
            en: 'Graphic design, photography, podcast production, and video editing — across brand, editorial, and social.',
            fr: 'Design graphique, photographie, production de podcasts et montage vidéo — pour des marques, de l’édition et les réseaux sociaux.',
          },
        },
        {
          q: { en: 'Do you take on long-term retainers?', fr: 'Acceptez-vous des contrats long-terme ?' },
          a: {
            en: 'Yes — I reserve a small number of monthly retainers for brands that need consistent visual output.',
            fr: 'Oui — je réserve quelques contrats mensuels à des marques qui ont besoin d’une production visuelle régulière.',
          },
        },
        {
          q: { en: 'Where are you based?', fr: 'Où êtes-vous basée ?' },
          a: {
            en: 'Beirut, Lebanon — and I work remotely with clients across the MENA region, Europe, and North America.',
            fr: 'À Beyrouth, au Liban — et je collabore à distance avec des clients de la région MENA, d’Europe et d’Amérique du Nord.',
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
      eyebrow: { en: '@_msvision_studio', fr: '@_msvision_studio' },
      heading: { en: 'Graphic Designer', fr: 'Graphiste' },
      subheading: {
        en: 'Roua Bou Ghanem — visual power, in every frame.',
        fr: 'Roua Bou Ghanem — la puissance du visuel, dans chaque image.',
      },
      cta: { label: { en: 'See the work', fr: 'Voir le travail' }, href: '/portfolio' },
    },
    {
      id: blockId(),
      type: 'marquee',
      words: {
        en: 'Graphic design · Photography · Podcast · Video editing · Brand · Editorial',
        fr: 'Design graphique · Photographie · Podcast · Montage vidéo · Marque · Édition',
      },
    },
    {
      id: blockId(),
      type: 'services',
      heading: { en: 'What I do', fr: 'Ce que je fais' },
    },
    {
      id: blockId(),
      type: 'projects',
      heading: { en: 'Selected work', fr: 'Sélection' },
      featuredOnly: true,
      limit: 6,
    },
    {
      id: blockId(),
      type: 'text',
      heading: { en: 'A short note', fr: 'Une note' },
      content: {
        en: "I'm a passionate and ambitious creative professional based in Lebanon, skilled in producing high-quality design concepts and strategies. I combine illustration, art-direction, motion, and Adobe-suite craft to help brands and concepts find their visual voice.",
        fr: "Créative passionnée et ambitieuse basée au Liban, je conçois des stratégies et des concepts de design soignés. Je combine illustration, direction artistique, motion et maîtrise de la suite Adobe pour aider marques et concepts à trouver leur voix visuelle.",
      },
    },
    {
      id: blockId(),
      type: 'faq',
      heading: { en: 'Frequently asked', fr: 'Questions fréquentes' },
      items: [
        {
          q: { en: 'How do we start a project?', fr: 'Comment démarre-t-on un projet ?' },
          a: {
            en: 'Send a brief through the contact page. I reply within 48 hours with availability and next steps.',
            fr: 'Envoyez un brief via la page contact. Je réponds sous 48 heures avec mes disponibilités et les prochaines étapes.',
          },
        },
        {
          q: { en: 'Do you ship physical deliverables?', fr: 'Livrez-vous des supports physiques ?' },
          a: {
            en: 'Print-ready files, yes. Production and shipping I coordinate with vetted print partners.',
            fr: 'Des fichiers prêts à imprimer, oui. La production et la livraison sont coordonnées avec des imprimeurs partenaires.',
          },
        },
      ],
    },
    {
      id: blockId(),
      type: 'cta',
      heading: { en: 'Have a vision?', fr: 'Vous avez une vision ?' },
      subheading: {
        en: "Let's give it a shape. Tell me about your project.",
        fr: 'Donnons-lui une forme. Parlez-moi de votre projet.',
      },
      button: { label: { en: 'Start a project', fr: 'Démarrer un projet' }, href: '/contact' },
    },
  ];

  await prisma.page.upsert({
    where: { slugEn: 'home' },
    update: { blocks: homeBlocks },
    create: {
      slugEn: 'home',
      slugFr: 'accueil',
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
        fr: {
          title: 'The Vision — Roua Bou Ghanem · Graphiste',
          description:
            'Design graphique, photographie, podcast et montage vidéo par Roua Bou Ghanem. Studio créatif indépendant basé au Liban, à l’international.',
          keywords: 'graphiste, photographe, podcast, monteuse vidéo, Liban, marque, édition, portfolio',
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
      slugFr: 'a-propos',
      navOrder: 1,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: { title: 'About — The Vision', description: 'About Roua Bou Ghanem, independent graphic designer.' },
        fr: { title: 'À propos — The Vision', description: 'À propos de Roua Bou Ghanem, graphiste indépendante.' },
      },
      blocks: [
        {
          id: blockId(),
          type: 'hero',
          variant: 'minimal',
          heading: { en: 'About', fr: 'À propos' },
          subheading: {
            en: 'On craft, process, and the people I work with.',
            fr: 'Sur la pratique, le processus et les personnes avec qui je travaille.',
          },
        },
        {
          id: blockId(),
          type: 'text',
          content: {
            en: "I'm a passionate and ambitious creative professional based in Lebanon, skilled in the production of high-quality design concepts and strategies. I combine illustration, art-direction, motion, and Adobe-suite craft to help brands and concepts find their visual voice.\n\nI'm flexible, hard-working, well-organised, and a clear communicator — equally comfortable working solo on a single deliverable or leading a small team on a long-running engagement. My goal on every project is to secure ongoing partnerships, not just one-off output.",
            fr: "Créative passionnée et ambitieuse basée au Liban, je produis des concepts et stratégies de design soignés. Je combine illustration, direction artistique, motion et maîtrise de la suite Adobe pour aider marques et concepts à trouver leur voix visuelle.\n\nFlexible, rigoureuse, organisée et claire dans la communication — je suis aussi à l’aise sur un livrable unique qu’à diriger une petite équipe sur une mission au long cours. Mon objectif : nouer des partenariats durables, pas seulement livrer.",
          },
        },
        {
          id: blockId(),
          type: 'cta',
          heading: { en: 'Want to work together?', fr: 'Envie de collaborer ?' },
          button: { label: { en: 'Get in touch', fr: 'Me contacter' }, href: '/contact' },
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
      slugFr: 'services',
      navOrder: 2,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: { title: 'Services — The Vision', description: 'Graphic design, photography, podcast, video editing.' },
        fr: { title: 'Services — The Vision', description: 'Design graphique, photo, podcast, montage vidéo.' },
      },
      blocks: [
        {
          id: blockId(),
          type: 'hero',
          variant: 'minimal',
          heading: { en: 'Services', fr: 'Services' },
          subheading: { en: 'Four disciplines, one vision.', fr: 'Quatre disciplines, une seule vision.' },
        },
        { id: blockId(), type: 'services' },
        {
          id: blockId(),
          type: 'cta',
          heading: { en: 'Ready to start?', fr: 'Prêt·e à commencer ?' },
          button: { label: { en: 'Send a brief', fr: 'Envoyer un brief' }, href: '/contact' },
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
      slugFr: 'contact',
      navOrder: 4,
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      i18n: {
        en: { title: 'Contact — The Vision', description: 'Start a project with Roua.' },
        fr: { title: 'Contact — The Vision', description: 'Démarrez un projet avec Roua.' },
      },
      blocks: [
        {
          id: blockId(),
          type: 'hero',
          variant: 'minimal',
          heading: { en: 'Let’s talk.', fr: 'Parlons-en.' },
          subheading: {
            en: 'Tell me about your project — I respond within two working days.',
            fr: 'Parlez-moi de votre projet — je réponds sous deux jours ouvrés.',
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
      fr: { title: 'Design graphique', description: 'Identité de marque, édition, affiches, systèmes social, packaging — pensés pour passer à l’échelle.' },
    },
    {
      icon: '◐',
      en: { title: 'Photography', description: 'Portrait, product, and editorial photography with a directed, story-led approach.' },
      fr: { title: 'Photographie', description: 'Portrait, produit et photographie éditoriale, avec une direction et un récit assumés.' },
    },
    {
      icon: '◉',
      en: { title: 'Podcast', description: 'End-to-end podcast production: brand, art direction, recording, editing, and release.' },
      fr: { title: 'Podcast', description: 'Production de podcast de bout en bout : marque, direction artistique, prise de son, montage et diffusion.' },
    },
    {
      icon: '▷',
      en: { title: 'Video editing', description: 'Cuts for campaigns, social, and long-form — colour, sound, motion typography included.' },
      fr: { title: 'Montage vidéo', description: 'Montages pour campagnes, social et formats longs — étalonnage, son et motion typo inclus.' },
    },
  ];

  await prisma.service.deleteMany();
  for (const [index, s] of services.entries()) {
    await prisma.service.create({
      data: { order: index, icon: s.icon, i18n: { en: s.en, fr: s.fr } },
    });
  }
  console.log(`✓ ${services.length} services`);

  const projects = [
    {
      slugEn: 'maison-or-identity',
      slugFr: 'identite-maison-or',
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
        fr: { title: 'Maison Or', description: 'Logotype et système éditorial pour une pâtisserie.', fullContent: '', client: 'Maison Or', role: 'Identité, typographie, direction artistique' },
      },
    },
    {
      slugEn: 'kairos-magazine',
      slugFr: 'magazine-kairos',
      category: 'Editorial',
      year: 2024,
      featured: true,
      tags: ['Editorial', 'Print'],
      coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600',
      images: ['https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600'],
      i18n: {
        en: { title: 'Kairos Magazine', description: 'Quarterly print magazine on slow culture.', fullContent: '', client: 'Kairos', role: 'Art direction, layout' },
        fr: { title: 'Magazine Kairos', description: 'Magazine trimestriel sur la culture lente.', fullContent: '', client: 'Kairos', role: 'Direction artistique, mise en page' },
      },
    },
    {
      slugEn: 'late-hours-podcast',
      slugFr: 'podcast-late-hours',
      category: 'Podcast',
      year: 2024,
      featured: true,
      tags: ['Podcast', 'Sound', 'Brand'],
      coverImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600',
      images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600'],
      i18n: {
        en: { title: 'Late Hours', description: 'Identity and production for a night-shift culture podcast.', fullContent: '', client: 'Late Hours', role: 'Identity, production' },
        fr: { title: 'Late Hours', description: 'Identité et production d’un podcast sur la culture de nuit.', fullContent: '', client: 'Late Hours', role: 'Identité, production' },
      },
    },
    {
      slugEn: 'verde-packaging',
      slugFr: 'packaging-verde',
      category: 'Packaging',
      year: 2024,
      featured: true,
      tags: ['Packaging', 'Sustainability'],
      coverImage: 'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=1600',
      images: ['https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=1600'],
      i18n: {
        en: { title: 'Verde', description: 'Sustainable packaging for a cold-pressed juice brand.', fullContent: '', client: 'Verde', role: 'Packaging, identity' },
        fr: { title: 'Verde', description: 'Packaging durable pour une marque de jus pressés à froid.', fullContent: '', client: 'Verde', role: 'Packaging, identité' },
      },
    },
    {
      slugEn: 'atlas-app',
      slugFr: 'application-atlas',
      category: 'Digital',
      year: 2024,
      featured: false,
      tags: ['UI', 'Motion'],
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600',
      images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600'],
      i18n: {
        en: { title: 'Atlas', description: 'Visual system for a maps-first travel app.', fullContent: '', client: 'Atlas', role: 'UI, motion direction' },
        fr: { title: 'Atlas', description: 'Système visuel pour une application de voyage centrée carte.', fullContent: '', client: 'Atlas', role: 'UI, direction motion' },
      },
    },
    {
      slugEn: 'nuit-festival-campaign',
      slugFr: 'campagne-festival-nuit',
      category: 'Art direction',
      year: 2023,
      featured: false,
      tags: ['Campaign', 'Photo', 'Print'],
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600',
      images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600'],
      i18n: {
        en: { title: 'Nuit Festival', description: 'Campaign, posters, and motion for an electronic music festival.', fullContent: '', client: 'Nuit', role: 'Art direction, photo' },
        fr: { title: 'Festival Nuit', description: 'Campagne, affiches et motion pour un festival de musique électronique.', fullContent: '', client: 'Nuit', role: 'Direction artistique, photo' },
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
