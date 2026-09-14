import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { cardSlots } from "@/lib/card-slots";
import { getCardImages, getDisciplines, formatDuration } from "@/lib/media";
import type { Discipline } from "@/lib/media-types";
import { siteConfig } from "@/lib/site-config";
import { logoutAction } from "./actions";
import { CardReplaceForm } from "./card-replace-form";
import { DeleteItemButton, SetCoverButton } from "./item-actions";
import { PhotoUploadForm } from "./photo-upload-form";
import { VideoUploadForm } from "./video-upload-form";

export const metadata: Metadata = {
  title: "Media dashboard",
  robots: { index: false, follow: false },
};

// Session-gated and reads a mutable directory, so it is always rendered fresh.
export const dynamic = "force-dynamic";

/** Mirrors MAX_VIDEO_BYTES in actions.ts. */
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

function GallerySection({ discipline }: { discipline: Discipline }) {
  const categories = discipline.categories.map((c) => ({ slug: c.slug, label: c.label }));
  const coverId = discipline.cover?.id;

  return (
    <section className="border-t border-line pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-medium text-ink">{discipline.label}</h2>
        <p className="text-sm text-muted">
          {discipline.itemCount} item{discipline.itemCount === 1 ? "" : "s"} across{" "}
          {discipline.categories.length} categor
          {discipline.categories.length === 1 ? "y" : "ies"}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-line bg-canvas-raised p-6">
        <h3 className="text-xs font-semibold tracking-[0.18em] text-accent-text uppercase">
          Add images
        </h3>
        <PhotoUploadForm discipline={discipline.slug} categories={categories} />
      </div>

      <div className="mt-5 rounded-xl border border-line bg-canvas-raised p-6">
        <h3 className="text-xs font-semibold tracking-[0.18em] text-accent-text uppercase">
          Add a video
        </h3>
        <VideoUploadForm
          discipline={discipline.slug}
          categories={categories}
          maxBytes={MAX_VIDEO_BYTES}
        />
      </div>

      {discipline.categories.map((category) => (
        <div key={category.slug} className="mt-10">
          <div className="flex items-baseline gap-3 border-b border-line pb-3">
            <h3 className="font-display text-lg font-medium text-ink">{category.label}</h3>
            <span className="text-xs tracking-[0.1em] text-muted uppercase">
              {category.items.length} item{category.items.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {category.items.map((item) => (
              <li key={item.id} className="flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-wine-950">
                  <Image
                    src={item.type === "video" ? (item.poster ?? item.src) : item.src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    placeholder="blur"
                    blurDataURL={item.blurDataURL}
                    className="object-cover"
                  />
                  {item.type === "video" ? (
                    <span className="absolute top-2 right-2 rounded-full bg-wine-950/70 px-2 py-0.5 text-[0.65rem] font-medium text-wine-100 tabular-nums backdrop-blur-sm">
                      {item.duration ? formatDuration(item.duration) : "Video"}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2.5 truncate text-sm text-ink" title={item.title}>
                  {item.title}
                </p>
                <p className="text-xs text-muted">
                  {item.width}×{item.height}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <SetCoverButton
                    discipline={discipline.slug}
                    id={item.id}
                    isCover={item.id === coverId}
                    title={item.title}
                  />
                  <DeleteItemButton
                    discipline={discipline.slug}
                    id={item.id}
                    title={item.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default async function DashboardPage() {
  // The gate. Server Actions each re-check this themselves, because a page
  // redirect only protects the UI, not the endpoints behind it.
  if (!(await isAuthenticated())) redirect("/dashboard/login");

  const [cards, disciplines] = await Promise.all([getCardImages(), getDisciplines()]);

  return (
    <div className="mx-auto w-full max-w-[84rem] px-6 py-16 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
            <span className="h-px w-6 bg-accent-text" aria-hidden="true" />
            {siteConfig.name}
          </span>
          <h1 className="mt-4 font-display text-4xl font-medium text-ink">Media dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="link-underline inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase hover:text-ink"
          >
            View site
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-[0.65rem] font-semibold tracking-[0.14em] text-ink-soft uppercase transition-colors hover:border-accent-text hover:text-accent-text"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="pt-12">
        <h2 className="font-display text-2xl font-medium text-ink">Section images</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Fixed images on the public page. Each card says where the image appears, and the
          preview is cropped exactly as the live section crops it.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {cardSlots.map((slot) => (
            <CardReplaceForm key={slot.key} slot={slot} current={cards[slot.key]} />
          ))}
        </div>
      </section>

      <div className="mt-16 space-y-16">
        {disciplines.map((discipline) => (
          <GallerySection key={discipline.slug} discipline={discipline} />
        ))}
      </div>
    </div>
  );
}
