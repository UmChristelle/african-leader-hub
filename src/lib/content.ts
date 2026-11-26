import { prisma } from "@/lib/prisma";
import { cache } from "react";

const programInclude = {
  imageAsset: true,
  bannerAsset: true,
  brochureAsset: true,
  brochurePreviewAsset: true,
  ogImageAsset: true,
  partners: { include: { logoAsset: true }, orderBy: { sortOrder: "asc" as const } },
  galleryImages: { include: { asset: true }, orderBy: { sortOrder: "asc" as const } },
  objectivesManaged: { where: { published: true }, orderBy: { sortOrder: "asc" as const } },
  outcomes: { where: { published: true }, include: { imageAsset: true }, orderBy: { sortOrder: "asc" as const } },
  activities: { where: { published: true }, include: { imageAsset: true }, orderBy: { sortOrder: "asc" as const } },
  timelinePhases: { where: { published: true }, include: { milestones: { where: { published: true }, orderBy: { sortOrder: "asc" as const } } }, orderBy: { sortOrder: "asc" as const } },
  journeyStages: { where: { published: true }, orderBy: { sortOrder: "asc" as const } },
  testimonials: { where: { published: true }, include: { photoAsset: true, mediaAsset: true, participant: { select: { id: true, name: true, projectName: true, published: true, photoAsset: true } } }, orderBy: { sortOrder: "asc" as const } },
  participants: { where: { published: true }, select: { id: true, name: true, projectName: true, biography: true, location: true, status: true, photoAsset: true, published: true, programId: true, sortOrder: true, createdAt: true, updatedAt: true, photoAssetId: true, testimonials: { where: { published: true, slug: { not: null } }, select: { id: true, slug: true, storyTitle: true, excerpt: true }, orderBy: { sortOrder: "asc" as const } } }, orderBy: { sortOrder: "asc" as const } },
};

export const getWebsiteSettings = cache(async () => {
  const settings = await prisma.websiteSettings.findUnique({
    where: { id: "default" },
    include: { logoAsset: true },
  });
  return settings;
});

export const getOrganizationIdentity = cache(async () => {
  return prisma.organizationIdentity.findUnique({
    where: { id: "default" },
    include: { heroAsset: true },
  });
});

export const getPublishedPrograms = cache(async () => {
  return prisma.program.findMany({
    where: { status: "PUBLISHED" },
    include: programInclude,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
});

export const getPublishedTeam = cache(async () => {
  return prisma.teamMember.findMany({
    where: { status: "ACTIVE" },
    include: { imageAsset: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
});

export const getPublishedPartners = cache(async () => {
  return prisma.partner.findMany({
    where: { published: true },
    include: { logoAsset: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
});

export const getPublishedImpact = cache(async () => {
  return prisma.impactStat.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
});

export const getPublishedFaqs = cache(async () => {
  return prisma.faq.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
});

export const getPublishedLegalPages = cache(async () => {
  return prisma.legalPage.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
});

export const getPublishedPosts = cache(async () => {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    include: { featuredImage: true, bannerImage: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
});

export const getContentCategories = cache(async (kind?: "NEWS" | "PROGRAM") => {
  return prisma.contentCategory.findMany({
    where: kind ? { kind } : undefined,
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
});

export const getPublishedCareers = cache(async () => {
  return prisma.career.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { postedAt: "desc" }],
  });
});

export const getProgramBySlug = cache(async (slug: string) => {
  return prisma.program.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      ...programInclude,
      galleryImages: { where: { published: true }, include: { asset: true }, orderBy: { sortOrder: "asc" as const } },
    },
  });
});

const participantStoryInclude = {
  photoAsset: true,
  mediaAsset: true,
  participant: { select: { id: true, name: true, projectName: true, published: true, photoAsset: true } },
} as const;

export const getPublishedProgramStories = cache(async (programSlug: string) => prisma.programTestimonial.findMany({
  where: {
    program: { slug: programSlug, status: "PUBLISHED", showTestimonials: true },
    published: true,
    slug: { not: null },
    OR: [{ participantId: null }, { participant: { is: { published: true } } }],
  },
  include: { ...participantStoryInclude, program: { select: { id: true, slug: true, title: true } } },
  orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
}));

export const getProgramStoryBySlug = cache(async (programSlug: string, storySlug: string) => prisma.programTestimonial.findFirst({
  where: {
    slug: storySlug,
    program: { slug: programSlug, status: "PUBLISHED", showTestimonials: true },
    published: true,
    OR: [{ participantId: null }, { participant: { is: { published: true } } }],
  },
  include: { ...participantStoryInclude, program: { select: { id: true, slug: true, title: true } } },
}));

export const getFeaturedAhezaStories = cache(async () => prisma.programTestimonial.findMany({
  where: {
    program: { slug: "aheza" },
    published: true,
    featured: true,
    slug: { not: null },
    participant: { isNot: null },
  },
  include: participantStoryInclude,
  orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  take: 2,
}));

export const getPublishedAhezaStories = cache(async () => prisma.programTestimonial.findMany({
  where: {
    program: { slug: "aheza" },
    published: true,
    slug: { not: null },
    participant: { isNot: null },
  },
  include: participantStoryInclude,
  orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
}));

export const getAhezaStoryBySlug = cache(async (slug: string) => prisma.programTestimonial.findFirst({
  where: {
    slug,
    program: { slug: "aheza" },
    published: true,
    participant: { isNot: null },
  },
  include: participantStoryInclude,
}));

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { featuredImage: true, bannerImage: true },
  });
});

export const getCareerBySlug = cache(async (slug: string) => {
  return prisma.career.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
});

export const getLegalPageBySlug = cache(async (slug: string) => {
  return prisma.legalPage.findFirst({
    where: { slug, published: true },
  });
});

export function publicContact(settings: Awaited<ReturnType<typeof getWebsiteSettings>>) {
  const email = settings?.emailPrimary || "africanleadershub@gmail.com";
  const phone = settings?.phonePrimary || "+250 788 358 891";
  return {
    email,
    phone,
    telHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
    mailHref: `mailto:${email}`,
    location: `${settings?.city || "Kigali"}, ${settings?.country || "Rwanda"}`,
  };
}
