import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/lib/blogApi", () => ({
  fetchPublishedBlogPosts: vi.fn(),
}));

import ContentSection from "./ContentSection";
import { fetchPublishedBlogPosts } from "@/lib/blogApi";

const mockedFetchPublishedBlogPosts = vi.mocked(fetchPublishedBlogPosts);

describe("ContentSection", () => {
  beforeAll(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: MockIntersectionObserver,
    });
    Object.defineProperty(globalThis, "IntersectionObserver", {
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("resolves blog card images from server paths", async () => {
    mockedFetchPublishedBlogPosts.mockResolvedValueOnce([
      {
        id: "1",
        slug: "post-com-imagem",
        title: "Post com imagem",
        excerpt: "Resumo",
        content: "",
        category: "Growth",
        tags: [],
        readTime: "5 min",
        dateISO: "2020-01-01",
        publishTime: "09:00",
        updatedAtISO: "2020-01-01",
        published: true,
        coverImage: "/lovable-uploads/blog-fundo.jpg",
      },
    ]);

    const { container } = render(
      <MemoryRouter>
        <ContentSection />
      </MemoryRouter>,
    );

    await screen.findByText("Post com imagem");
    const image = container.querySelector("img");

    expect(image?.getAttribute("src")).toBe(
      "https://guilhermecorreia.com.br/lovable-uploads/blog-fundo.jpg",
    );
  });

  it("renders a fallback when a blog post has no media", async () => {
    mockedFetchPublishedBlogPosts.mockResolvedValueOnce([
      {
        id: "2",
        slug: "post-sem-imagem",
        title: "Post sem imagem",
        excerpt: "Resumo",
        content: "",
        category: "Growth",
        tags: [],
        readTime: "5 min",
        dateISO: "2020-01-01",
        publishTime: "09:00",
        updatedAtISO: "2020-01-01",
        published: true,
      },
    ]);

    const { container } = render(
      <MemoryRouter>
        <ContentSection />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Post sem imagem")).toBeInTheDocument());

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByTestId("blog-card-image-fallback")).toBeInTheDocument();
  });

  it("does not render scheduled posts before their publication time", async () => {
    mockedFetchPublishedBlogPosts.mockResolvedValueOnce([
      {
        id: "3",
        slug: "post-agendado",
        title: "Post agendado",
        excerpt: "Resumo",
        content: "",
        category: "Growth",
        tags: [],
        readTime: "5 min",
        dateISO: "2099-07-16",
        publishTime: "14:10",
        updatedAtISO: "2099-07-16",
        published: true,
        status: "published",
      },
      {
        id: "4",
        slug: "post-publicado",
        title: "Post publicado",
        excerpt: "Resumo",
        content: "",
        category: "Growth",
        tags: [],
        readTime: "5 min",
        dateISO: "2020-07-16",
        publishTime: "14:03",
        updatedAtISO: "2020-07-16",
        published: true,
      },
    ]);

    render(
      <MemoryRouter>
        <ContentSection />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Post publicado")).toBeInTheDocument());

    expect(screen.queryByText("Post agendado")).not.toBeInTheDocument();
  });
});
