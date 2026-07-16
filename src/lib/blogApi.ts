import type { BlogPost } from "./blogStore";
import { apiRequest } from "./api";
import { extractCoverImageSrc } from "./markdown";
import { getBlogPublicationStatus } from "./blogSchedule";

type BlogEditorSettings = NonNullable<BlogPost["editorSettings"]>;

type ApiBlogPost = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  coverImage?: string;
  category: BlogPost["category"];
  tags: string[];
  read_time?: string;
  readTime?: string;
  editor_font?: BlogEditorSettings["font"];
  editor_font_size?: number;
  editor_line_height?: number;
  paragraph_space_before?: number;
  paragraph_space_after?: number;
  published?: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type BlogListResponse = {
  success: true;
  posts: ApiBlogPost[];
};

type BlogShowResponse = {
  success: true;
  post: ApiBlogPost;
};

type BlogSaveResponse = {
  success: true;
  message: string;
  id: number;
  slug: string;
  is_published: 0 | 1;
  published: boolean;
  published_at: string;
  dateISO: string;
  publishTime: string;
  status: BlogPost["status"];
  computed_status: BlogPost["status"];
};

type BlogDeleteResponse = {
  success: true;
  message: string;
};

function isoDateOnly(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function mapApiPost(post: ApiBlogPost): BlogPost {
  const content = String(post.content || "");
  const coverImage =
    String(post.cover_image || post.coverImage || "").trim() ||
    extractCoverImageSrc(content);
  const publishedAt = String(post.published_at || "");

  const mappedPost: BlogPost = {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content,
    coverImage: coverImage || undefined,
    category: post.category,
    tags: Array.isArray(post.tags) ? post.tags : [],
    readTime: post.readTime || post.read_time || "5 min",
    dateISO: isoDateOnly(post.published_at || post.created_at),
    publishTime: publishedAt.slice(11, 16) || "09:00",
    updatedAtISO: isoDateOnly(post.updated_at),
    published: Boolean(post.published),
    editorSettings: {
      font: post.editor_font || "theme",
      fontSize: Number(post.editor_font_size || 18),
      lineHeight: Number(post.editor_line_height || 1.15),
      paragraphSpaceBefore: Number(post.paragraph_space_before || 8),
      paragraphSpaceAfter: Number(post.paragraph_space_after || 12),
    },
  };

  return {
    ...mappedPost,
    status: getBlogPublicationStatus(mappedPost),
  };
}

function mapPostPayload(post: BlogPost) {
  return {
    id: post.id && !post.id.startsWith("p_") ? Number(post.id) : undefined,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    readTime: post.readTime,
    dateISO: post.dateISO,
    publishTime: post.publishTime,
    status: post.status,
    published: post.published,
    editorSettings: post.editorSettings,
  };
}

export async function fetchAllBlogPosts() {
  const data = await apiRequest<BlogListResponse>("/blog/list.php", {
    auth: true,
    cache: "no-store",
  });
  return data.posts.map(mapApiPost);
}

export async function fetchPublishedBlogPosts() {
  const data = await apiRequest<BlogListResponse>("/blog/list.php?published=1", {
    cache: "no-store",
  });
  return data.posts.map(mapApiPost);
}

export async function fetchBlogPostBySlug(slug: string) {
  const data = await apiRequest<BlogShowResponse>(
    `/blog/show.php?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  return mapApiPost(data.post);
}

export async function saveBlogPost(post: BlogPost) {
  return apiRequest<BlogSaveResponse>("/blog/save.php", {
    method: "POST",
    auth: true,
    body: mapPostPayload(post),
  });
}

export async function deleteBlogPost(id: string | number) {
  return apiRequest<BlogDeleteResponse>("/blog/delete.php", {
    method: "POST",
    auth: true,
    body: { id: Number(id) },
  });
}
