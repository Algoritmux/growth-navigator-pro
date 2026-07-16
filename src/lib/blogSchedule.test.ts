import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBlogPublicationStatus,
  isPubliclyVisibleBlogPost,
} from "./blogSchedule";

describe("blog publication scheduling", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps drafts hidden from public listings", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:04:00.000Z"));

    expect(
      getBlogPublicationStatus({
        published: false,
        status: "published",
        dateISO: "2026-07-16",
        publishTime: "14:10",
      }),
    ).toBe("draft");
    expect(
      isPubliclyVisibleBlogPost({
        published: false,
        status: "draft",
        dateISO: "2020-01-01",
        publishTime: "09:00",
      }),
    ).toBe(false);
  });

  it("shows published posts with past publication date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:04:00.000Z"));

    expect(
      getBlogPublicationStatus({
        published: true,
        status: "scheduled",
        dateISO: "2026-07-16",
        publishTime: "14:03",
      }),
    ).toBe("published");
    expect(
      isPubliclyVisibleBlogPost({
        published: true,
        status: "scheduled",
        dateISO: "2026-07-16",
        publishTime: "14:03",
      }),
    ).toBe(true);
  });

  it("shows old published posts with the real clock", () => {
    expect(
      isPubliclyVisibleBlogPost({
        published: true,
        status: "published",
        dateISO: "2020-07-16",
        publishTime: "14:03",
      }),
    ).toBe(true);
  });

  it("does not treat Array.filter indexes as the current date", () => {
    const posts = [
      {
        published: true,
        status: "published" as const,
        dateISO: "2020-07-16",
        publishTime: "14:03",
      },
    ];

    expect(posts.filter(isPubliclyVisibleBlogPost)).toHaveLength(1);
  });

  it("hides posts scheduled a few minutes in the future today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:04:00.000Z"));

    expect(
      getBlogPublicationStatus({
        published: true,
        status: "published",
        dateISO: "2026-07-16",
        publishTime: "14:10",
      }),
    ).toBe("scheduled");
    expect(
      isPubliclyVisibleBlogPost({
        published: true,
        status: "published",
        dateISO: "2026-07-16",
        publishTime: "14:10",
      }),
    ).toBe(false);
  });

  it("keeps the real scheduled payload hidden before 14:22", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:20:00.000Z"));

    const payload = {
      id: "19",
      slug: "teste-marketing-sistema-crescimento-previsivel",
      category: "Growth",
      dateISO: "2026-07-16",
      publishTime: "14:22",
      published: true,
      status: "scheduled" as const,
      title: "TESTE - Como transformar marketing em um sistema de crescimento previsivel",
    };

    expect(getBlogPublicationStatus(payload)).toBe("scheduled");
    expect(isPubliclyVisibleBlogPost(payload)).toBe(false);
  });

  it("publishes the real scheduled payload after 14:22", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:23:00.000Z"));

    const payload = {
      id: "19",
      slug: "teste-marketing-sistema-crescimento-previsivel",
      category: "Growth",
      dateISO: "2026-07-16",
      publishTime: "14:22",
      published: true,
      status: "scheduled" as const,
      title: "TESTE - Como transformar marketing em um sistema de crescimento previsivel",
    };

    expect(getBlogPublicationStatus(payload)).toBe("published");
    expect(isPubliclyVisibleBlogPost(payload)).toBe(true);
  });

  it("shows scheduled posts after today's publication time has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:11:00.000Z"));

    expect(
      getBlogPublicationStatus({
        published: true,
        status: "scheduled",
        dateISO: "2026-07-16",
        publishTime: "14:10",
      }),
    ).toBe("published");
    expect(
      isPubliclyVisibleBlogPost({
        published: true,
        status: "scheduled",
        dateISO: "2026-07-16",
        publishTime: "14:10",
      }),
    ).toBe(true);
  });

  it("hides posts scheduled for tomorrow", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T17:04:00.000Z"));

    expect(
      getBlogPublicationStatus({
        published: true,
        status: "published",
        dateISO: "2026-07-17",
        publishTime: "09:00",
      }),
    ).toBe("scheduled");
    expect(
      isPubliclyVisibleBlogPost({
        published: true,
        status: "published",
        dateISO: "2026-07-17",
        publishTime: "09:00",
      }),
    ).toBe(false);
  });
});
