import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedProject } from "@/lib/content/data";
import { ProjectDetails } from "@/components/content/details";
import { ProjectMotion } from "@/components/site/project-motion";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug }=await params;const project=await getPublishedProject(slug);if(!project)notFound();return { title: (project.seo_title || project.name)+" | NewGen Construction",description:project.seo_description||project.description }; }
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();
  return <ProjectMotion key={slug} mode="detail"><ProjectDetails project={project} /></ProjectMotion>;
}
