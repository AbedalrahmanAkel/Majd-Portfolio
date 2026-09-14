"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Film, Upload } from "lucide-react";
import { addVideoAction, type ActionState } from "./actions";
import { CategoryField } from "./category-field";
import { FormMessage, fieldLabel, selectClasses } from "./form-parts";

interface VideoUploadFormProps {
  discipline: "photography" | "videography";
  categories: { slug: string; label: string }[];
  /** Server-side per-file ceiling, mirrored here so the editor is told before
   *  spending minutes uploading something that will be rejected. */
  maxBytes: number;
}

const initial: ActionState = {};

interface Capture {
  posterUrl: string;
  posterBlob: Blob;
  duration: number;
  width: number;
  height: number;
}

/**
 * Grab a representative frame in the browser.
 *
 * The site no longer ships ffmpeg, so there is no server-side video decoder to
 * pull a poster from. The browser already has one, so the frame is captured
 * here and uploaded alongside the video; Sharp compresses it server-side like
 * any other image. This also gives us the true decoded dimensions and the
 * duration without parsing the container ourselves.
 */
async function capturePoster(file: File): Promise<Capture> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("This browser cannot decode that video."));
      video.src = url;
    });

    // A beat in — frame zero is very often a fade from black.
    const seekTo = Math.min(1.5, Math.max(0, (video.duration || 0) * 0.1));
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Could not seek that video."));
      video.currentTime = seekTo;
    });

    // `seeked` can fire before the frame is actually presented. Wait for a
    // real painted frame where the browser can tell us, and fall back to a
    // short delay where it cannot (Firefox has no requestVideoFrameCallback).
    await new Promise<void>((resolve) => {
      type WithFrameCallback = HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
      };
      const withCallback = video as WithFrameCallback;
      if (typeof withCallback.requestVideoFrameCallback === "function") {
        withCallback.requestVideoFrameCallback(() => resolve());
        // Belt and braces: a paused video may never present a new frame.
        setTimeout(resolve, 400);
      } else {
        setTimeout(resolve, 250);
      }
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (!canvas.width || !canvas.height) throw new Error("That video reported no dimensions.");

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("Could not read a frame from that video.");

    return {
      posterUrl: URL.createObjectURL(blob),
      posterBlob: blob,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(url);
    video.src = "";
  }
}

export function VideoUploadForm({ discipline, categories, maxBytes }: VideoUploadFormProps) {
  const [state, formAction, pending] = useActionState(addVideoAction, initial);
  const [file, setFile] = useState<File | null>(null);
  const [capture, setCapture] = useState<Capture | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  /** Bumping this remounts the file input, which is the only way to clear it. */
  const [inputKey, setInputKey] = useState(0);
  const [lastToken, setLastToken] = useState<string | undefined>(undefined);

  // Adjusted during render rather than in an effect: an effect would commit a
  // frame still showing the uploaded file before clearing it.
  if (state.token && state.token !== lastToken) {
    setLastToken(state.token);
    setFile(null);
    setCapture(null);
    setInputKey((key) => key + 1);
  }

  // Runs when the capture is replaced or cleared, and on unmount.
  useEffect(() => {
    if (!capture) return;
    return () => URL.revokeObjectURL(capture.posterUrl);
  }, [capture]);

  async function onSelect(selected: File | null) {
    setCapture(null);
    setCaptureError(null);
    setFile(selected);
    if (!selected) return;

    if (selected.size > maxBytes) {
      setCaptureError(
        `That file is ${Math.round(selected.size / 1024 / 1024)} MB. The limit is ${Math.round(
          maxBytes / 1024 / 1024,
        )} MB — compress it before uploading.`,
      );
      return;
    }

    setWorking(true);
    try {
      setCapture(await capturePoster(selected));
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : "Could not read that video.");
    } finally {
      setWorking(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !capture) return;

    // Built by hand rather than submitted directly, because the poster is a
    // Blob produced in JS and never existed in a file input.
    const data = new FormData(event.currentTarget);
    data.set("video", file);
    data.set("poster", capture.posterBlob, "poster.jpg");
    data.set("duration", String(Math.round(capture.duration)));

    startTransition(() => formAction(data));
  }

  const ready = Boolean(file && capture);

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <input type="hidden" name="discipline" value={discipline} />

      <div className="grid gap-5 sm:grid-cols-2">
        <CategoryField categories={categories} />

        <div>
          <label htmlFor={`${discipline}-video`} className={fieldLabel}>
            Video
          </label>
          <input
            key={inputKey}
            id={`${discipline}-video`}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
            required
            onChange={(event) => void onSelect(event.target.files?.[0] ?? null)}
            className={selectClasses}
          />
          <p className="mt-2 text-xs text-muted">
            MP4 or WebM, up to {Math.round(maxBytes / 1024 / 1024)} MB. Video is stored as
            uploaded — Sharp compresses images only, so compress the file first.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {working ? (
          <p className="text-sm text-muted">Reading a preview frame…</p>
        ) : capture ? (
          <div className="flex flex-wrap items-start gap-5">
            <div className="w-40 overflow-hidden rounded-lg border border-line bg-canvas-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capture.posterUrl} alt="Captured preview frame" className="w-full" />
            </div>
            <dl className="text-sm text-ink-soft">
              <div className="flex gap-2">
                <dt className="text-muted">Preview frame</dt>
                <dd>
                  {capture.width}×{capture.height}
                </dd>
              </div>
              <div className="mt-1 flex gap-2">
                <dt className="text-muted">Duration</dt>
                <dd>{Math.round(capture.duration)}s</dd>
              </div>
              <div className="mt-1 flex gap-2">
                <dt className="text-muted">Size</dt>
                <dd>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "—"}</dd>
              </div>
            </dl>
          </div>
        ) : captureError ? (
          <p role="alert" className="text-sm text-error">
            {captureError}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Film className="size-4" aria-hidden="true" />
            Nothing selected yet.
          </p>
        )}
      </div>

      <FormMessage state={state} />

      <button
        type="submit"
        disabled={pending || !ready}
        className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[0.7rem] font-semibold tracking-[0.14em] text-canvas uppercase transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
      >
        <Upload className="size-4" aria-hidden="true" />
        {pending ? "Uploading…" : "Save video"}
      </button>
    </form>
  );
}
