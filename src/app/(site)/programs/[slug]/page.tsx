import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { getProgramBySlug, getPublishedPrograms, getWebsiteSettings } from "@/lib/content";
import { toProgramView } from "@/lib/content-views";
import { generateProgramSchema } from "@/lib/seo";
import { ProgramsAccordion } from "@/components/programs-accordion";
import { HtmlContent } from "@/components/html-content";
import { ProgramGallery } from "@/components/program-gallery";
import { ProgramTestimonials } from "@/components/program-testimonials";
import { ProgramActivityJourney, ProgramObjectives } from "@/components/program-journey-sections";
import { ProgramTimeline } from "@/components/program-timeline";
import { ProgramPeopleSections } from "@/components/program-people-sections";
import { AhezaApplicationCallout } from "@/components/aheza-application-callout";
import { PartnerLogos } from "@/components/partner-logos";
import { cn } from "@/lib/utils";
import {
  formatApplicationCloseDate,
  isProgramAcceptingApplications,
  programApplyAction,
} from "@/lib/programs";

export const dynamic = "force-dynamic";

interface ProgramPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    return {
      title: "Program Not Found - African Leaders Hub",
    };
  }

  return {
    title: program.seoTitle || `${program.title} - African Leaders Hub`,
    description: program.seoDescription || program.description,
    openGraph: {
      title: program.ogTitle || program.seoTitle || program.title,
      description: program.ogDescription || program.seoDescription || program.description,
      images: program.ogImageAsset?.url ? [program.ogImageAsset.url] : undefined,
    },
    keywords: `${program.title}, ${program.category}, African Leaders Hub, Rwanda programs`,
  };
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const [program, settings] = await Promise.all([getProgramBySlug(slug), getWebsiteSettings()]);

  if (!program) {
    notFound();
  }

  const relatedPrograms = (await getPublishedPrograms())
    .filter((item) => item.category === program.category && item.slug !== program.slug)
    .slice(0, 3);

  const programSchema = generateProgramSchema(program.title, program.description);
  const banner = program.imageAsset?.url || program.bannerAsset?.url || "/background-pattern-1.jpg";
  const accepting = isProgramAcceptingApplications(program);
  const applicationEmail =
    program.applicationEmail || settings?.emailPrimary || "africanleadershub@gmail.com";
  const applyAction = accepting ? programApplyAction(program, applicationEmail) : null;
  const closeDate = formatApplicationCloseDate(program.applicationsCloseAt);
  const openDate = formatApplicationCloseDate(program.applicationsOpenAt);
  const isAheza = program.slug === "aheza";
  const applicationScheduled = Boolean(program.applicationsEnabled && program.applicationMethod && program.applicationsOpenAt && new Date(program.applicationsOpenAt) > new Date());
  const showApplicationCallout = isAheza || program.applicationsEnabled || Boolean(program.applicationMethod);
  const brochureUrl = program.brochureAsset ? `/api/programs/${program.slug}/brochure` : null;
  const brochurePreview = program.brochurePreviewAsset?.url;
  const partners = program.partners.filter((partner) => partner.published);
  const objectives = program.objectivesManaged;
  const outcomes = program.outcomes;
  const activities = program.activities;
  const testimonials = program.testimonials.filter((item) => item.featured && Boolean(item.slug) && (!item.participantId || item.participant?.published)).slice(0, 2);
  const participants = program.participants;
  const phases = program.timelinePhases;
  const gallery = program.galleryImages
    .filter((image) => image.published && image.featured)
    .flatMap((image) => image.asset?.url ? [{
      url: image.asset.url,
      alt: image.altText || image.asset.alt || image.asset.title || program.title,
      caption: image.caption,
    }] : [])
    .slice(0, 5);
  const hasSidebar = partners.length > 0 || Boolean(applyAction);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(programSchema),
        }}
      />
      <section className="relative text-white py-16 min-h-[calc(100vh-20rem)] md:min-h-[400px] h-[calc(100vh-10rem)] md:h-[450px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${banner})` }}
        ></div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/30 to-black/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end justify-start">
          <div className="text-start flex flex-col justify-end items-start h-full">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 mb-6 hover:text-white rounded-full">
              <Link href="/programs">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Programs
              </Link>
            </Button>
            <Badge className="bg-[#8B4513] text-white mb-4 rounded-full text-wrap">
              {program.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{program.title}</h1>
            <p className="text-xl text-white max-w-3xl">{program.description}</p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showApplicationCallout ? <div className="mb-7"><AhezaApplicationCallout programTitle={program.title} accepting={accepting} scheduled={applicationScheduled} action={applyAction} opensAt={openDate} closesAt={closeDate} /></div> : null}
          <div className={`grid grid-cols-1 items-start gap-12 ${isAheza ? "" : "lg:grid-cols-3"}`}>
            <div className={`space-y-8 ${isAheza ? "" : "lg:col-span-2"}`}>
              {program.detailsHtml &&
              !program.backgroundHtml &&
              !program.goalHtml &&
              !program.whoServesHtml &&
              program.objectives.length === 0 &&
              program.keyActivities.length === 0 &&
              program.expectedOutcomes.length === 0 ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Program details</h2>
                  <HtmlContent className="text-gray-700" html={program.detailsHtml} />
                </div>
              ) : null}

              {program.showIntroduction && program.introductionHtml ? <div className="flex flex-col gap-4"><h2 className="text-lg font-bold text-[#8B4513]">Overview</h2><HtmlContent className="text-gray-700" html={program.introductionHtml} /></div> : null}

              {program.showGallery && gallery.length > 0 ? (
                <div className="flex flex-col gap-4 rounded-3xl bg-[#faf8f5] p-4 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B4513]">Inside AHEZA</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">Moments that move us forward</h2>
                    </div>
                    <p className="text-sm text-stone-500">{gallery.length} {gallery.length === 1 ? "photo" : "photos"} · Select a photo to explore</p>
                  </div>
                  <ProgramGallery images={gallery} title={program.title} />
                </div>
              ) : null}

              {program.showObjectives && (objectives.length > 0 || program.objectives.length > 0) ? (
                <div className="flex flex-col gap-4">
                  {objectives.length ? <ProgramObjectives objectives={objectives} programTitle={program.title} /> : <><h2 className="text-lg font-bold text-[#8B4513]">Objectives</h2><ul className="list-disc space-y-2 pl-5 text-gray-700">{program.objectives.map((objective, index) => <li key={`${objective}-${index}`}>{objective}</li>)}</ul></>}
                </div>
              ) : null}

              {program.showKeyActivities && (activities.length > 0 || program.keyActivities.length > 0) ? (
                <div className="flex flex-col gap-4">
                  {activities.length ? <ProgramActivityJourney activities={activities} programTitle={program.title} /> : <><h2 className="text-lg font-bold text-[#8B4513]">Key Activities</h2><ul className="list-disc space-y-2 pl-5 text-gray-700">{program.keyActivities.map((activity, index) => <li key={`${activity}-${index}`}>{activity}</li>)}</ul></>}
                </div>
              ) : null}

              {program.showExpectedOutcomes && (outcomes.length > 0 || program.expectedOutcomes.length > 0) ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Expected Outcomes</h2>
                  <ul className="list-disc space-y-2 pl-5 text-gray-700">
                    {outcomes.length ? outcomes.map((outcome) => <li key={outcome.id}><strong>{outcome.title}</strong>{outcome.description ? ` — ${outcome.description}` : ""}</li>) : program.expectedOutcomes.map((outcome, index) => <li key={`${outcome}-${index}`}>{outcome}</li>)}
                  </ul>
                </div>
              ) : null}

              {brochureUrl ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Download program brochure</h2>
                  <a
                    href={brochureUrl}
                    download
                    className="group relative block max-w-xl overflow-hidden rounded-xl border border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                  >
                    {brochurePreview ? (
                      <Image
                        src={brochurePreview}
                        alt={`${program.title} brochure`}
                        width={640}
                        height={400}
                        className="h-auto w-full object-cover transition group-hover:opacity-90"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-stone-100 text-[#8B4513]">
                        <Download className="mr-2 h-5 w-5" />
                        Download brochure
                      </div>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/60 py-3 text-sm font-medium text-white">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </span>
                  </a>
                </div>
              ) : null}

              {program.showTestimonials && testimonials.length ? <div id="testimonials"><ProgramTestimonials testimonials={testimonials} programTitle={program.title} programSlug={program.slug} /></div> : null}
              {program.showTestimonials && !testimonials.length && program.testimonialsHtml ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Participant Stories</h2>
                  <HtmlContent className="text-gray-700" html={program.testimonialsHtml} />
                </div>
              ) : null}
              {participants.length ? <ProgramPeopleSections participants={participants} programSlug={program.slug} showParticipants={program.showParticipants} showAlumni={program.showAlumni} /> : null}

              {program.showBackground && program.backgroundHtml ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Background</h2>
                  <HtmlContent className="text-gray-700" html={program.backgroundHtml} />
                </div>
              ) : null}

              {program.showGoal && program.goalHtml ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Goal</h2>
                  <HtmlContent className="text-gray-700" html={program.goalHtml} />
                </div>
              ) : null}

              {program.showWhoServes && program.whoServesHtml ? (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold text-[#8B4513]">Who the Program Serves</h2>
                  <HtmlContent className="text-gray-700" html={program.whoServesHtml} />
                </div>
              ) : null}
              {program.showTimeline && phases.length > 0 ? <ProgramTimeline phases={phases} programTitle={program.title} /> : null}
            </div>

{hasSidebar ? (
                  <aside className="overflow-hidden rounded-r-2xl border border-[#8B4513]/20 border-l-[3px] border-l-[#8B4513] bg-[#f6efe8] shadow-sm">
                    {program.showTimeline && !phases.length && program.timelineHtml ? (
                      <div className="border-b border-[#8B4513]/10 px-5 py-6">
                        <h2 className="mb-3 text-lg font-bold text-[#8B4513]">Program Timeline</h2>
                        <HtmlContent className="text-gray-700" html={program.timelineHtml} />
                      </div>
                    ) : null}

                {partners.length > 0 ? (
                  <div className="border-b border-[#8B4513]/10 px-5 py-6">
                    <h2 className="mb-4 text-lg font-bold text-[#8B4513]">Partners</h2>
                    <PartnerLogos partners={partners} />
                  </div>
                ) : null}

                {applyAction ? (
                  <div className="border-t border-[#8B4513]/15 bg-[#8B4513]/10 px-5 py-6">
                    <h2 className="mb-2 text-lg font-bold text-[#8B4513]">Apply</h2>
                    <p className="mb-4 text-sm text-gray-600">
                      {closeDate
                        ? `Applications close ${closeDate}.`
                        : "This program is currently receiving applications."}
                    </p>
                    <ApplyNowButton action={applyAction} className="w-full" />
                  </div>
                ) : null}
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {applyAction ? (
        <section className="relative overflow-hidden py-32">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${banner})` }}
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-linear-to-br from-[#8B4513]/40 to-black/70" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Apply to this program</h2>
            <p className="mb-8 text-gray-200">
              {closeDate
                ? `Applications close ${closeDate}.`
                : "This program is currently receiving applications."}
            </p>
            {program.applicationMethod === "EMAIL" && program.applicationGuidelinesHtml ? (
              <div className="mb-8 rounded-xl bg-white/95 p-6 text-left">
                <HtmlContent className="text-gray-700" html={program.applicationGuidelinesHtml} />
              </div>
            ) : null}
            <ApplyNowButton action={applyAction} />
          </div>
        </section>
      ) : null}

      {relatedPrograms.length > 0 && !isAheza ? (
        <section className="py-16 bg-secondary text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Related Programs</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore other programs in the same category
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {relatedPrograms.map((relatedProgram) => (
                <ProgramsAccordion
                  programs={[toProgramView(relatedProgram)]}
                  key={relatedProgram.slug}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ApplyNowButton({
  action,
  className,
}: {
  action: { href: string; label: string; external: boolean };
  className?: string;
}) {
  return (
    <Button
      asChild
      size="lg"
      className={cn("rounded-full bg-[#8B4513] px-8 py-6 text-lg text-white hover:bg-[#6B3410]", className)}
    >
      {action.external ? (
        <a href={action.href} target="_blank" rel="noreferrer">
          {action.label}
        </a>
      ) : action.href.startsWith("mailto:") ? (
        <a href={action.href}>
          <Mail className="mr-2 h-4 w-4" />
          {action.label}
        </a>
      ) : (
        <Link href={action.href}>{action.label}</Link>
      )}
    </Button>
  );
}
