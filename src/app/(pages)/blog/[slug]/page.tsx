import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPost } from "@/lib/content/data";
import { PostDetails } from "@/components/content/details";
import { PageReveal } from "@/components/site/page-reveal";
export const dynamic = "force-dynamic";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const post=await getPublishedPost(slug);if(!post)notFound();return {title:(post.seo_title||post.title)+" | NewGen Construction",description:post.seo_description||post.description};}
export default async function PostPage({params}:Props){const {slug}=await params;const post=await getPublishedPost(slug);if(!post)notFound();return <PageReveal key={slug}><PostDetails post={post}/></PageReveal>;}
