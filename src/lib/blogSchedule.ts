import type { BlogPost } from "./blogStore";

export type BlogPublicationStatus = "draft" | "published" | "scheduled";

export const BLOG_PUBLICATION_TIMEZONE = "America/Sao_Paulo";

type SchedulablePost = Pick<BlogPost, "published" | "dateISO" | "publishTime" | "status">;

const saoPauloDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BLOG_PUBLICATION_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function normalizeNow(now?: Date) {
  return now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
}

function getSaoPauloDateTimeParts(date = new Date()) {
  const parts = Object.fromEntries(
    saoPauloDateTimeFormatter
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return {
    dateISO: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function normalizeTime(time?: string) {
  const value = (time || "00:00").trim();
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "00:00";
}

function toComparableDateTime(dateISO?: string, publishTime?: string) {
  if (!dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return "";
  return `${dateISO} ${normalizeTime(publishTime)}`;
}

function getCurrentComparableDateTime(now = new Date()) {
  const parts = getSaoPauloDateTimeParts(normalizeNow(now));
  return `${parts.dateISO} ${parts.time}`;
}

export function getCurrentLocalDate() {
  return getSaoPauloDateTimeParts().dateISO;
}

export function getCurrentLocalTime() {
  return getSaoPauloDateTimeParts().time;
}

export function isFuturePublication(
  dateISO?: string,
  publishTime?: string,
  now = new Date(),
) {
  const publicationDateTime = toComparableDateTime(dateISO, publishTime);
  if (!publicationDateTime) return false;
  return publicationDateTime > getCurrentComparableDateTime(now);
}

export function getBlogPublicationStatus(
  post: SchedulablePost,
  now = new Date(),
): BlogPublicationStatus {
  if (!post.published) return "draft";
  if (isFuturePublication(post.dateISO, post.publishTime, now)) {
    return "scheduled";
  }
  return "published";
}

export function getBlogPublicationStatusLabel(status: BlogPublicationStatus) {
  if (status === "draft") return "Rascunho";
  if (status === "scheduled") return "Agendado";
  return "Publicado";
}

export function isPubliclyVisibleBlogPost(
  post: SchedulablePost,
  now = new Date(),
) {
  return post.published && getBlogPublicationStatus(post, now) === "published";
}
