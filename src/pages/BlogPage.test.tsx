import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/lib/blogApi", () => ({
  fetchPublishedBlogPosts: vi.fn(),
}));

import BlogPage from "./BlogPage";
import { fetchPublishedBlogPosts } from "@/lib/blogApi";

const mockedFetchPublishedBlogPosts = vi.mocked(fetchPublishedBlogPosts);

describe("BlogPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("does not render posts scheduled for the future", async () => {
    mockedFetchPublishedBlogPosts.mockResolvedValueOnce([
      {
        id: "1",
        slug: "post-futuro",
        title: "Post futuro",
        excerpt: "Resumo futuro",
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
        id: "2",
        slug: "post-visivel",
        title: "Post visivel",
        excerpt: "Resumo visivel",
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
        <BlogPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Post visivel")).toBeInTheDocument());

    expect(screen.queryByText("Post futuro")).not.toBeInTheDocument();
  });
});
