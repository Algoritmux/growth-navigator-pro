import { createRssNewsletterDraft } from "@/lib/newsletterApi";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  type BlogCategory,
  type BlogPost,
  deletePostFromApi,
  fetchPostsFromApi,
  makeId,
  makeSlug,
  savePostToApi,
  uploadBlogImageToApi,
} from "@/lib/blogStore";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowUpDown,
  Bold,
  BookOpen,
  Eye,
  EyeOff,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  MailPlus,
  Pencil,
  Plus,
  Redo2,
  RemoveFormatting,
  Search,
  Trash2,
  Underline,
  Undo2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminHeader from "@/components/AdminHeader";
import BlogContentRenderer from "@/components/blog/BlogContentRenderer";
import { resolveBlogMediaUrl } from "@/lib/blogMedia";
import {
  BLOG_PUBLICATION_TIMEZONE,
  getBlogPublicationStatus,
  getBlogPublicationStatusLabel,
  getCurrentLocalDate,
  getCurrentLocalTime,
  isFuturePublication,
  type BlogPublicationStatus,
} from "@/lib/blogSchedule";
import {
  extractFirstImageSrc,
  stripCoverImageMeta,
  withCoverImageMeta,
} from "@/lib/markdown";

const categories: BlogCategory[] = [
  "GTM",
  "ICP",
  "Oferta",
  "Sales",
  "Growth",
  "IA",
];
type BlockType = "p" | "h1" | "h2" | "h3";
type EditorFont = "theme" | "arial" | "georgia" | "times";
type TextAlignType = "left" | "center" | "right" | "justify";

const MIN_EDITOR_PAGE_HEIGHT = 1200;
const TOOLBAR_BUTTON_CLASS =
  "inline-flex h-9 items-center justify-center rounded-lg border bg-background px-2.5 text-sm";
const FONT_SIZE_OPTIONS = [14, 16, 18, 20, 22];
const LINE_HEIGHT_OPTIONS = [1, 1.15, 1.5, 2];
const PARAGRAPH_SPACE_OPTIONS = [0, 4, 8, 12, 16, 20, 24];
const FONT_MAP: Record<EditorFont, string> = {
  theme: "inherit",
  arial: "Arial, Helvetica, sans-serif",
  georgia: "Georgia, serif",
  times: "'Times New Roman', Times, serif",
};
const DEFAULT_EDITOR_SETTINGS = {
  font: "theme" as EditorFont,
  fontSize: 18,
  lineHeight: 1.15,
  paragraphSpaceBefore: 8,
  paragraphSpaceAfter: 12,
};

function newPostTemplate(): BlogPost {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: makeId(),
    title: "",
    slug: "",
    excerpt: "",
    dateISO: today,
    publishTime: getCurrentLocalTime(),
    readTime: "5 min",
    category: "GTM",
    tags: [],
    content: "",
    coverImage: "",
    published: false,
    status: "draft",
    updatedAtISO: today,
  };
}

function escapeHtmlForEditor(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function closestNumber(value: number, options: number[]) {
  return options.reduce(
    (prev, current) =>
      Math.abs(current - value) < Math.abs(prev - value) ? current : prev,
    options[0],
  );
}

function normalizeBlockType(value: string | null): BlockType | null {
  if (!value) return null;
  const normalized = value
    .toLowerCase()
    .replace(/[<>"']/g, "")
    .trim();
  if (normalized.includes("h1")) return "h1";
  if (normalized.includes("h2")) return "h2";
  if (normalized.includes("h3")) return "h3";
  if (
    normalized.includes("p") ||
    normalized.includes("normal") ||
    normalized.includes("div")
  )
    return "p";
  return null;
}

function fontKeyFromFamily(fontFamily: string): EditorFont {
  const value = (fontFamily || "").toLowerCase();
  if (value.includes("arial") || value.includes("helvetica")) return "arial";
  if (value.includes("georgia")) return "georgia";
  if (value.includes("times")) return "times";
  return "theme";
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isCreatingNewsletterDraft, setIsCreatingNewsletterDraft] =
    useState(false);
  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blockType, setBlockType] = useState<BlockType>("p");
  const [editorFont, setEditorFont] = useState<EditorFont>(
    DEFAULT_EDITOR_SETTINGS.font,
  );
  const [editorFontSize, setEditorFontSize] = useState<number>(
    DEFAULT_EDITOR_SETTINGS.fontSize,
  );
  const [editorLineHeight, setEditorLineHeight] = useState<number>(
    DEFAULT_EDITOR_SETTINGS.lineHeight,
  );
  const [paragraphSpaceBefore, setParagraphSpaceBefore] = useState<number>(
    DEFAULT_EDITOR_SETTINGS.paragraphSpaceBefore,
  );
  const [paragraphSpaceAfter, setParagraphSpaceAfter] = useState<number>(
    DEFAULT_EDITOR_SETTINGS.paragraphSpaceAfter,
  );
  const [isSpacingMenuOpen, setIsSpacingMenuOpen] = useState(false);
  const [isCustomSpacingOpen, setIsCustomSpacingOpen] = useState(false);
  const [keepWithNext, setKeepWithNext] = useState(false);
  const [keepLinesTogether, setKeepLinesTogether] = useState(false);
  const [avoidWidows, setAvoidWidows] = useState(true);
  const [pageBreakBefore, setPageBreakBefore] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [textAlign, setTextAlign] = useState<TextAlignType>("left");
  const [showPreview, setShowPreview] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isUploadingCoverImage, setIsUploadingCoverImage] = useState(false);
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [imageAltDraft, setImageAltDraft] = useState("");
  const [imageCaptionDraft, setImageCaptionDraft] = useState("");
  const [form, setForm] = useState<BlogPost>(newPostTemplate());
  const [editorHtml, setEditorHtml] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const textEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const coverUploadRef = useRef<HTMLInputElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const spacingMenuRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => {
      const hay =
        `${p.title} ${p.slug} ${p.category} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(s);
    });
  }, [posts, q]);

  async function refreshList() {
    setIsLoadingPosts(true);
    try {
      const data = await fetchPostsFromApi(false);
      setPosts(data);
    } catch (error) {
      console.error(error);
      alert("Não foi possível carregar os posts do banco.");
    } finally {
      setIsLoadingPosts(false);
    }
  }

  useEffect(() => {
    refreshList();
  }, []);

  function openNew() {
    setEditingId(null);
    setShowPreview(false);
    setBlockType("p");
    const next = newPostTemplate();
    setForm(next);
    setEditorHtml("");
    setEditorFont(DEFAULT_EDITOR_SETTINGS.font);
    setEditorFontSize(DEFAULT_EDITOR_SETTINGS.fontSize);
    setEditorLineHeight(DEFAULT_EDITOR_SETTINGS.lineHeight);
    setParagraphSpaceBefore(DEFAULT_EDITOR_SETTINGS.paragraphSpaceBefore);
    setParagraphSpaceAfter(DEFAULT_EDITOR_SETTINGS.paragraphSpaceAfter);
    setIsOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setShowPreview(false);
    setBlockType("p");
    setForm({
      ...post,
      status: getBlogPublicationStatus(post),
      publishTime: post.publishTime || "09:00",
      coverImage: post.coverImage || extractFirstImageSrc(post.content || "") || "",
    });
    setEditorHtml(stripCoverImageMeta(post.content || ""));
    setEditorFont(post.editorSettings?.font ?? DEFAULT_EDITOR_SETTINGS.font);
    setEditorFontSize(
      post.editorSettings?.fontSize ?? DEFAULT_EDITOR_SETTINGS.fontSize,
    );
    setEditorLineHeight(
      post.editorSettings?.lineHeight ?? DEFAULT_EDITOR_SETTINGS.lineHeight,
    );
    setParagraphSpaceBefore(
      post.editorSettings?.paragraphSpaceBefore ??
        DEFAULT_EDITOR_SETTINGS.paragraphSpaceBefore,
    );
    setParagraphSpaceAfter(
      post.editorSettings?.paragraphSpaceAfter ??
        DEFAULT_EDITOR_SETTINGS.paragraphSpaceAfter,
    );
    setIsOpen(true);
  }

  function closeModal() {
    clearSelectedImage();
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const editor = editorRef.current;
    if (!editor) return;

    const html = editorHtml || "<p></p>";
    editor.innerHTML = html;
    editor.style.minHeight = `${MIN_EDITOR_PAGE_HEIGHT}px`;
    setIsBoldActive(false);
    setIsItalicActive(false);
    setIsUnderlineActive(false);
    setTextAlign("left");
  }, [isOpen]);

  useEffect(() => {
    if (!isSpacingMenuOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const container = spacingMenuRef.current;
      if (!container) return;
      if (container.contains(event.target as Node)) return;
      setIsSpacingMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isSpacingMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleSelectionChange = () => {
      updateToolbarFromSelection();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isOpen]);

  function currentEditorHtml() {
    return textEditorRef.current?.value?.trim() || editorHtml.trim();
  }

  function currentEditorText() {
    return currentEditorHtml().replace(/<[^>]*>/g, "").trim();
  }

  async function save() {
    const title = form.title.trim();
    if (!title) {
      alert("Titulo e obrigatorio.");
      return;
    }

    const content = currentEditorHtml();
    if (!currentEditorText()) {
      alert("Conteudo do post e obrigatorio.");
      return;
    }

    const today = getCurrentLocalDate();
    const requestedPublicationStatus =
      form.status || (form.published ? "published" : "draft");
    const publicationDate = form.dateISO || today;
    const publicationTime = form.publishTime || getCurrentLocalTime();
    const publicationStatus =
      requestedPublicationStatus === "draft"
        ? "draft"
        : isFuturePublication(publicationDate, publicationTime)
          ? "scheduled"
          : "published";
    const willBePublicable = publicationStatus !== "draft";
    const payload: BlogPost = {
      ...form,
      id: editingId ?? form.id,
      title,
      slug: form.slug.trim() || makeSlug(title),
      excerpt: form.excerpt.trim(),
      coverImage: form.coverImage?.trim() || "",
      published: willBePublicable,
      status: publicationStatus,
      dateISO: publicationDate,
      publishTime: publicationTime,
      content: withCoverImageMeta(content, form.coverImage),
      editorSettings: {
        font: editorFont,
        fontSize: editorFontSize,
        lineHeight: editorLineHeight,
        paragraphSpaceBefore,
        paragraphSpaceAfter,
      },
      updatedAtISO: today,
    };

    setIsSavingPost(true);
    try {
      await savePostToApi(payload);
      await refreshList();
      closeModal();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o post.",
      );
    } finally {
      setIsSavingPost(false);
    }
  }

  async function remove(post: BlogPost) {
    if (!confirm(`Excluir "${post.title}"?`)) return;
    try {
      await deletePostFromApi(post.id);
      await refreshList();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o post.",
      );
    }
  }

  async function togglePublish(post: BlogPost) {
    const nextPublished = !post.published;
    try {
      await savePostToApi({
        ...post,
        published: nextPublished,
        status: nextPublished ? "published" : "draft",
        dateISO: nextPublished ? getCurrentLocalDate() : post.dateISO,
        publishTime: nextPublished ? getCurrentLocalTime() : post.publishTime,
        updatedAtISO: new Date().toISOString().slice(0, 10),
      });
      await refreshList();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o post.",
      );
    }
  }

  async function generateNewsletterDraft() {
    const publishedCount = posts.filter((post) => post.published).length;

    if (publishedCount === 0) {
      alert("Nenhum post publicado encontrado para gerar a newsletter.");
      return;
    }

    const confirmed = confirm(
      "Gerar uma campanha em rascunho no Listmonk usando os posts publicados mais recentes?",
    );

    if (!confirmed) return;

    setIsCreatingNewsletterDraft(true);

    try {
      const result = await createRssNewsletterDraft({
        limit: 5,
        subject: "Novos insights do blog - Growth Navigator",
        name: `Newsletter RSS - ${new Date().toLocaleDateString("pt-BR")}`,
      });

      const campaignId = result.campaign?.id
        ? ` ID: ${result.campaign.id}.`
        : "";

      alert(`Campanha criada como rascunho no Listmonk.${campaignId}`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a campanha no Listmonk.",
      );
    } finally {
      setIsCreatingNewsletterDraft(false);
    }
  }

  function syncEditorHtml() {
    setEditorHtml(textEditorRef.current?.value ?? editorHtml);
  }

  function toolbarButtonClass(active = false) {
    return `${TOOLBAR_BUTTON_CLASS} ${active ? "border-primary bg-primary/10 text-primary" : ""}`;
  }

  const editorStyle: CSSProperties & Record<string, string | number> = {
    minHeight: `${MIN_EDITOR_PAGE_HEIGHT}px`,
    fontFamily: FONT_MAP[editorFont],
    fontSize: `${editorFontSize}px`,
    lineHeight: editorLineHeight,
    "--editor-p-before": `${paragraphSpaceBefore}px`,
    "--editor-p-after": `${paragraphSpaceAfter}px`,
  };

  const previewStyle: CSSProperties & Record<string, string | number> = {
    fontFamily: FONT_MAP[editorFont],
    fontSize: `${editorFontSize}px`,
    lineHeight: editorLineHeight,
    "--preview-p-before": `${paragraphSpaceBefore}px`,
    "--preview-p-after": `${paragraphSpaceAfter}px`,
  };

  const editorClassName = [
    "w-full overflow-visible p-8 text-foreground outline-none md:p-10",
    "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4",
    "[&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold",
    "[&_ol]:list-decimal [&_ol]:pl-8 [&_ul]:list-disc [&_ul]:pl-8",
    "[&_p]:[margin-top:var(--editor-p-before)] [&_p]:[margin-bottom:var(--editor-p-after)]",
    "[&_a]:text-primary [&_a]:underline",
    "[&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-md [&_img]:object-contain",
    "[&_figure]:my-6 [&_figure]:text-center [&_figure_img]:mx-auto [&_figure_img]:my-0 [&_figure_img]:h-auto [&_figure_img]:max-w-full [&_figure_img]:rounded-md [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground",
    keepLinesTogether ? "[&_p]:[break-inside:avoid]" : "",
    avoidWidows ? "[&_p]:[orphans:2] [&_p]:[widows:2]" : "",
    pageBreakBefore ? "[&_p:first-of-type]:[break-before:page]" : "",
    keepWithNext
      ? "[&_h1]:[break-after:avoid] [&_h2]:[break-after:avoid] [&_h3]:[break-after:avoid]"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const previewClassName = [
    "max-w-none",
    "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4",
    "[&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-bold",
    "[&_ol]:list-decimal [&_ol]:pl-8 [&_ul]:list-disc [&_ul]:pl-8",
    "[&_p]:[margin-top:var(--preview-p-before)] [&_p]:[margin-bottom:var(--preview-p-after)]",
    "[&_a]:text-primary [&_a]:underline",
    "[&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-md [&_img]:object-contain",
    "[&_figure]:my-6 [&_figure]:text-center [&_figure_img]:mx-auto [&_figure_img]:my-0 [&_figure_img]:h-auto [&_figure_img]:max-w-full [&_figure_img]:rounded-md [&_figcaption]:mt-2 [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground",
  ]
    .filter(Boolean)
    .join(" ");

  function clearSelectedImage() {
    const current = selectedImageRef.current;
    if (!current) return;
    current.style.outline = "";
    current.style.outlineOffset = "";
    current.style.boxShadow = "";
    selectedImageRef.current = null;
  }

  function markImageAsSelected(image: HTMLImageElement | null) {
    clearSelectedImage();
    if (!image) return;
    image.style.outline = "3px solid rgba(89, 18, 148, 0.75)";
    image.style.outlineOffset = "2px";
    image.style.boxShadow = "0 0 0 1px rgba(89, 18, 148, 0.35)";
    selectedImageRef.current = image;
  }

  function removeImageNode(image: HTMLImageElement) {
    const parent = image.parentElement;
    image.remove();
    if (
      parent &&
      parent.tagName === "P" &&
      parent.querySelectorAll("img").length === 0 &&
      !(parent.textContent || "").trim()
    ) {
      parent.innerHTML = "<br />";
    }
    clearSelectedImage();
    syncEditorHtml();
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function saveCurrentSelection() {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    if (!editor.contains(node)) return;

    selectionRangeRef.current = range.cloneRange();
  }

  function updateToolbarFromSelection() {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    if (!editor.contains(node)) return;

    setIsBoldActive(document.queryCommandState("bold"));
    setIsItalicActive(document.queryCommandState("italic"));
    setIsUnderlineActive(document.queryCommandState("underline"));

    const nextBlock = normalizeBlockType(
      document.queryCommandValue("formatBlock"),
    );
    if (nextBlock) setBlockType(nextBlock);

    if (document.queryCommandState("justifyCenter")) {
      setTextAlign("center");
    } else if (document.queryCommandState("justifyRight")) {
      setTextAlign("right");
    } else if (document.queryCommandState("justifyFull")) {
      setTextAlign("justify");
    } else {
      setTextAlign("left");
    }

    const elementNode =
      selection.focusNode instanceof HTMLElement
        ? selection.focusNode
        : selection.focusNode?.parentElement;
    if (!elementNode || !editor.contains(elementNode)) return;

    const style = window.getComputedStyle(elementNode);
    const nextFont = fontKeyFromFamily(style.fontFamily || "");
    setEditorFont(nextFont);

    const parsedSize = Number.parseFloat(style.fontSize || "0");
    if (!Number.isNaN(parsedSize) && parsedSize > 0) {
      setEditorFontSize(closestNumber(parsedSize, FONT_SIZE_OPTIONS));
    }

    const parsedLineHeight = Number.parseFloat(style.lineHeight || "0");
    if (
      !Number.isNaN(parsedLineHeight) &&
      parsedLineHeight > 0 &&
      parsedSize > 0
    ) {
      const ratio = parsedLineHeight / parsedSize;
      setEditorLineHeight(closestNumber(ratio, LINE_HEIGHT_OPTIONS));
    }

    const parsedMarginTop = Number.parseFloat(style.marginTop || "0");
    if (!Number.isNaN(parsedMarginTop)) {
      setParagraphSpaceBefore(
        closestNumber(parsedMarginTop, PARAGRAPH_SPACE_OPTIONS),
      );
    }

    const parsedMarginBottom = Number.parseFloat(style.marginBottom || "0");
    if (!Number.isNaN(parsedMarginBottom)) {
      setParagraphSpaceAfter(
        closestNumber(parsedMarginBottom, PARAGRAPH_SPACE_OPTIONS),
      );
    }
  }

  function restoreSelection() {
    const range = selectionRangeRef.current;
    if (!range) return;

    const editor = editorRef.current;
    if (!editor) return;

    const node = range.commonAncestorContainer;
    if (!editor.contains(node)) return;

    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertAtCursor(template: string, selectText?: string) {
    const textarea = textEditorRef.current;
    const source = textarea?.value ?? editorHtml;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? source.length;
    const next = `${source.slice(0, start)}${template}${source.slice(end)}`;

    setEditorHtml(next);

    window.setTimeout(() => {
      const target = textEditorRef.current;
      if (!target) return;
      target.focus();
      const selectionStart = selectText
        ? start + template.indexOf(selectText)
        : start + template.length;
      const selectionEnd = selectText
        ? selectionStart + selectText.length
        : selectionStart;
      target.setSelectionRange(selectionStart, selectionEnd);
    }, 0);
  }

  function wrapSelection(prefix: string, suffix = prefix, placeholder = "texto") {
    const textarea = textEditorRef.current;
    const source = textarea?.value ?? editorHtml;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? source.length;
    const selected = source.slice(start, end) || placeholder;
    insertAtCursor(`${prefix}${selected}${suffix}`, selected);
  }

  function runCommand(command: string, value?: string) {
    if (command === "bold") {
      wrapSelection("**", "**", "texto em negrito");
      return;
    }
    if (command === "italic") {
      wrapSelection("*", "*", "texto em italico");
      return;
    }
    if (command === "insertUnorderedList") {
      insertAtCursor("\n- primeiro item\n- segundo item\n", "primeiro item");
      return;
    }
    if (command === "insertOrderedList") {
      insertAtCursor("\n1. primeira etapa\n2. segunda etapa\n", "primeira etapa");
      return;
    }
    if (command === "formatBlock" && value === "blockquote") {
      insertAtCursor("\n> Escreva a citacao aqui.\n", "Escreva a citacao aqui.");
      return;
    }
    if (command === "insertHTML" && value) {
      insertAtCursor(`\n${value.trim()}\n`);
      return;
    }
    if (command === "removeFormat") {
      const textarea = textEditorRef.current;
      const source = textarea?.value ?? editorHtml;
      const start = textarea?.selectionStart ?? 0;
      const end = textarea?.selectionEnd ?? source.length;
      const selected = source.slice(start, end) || source;
      const cleaned = selected
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/<[^>]+>/g, "");
      if (start === end) {
        setEditorHtml(cleaned);
      } else {
        insertAtCursor(cleaned);
      }
    }
  }

  function removeSelectedImage() {
    if (selectedImageRef.current) {
      removeImageNode(selectedImageRef.current);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const anchor = selection.anchorNode;
    const candidate =
      anchor instanceof HTMLImageElement
        ? anchor
        : anchor?.parentElement?.closest("img")
          ? (anchor.parentElement!.closest("img") as HTMLImageElement)
          : null;

    if (candidate) {
      removeImageNode(candidate);
    }
  }

  function applySpacingPreset(value: number) {
    setEditorLineHeight(value);
    setIsSpacingMenuOpen(false);
    setIsCustomSpacingOpen(false);
  }

  function removeSpacingBefore() {
    setParagraphSpaceBefore(0);
  }

  function removeSpacingAfter() {
    setParagraphSpaceAfter(0);
  }

  function toggleKeepWithNext() {
    setKeepWithNext((v) => !v);
  }

  function toggleKeepLinesTogether() {
    setKeepLinesTogether((v) => !v);
  }

  function toggleAvoidWidows() {
    setAvoidWidows((v) => !v);
  }

  function togglePageBreakBefore() {
    setPageBreakBefore((v) => !v);
  }

  function spacingOptionClass(active = false) {
    return `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${active ? "font-medium text-foreground" : "text-foreground"}`;
  }

  function applyBlock(nextType?: BlockType) {
    const type = nextType ?? blockType;
    const map: Record<BlockType, string> = {
      p: "\nTexto do paragrafo.\n",
      h1: "\n# Titulo principal\n",
      h2: "\n## Titulo da secao\n",
      h3: "\n### Subtitulo da secao\n",
    };
    insertAtCursor(map[type], map[type].trim().replace(/^#+\s*/, ""));
  }

  function insertLink() {
    const url = prompt("URL do link (https://...)");
    if (!url) return;
    const textarea = textEditorRef.current;
    const source = textarea?.value ?? editorHtml;
    const start = textarea?.selectionStart ?? source.length;
    const end = textarea?.selectionEnd ?? source.length;
    const selected = source.slice(start, end) || "texto do link";
    insertAtCursor(`[${selected}](${url})`, selected);
  }

  function openImageDialog() {
    setImageUrlDraft("");
    setImageAltDraft("");
    setImageCaptionDraft("");
    setIsImageDialogOpen(true);
  }

  function closeImageDialog() {
    setIsImageDialogOpen(false);
  }

  function handleEditorPaste(event: ClipboardEvent<HTMLDivElement>) {
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    if (!html && !text) return;

    event.preventDefault();
    focusEditor();

    const htmlFromText = text
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map(
        (part) =>
          `<p>${escapeHtmlForEditor(part).replace(/\n/g, "<br />")}</p>`,
      )
      .join("");

    if (html.trim()) {
      const safeHtml = contentToHtml(html);
      const hasText = safeHtml.replace(/<[^>]*>/g, "").trim().length > 0;
      const payload = hasText ? safeHtml : htmlFromText || "<p></p>";
      document.execCommand("insertHTML", false, payload);
      syncEditorHtml();
      return;
    }

    document.execCommand("insertHTML", false, htmlFromText || "<p></p>");
    syncEditorHtml();
  }

  function handleEditorClick(event: MouseEvent<HTMLDivElement>) {
    saveCurrentSelection();
    const target = event.target;
    if (target instanceof HTMLImageElement) {
      markImageAsSelected(target);
      return;
    }
    clearSelectedImage();
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    saveCurrentSelection();
    if (event.key !== "Backspace" && event.key !== "Delete") return;

    if (selectedImageRef.current) {
      event.preventDefault();
      removeImageNode(selectedImageRef.current);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const anchor = selection.anchorNode;
    const candidate =
      anchor instanceof HTMLImageElement
        ? anchor
        : anchor?.parentElement?.closest("img")
          ? (anchor.parentElement!.closest("img") as HTMLImageElement)
          : null;

    if (candidate) {
      event.preventDefault();
      removeImageNode(candidate);
    }
  }

  function insertImageByUrl(url: string, alt: string, caption = "") {
    const src = url.trim();
    if (!src) return;
    if (!/^(https?:\/\/|\/)/i.test(src)) {
      alert("Use uma URL valida (http/https) ou caminho relativo.");
      return;
    }
    const safeSrc = escapeAttribute(src);
    const safeAlt = escapeAttribute(alt.trim() || "Descricao da imagem");
    const safeCaption = escapeHtmlForEditor(caption.trim());
    const imageHtml = [
      '<figure>',
      `  <img src="${safeSrc}" alt="${safeAlt}">`,
      safeCaption ? `<figcaption>${safeCaption}</figcaption>` : "",
      "</figure>",
    ].join("\n");
    runCommand("insertHTML", imageHtml);
    closeImageDialog();
  }

  function insertLeadTemplate() {
    insertAtCursor(
      [
        '<div class="blog-lead">',
        "  Texto de abertura forte do artigo.",
        "</div>",
      ].join("\n"),
      "Texto de abertura forte do artigo.",
    );
  }

  function insertCalloutTemplate() {
    insertAtCursor(
      [
        '<div class="blog-callout">',
        "  <strong>Ideia central:</strong> escreva aqui o destaque.",
        "</div>",
      ].join("\n"),
      "escreva aqui o destaque",
    );
  }

  function insertStatTemplate() {
    insertAtCursor(
      [
        '<div class="blog-stat-grid">',
        '  <div class="blog-stat-card">',
        "    <strong>70%</strong>",
        "    <span>texto da estatistica</span>",
        "  </div>",
        '  <div class="blog-stat-card">',
        "    <strong>79%</strong>",
        "    <span>texto da estatistica</span>",
        "  </div>",
        "</div>",
      ].join("\n"),
      "70%",
    );
  }

  function insertStepTemplate() {
    insertAtCursor(
      [
        '<div class="blog-step-card">',
        "  <span>01</span>",
        "  <div>",
        "    <strong>Diagnostico</strong>",
        "    <p>Identifique onde o crescimento esta travando antes de criar novas campanhas.</p>",
        "  </div>",
        "</div>",
      ].join("\n"),
      "Diagnostico",
    );
  }

  function insertMaterialTemplate() {
    insertAtCursor(
      [
        '<div class="blog-material-card">',
        "  <span>Material complementar</span>",
        "  <strong>Framework de Growth Marketing para crescimento previsivel</strong>",
        "  <p>Acesse gratuitamente a biblioteca de materiais.</p>",
        '  <a href="/biblioteca">Ver biblioteca -></a>',
        "</div>",
      ].join("\n"),
      "Framework de Growth Marketing para crescimento previsivel",
    );
  }

  function insertTableTemplate() {
    insertAtCursor(
      [
        "| Criterio | Estrategia | Execucao |",
        "| --- | --- | --- |",
        "| Foco | Decisoes de longo prazo | Rotina e indicadores |",
        "| Pergunta | Para onde crescer? | O que fazer esta semana? |",
      ].join("\n"),
      "Criterio",
    );
  }

  function insertImageByUrlDraft() {
    insertImageByUrl(imageUrlDraft, imageAltDraft, imageCaptionDraft);
  }

  function pickImageFromComputer() {
    imageUploadRef.current?.click();
  }

  function pickCoverImageFromComputer() {
    coverUploadRef.current?.click();
  }

  async function uploadBlogImage(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Selecione um arquivo de imagem.");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Envie uma imagem JPG, PNG ou WebP.");
    }
    if (file.size > 5_000_000) {
      throw new Error("A imagem deve ter ate 5MB.");
    }

    try {
      return await uploadBlogImageToApi(file);
    } catch (error) {
      console.error("Falha no upload de imagem do blog", error);
      throw new Error(
        "Nao foi possivel enviar a imagem. Verifique se o endpoint de upload ja foi publicado no servidor.",
      );
    }
  }

  async function handleCoverImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingCoverImage(true);
    try {
      const result = await uploadBlogImage(file);
      setForm((prev) => ({ ...prev, coverImage: result.url }));
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar a imagem de capa.",
      );
    } finally {
      setIsUploadingCoverImage(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingBodyImage(true);
    try {
      const result = await uploadBlogImage(file);
      setImageUrlDraft(result.url);
      if (!imageAltDraft.trim()) {
        setImageAltDraft(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar a imagem.",
      );
    } finally {
      setIsUploadingBodyImage(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AdminHeader />

      <header className="mx-auto mt-6 max-w-6xl rounded-2xl border bg-card px-5 py-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold">
              <BookOpen className="h-6 w-6 text-primary" />
              Gestao do Blog
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre artigos e escolha o que sera publicado.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={generateNewsletterDraft}
              disabled={isCreatingNewsletterDraft || isLoadingPosts}
              className="h-11 gap-2 rounded-xl px-6"
            >
              <MailPlus className="h-5 w-5" />
              {isCreatingNewsletterDraft ? "Gerando..." : "Gerar newsletter"}
            </Button>

            <Button
              onClick={openNew}
              className="h-11 gap-2 rounded-xl px-6 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Novo Post
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-bold">Admin - Blog</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre posts e publique/despublique. O que estiver publicado
            aparece em <b>/blog</b>.
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 md:max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por titulo, categoria ou tema..."
              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border bg-background px-2 py-1">
                      {p.category}
                    </span>
                    <span className="rounded-full border bg-background px-2 py-1">
                      {getBlogPublicationStatusLabel(getBlogPublicationStatus(p))}
                    </span>
                    {getBlogPublicationStatus(p) === "scheduled" && (
                      <span className="rounded-full border bg-background px-2 py-1">
                        {p.dateISO} {p.publishTime || "09:00"}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-base font-bold">{p.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {p.excerpt}
                  </div>

                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(p)}
                    className="gap-2"
                  >
                    {p.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {p.published ? "Despublicar" : "Publicar agora"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(p)}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(p)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {isLoadingPosts && (
            <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
              Carregando posts do banco...
            </div>
          )}

          {!isLoadingPosts && filtered.length === 0 && (
            <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
              Nenhum post encontrado.
            </div>
          )}
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-start bg-black/55 p-2 md:p-4">
          <div className="flex h-[96vh] w-full max-w-[98vw] flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {editingId ? "Editar post" : "Novo post"}
              </div>
              <Button variant="ghost" onClick={closeModal}>
                Fechar
              </Button>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              <div className="rounded-xl border bg-background/80 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      CMS editorial
                    </div>
                    <h2 className="mt-1 text-xl font-bold">
                      Editor editorial simples
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      Voce pode escrever normalmente usando paragrafos, titulos
                      e listas. Use a barra do editor para aplicar negrito,
                      H2, H3, listas, links, citacoes e imagens. Voce nao
                      precisa saber programacao.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-lg border bg-card p-3">
                    <b className="block text-foreground">Conteudo</b>
                    Titulo, resumo e corpo do artigo.
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <b className="block text-foreground">Classificacao</b>
                    Categoria e tempo de leitura.
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <b className="block text-foreground">Imagem</b>
                    Capa separada das imagens internas.
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <b className="block text-foreground">Publicacao</b>
                    Revise como rascunho antes de publicar.
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <b className="block text-foreground">SEO</b>
                    Titulo e resumo viram fallback publico.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 p-4">
                <div className="text-sm font-semibold text-foreground">
                  Conteudo principal
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  O resumo ideal tem 140 a 250 caracteres. O slug pode ficar em
                  branco para ser gerado automaticamente.
                </p>
                <div className="mt-3 space-y-3">
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Titulo do post"
                className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
              />

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px]">
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="Slug (opcional - gera automatico)"
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                />
                <input
                  value={form.dateISO}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dateISO: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                  type="date"
                />
                <input
                  value={form.publishTime || "09:00"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, publishTime: e.target.value }))
                  }
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                  type="time"
                  aria-label="Horario de publicacao"
                />
              </div>

              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Resumo curto (excerpt)"
                className="min-h-[96px] w-full rounded-xl border bg-background p-3 outline-none"
              />
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 p-4">
                <div className="text-sm font-semibold text-foreground">
                  Classificacao
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Escolha o tema principal do artigo.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value as BlogCategory,
                      }))
                    }
                    className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                    aria-label="Categoria ou tema do post"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <input
                    value={form.readTime}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, readTime: e.target.value }))
                    }
                    placeholder="Tempo de leitura (ex: 8 min)"
                    className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-background/80 p-4">
                <div className="text-sm font-semibold text-foreground">
                  Imagem de capa
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Imagem horizontal recomendada. Exemplo: 1920x1080. Use uma
                  imagem leve e otimizada.
                </p>
                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div className="space-y-2">
                    <Input
                      value={form.coverImage || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          coverImage: e.target.value,
                        }))
                      }
                      placeholder="/lovable-uploads/nome-da-imagem.png"
                    />
                    <input
                      ref={coverUploadRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCoverImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={pickCoverImageFromComputer}
                      disabled={isUploadingCoverImage}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingCoverImage
                        ? "Enviando..."
                        : "Enviar imagem do computador"}
                    </Button>
                  </div>
                  <div className="overflow-hidden rounded-lg border bg-card">
                    {form.coverImage ? (
                      <div className="relative aspect-video">
                        <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-muted-foreground">
                          Preview indisponivel
                        </div>
                        <img
                          src={resolveBlogMediaUrl(form.coverImage)}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          className="relative h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center px-3 text-center text-xs text-muted-foreground">
                        Preview da capa
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-background">
                <input
                  ref={imageUploadRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex flex-col gap-3 border-b bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Editor e previa
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Escreva no Editor. Alterne para Previa renderizada para
                      ver como o artigo ficara publicado.
                    </p>
                  </div>
                  <div className="inline-flex rounded-lg border bg-background p-1">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className={[
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        !showPreview
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        syncEditorHtml();
                        setShowPreview(true);
                      }}
                      className={[
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        showPreview
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      Previa renderizada
                    </button>
                  </div>
                </div>
                <div
                  className={[
                    "sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b bg-muted/95 p-3 shadow-sm backdrop-blur-sm",
                    showPreview ? "hidden" : "",
                  ].join(" ")}
                  onMouseDown={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button")) event.preventDefault();
                  }}
                >
                  <button
                    onClick={() => runCommand("undo")}
                    className={toolbarButtonClass()}
                    title="Desfazer"
                  >
                    <Undo2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => runCommand("redo")}
                    className={toolbarButtonClass()}
                    title="Refazer"
                  >
                    <Redo2 className="h-4 w-4" />
                  </button>

                  <div className="mx-1 h-6 w-px bg-border" />

                  <button
                    onClick={() => applyBlock("p")}
                    className={toolbarButtonClass(blockType === "p")}
                    title="Texto normal"
                  >
                    Texto
                  </button>
                  <button
                    onClick={() => applyBlock("h2")}
                    className={toolbarButtonClass(blockType === "h2")}
                    title="Secao principal"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => applyBlock("h3")}
                    className={toolbarButtonClass(blockType === "h3")}
                    title="Subsecao"
                  >
                    H3
                  </button>

                  <div ref={spacingMenuRef} className="relative hidden">
                    <button
                      onClick={() => {
                        setIsSpacingMenuOpen((v) => !v);
                        setIsCustomSpacingOpen(false);
                      }}
                      className={toolbarButtonClass(isSpacingMenuOpen)}
                      title="Espacamento de paragrafo"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </button>

                    {isSpacingMenuOpen && (
                      <div className="absolute left-0 top-11 z-40 w-[320px] rounded-xl border bg-popover py-2 shadow-xl">
                        <button
                          onClick={() => applySpacingPreset(1)}
                          className={spacingOptionClass(editorLineHeight === 1)}
                        >
                          <span className="w-4 text-center">
                            {editorLineHeight === 1 ? "✓" : ""}
                          </span>
                          Simples
                        </button>
                        <button
                          onClick={() => applySpacingPreset(1.15)}
                          className={spacingOptionClass(
                            editorLineHeight === 1.15,
                          )}
                        >
                          <span className="w-4 text-center">
                            {editorLineHeight === 1.15 ? "✓" : ""}
                          </span>
                          1,15
                        </button>
                        <button
                          onClick={() => applySpacingPreset(1.5)}
                          className={spacingOptionClass(
                            editorLineHeight === 1.5,
                          )}
                        >
                          <span className="w-4 text-center">
                            {editorLineHeight === 1.5 ? "✓" : ""}
                          </span>
                          1,5
                        </button>
                        <button
                          onClick={() => applySpacingPreset(2)}
                          className={spacingOptionClass(editorLineHeight === 2)}
                        >
                          <span className="w-4 text-center">
                            {editorLineHeight === 2 ? "✓" : ""}
                          </span>
                          Duplo
                        </button>

                        <div className="my-2 border-t" />
                        <button
                          onClick={removeSpacingBefore}
                          className={spacingOptionClass(
                            paragraphSpaceBefore === 0,
                          )}
                        >
                          <span className="w-4 text-center">
                            {paragraphSpaceBefore === 0 ? "✓" : ""}
                          </span>
                          Remover espaco antes do paragrafo
                        </button>
                        <button
                          onClick={removeSpacingAfter}
                          className={spacingOptionClass(
                            paragraphSpaceAfter === 0,
                          )}
                        >
                          <span className="w-4 text-center">
                            {paragraphSpaceAfter === 0 ? "✓" : ""}
                          </span>
                          Remover espaco depois do paragrafo
                        </button>

                        <div className="my-2 border-t" />
                        <button
                          onClick={() => setIsCustomSpacingOpen((v) => !v)}
                          className={spacingOptionClass(isCustomSpacingOpen)}
                        >
                          <span className="w-4 text-center">
                            {isCustomSpacingOpen ? "✓" : ""}
                          </span>
                          Espacamento personalizado
                        </button>
                        {isCustomSpacingOpen && (
                          <div className="grid grid-cols-2 gap-2 px-2 py-2">
                            <select
                              value={String(paragraphSpaceBefore)}
                              onChange={(e) =>
                                setParagraphSpaceBefore(Number(e.target.value))
                              }
                              className="h-9 rounded-lg border bg-background px-2 text-xs outline-none"
                              title="Espaco antes"
                            >
                              {PARAGRAPH_SPACE_OPTIONS.map((space) => (
                                <option key={space} value={space}>
                                  Antes {space}px
                                </option>
                              ))}
                            </select>
                            <select
                              value={String(paragraphSpaceAfter)}
                              onChange={(e) =>
                                setParagraphSpaceAfter(Number(e.target.value))
                              }
                              className="h-9 rounded-lg border bg-background px-2 text-xs outline-none"
                              title="Espaco depois"
                            >
                              {PARAGRAPH_SPACE_OPTIONS.map((space) => (
                                <option key={space} value={space}>
                                  Depois {space}px
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="my-2 border-t" />
                        <button
                          onClick={toggleKeepWithNext}
                          className={spacingOptionClass(keepWithNext)}
                        >
                          <span className="w-4 text-center">
                            {keepWithNext ? "✓" : ""}
                          </span>
                          Manter com o proximo
                        </button>
                        <button
                          onClick={toggleKeepLinesTogether}
                          className={spacingOptionClass(keepLinesTogether)}
                        >
                          <span className="w-4 text-center">
                            {keepLinesTogether ? "✓" : ""}
                          </span>
                          Manter as linhas juntas
                        </button>
                        <button
                          onClick={toggleAvoidWidows}
                          className={spacingOptionClass(avoidWidows)}
                        >
                          <span className="w-4 text-center">
                            {avoidWidows ? "✓" : ""}
                          </span>
                          Evitar linhas unicas
                        </button>
                        <button
                          onClick={togglePageBreakBefore}
                          className={spacingOptionClass(pageBreakBefore)}
                        >
                          <span className="w-4 text-center">
                            {pageBreakBefore ? "✓" : ""}
                          </span>
                          Adicionar quebra de pagina antes do texto
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => runCommand("bold")}
                    className={toolbarButtonClass(isBoldActive)}
                    title="Negrito"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => runCommand("italic")}
                    className={toolbarButtonClass(isItalicActive)}
                    title="Italico"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => runCommand("formatBlock", "blockquote")}
                    className={toolbarButtonClass()}
                  >
                    Citacao
                  </button>
                  <button
                    onClick={insertLeadTemplate}
                    className={toolbarButtonClass()}
                  >
                    Lead
                  </button>
                  <button
                    onClick={insertCalloutTemplate}
                    className={toolbarButtonClass()}
                  >
                    Destaque
                  </button>
                  <button
                    onClick={insertStatTemplate}
                    className={toolbarButtonClass()}
                  >
                    Estatistica
                  </button>
                  <button
                    onClick={insertStepTemplate}
                    className={toolbarButtonClass()}
                  >
                    Card numerado
                  </button>
                  <button
                    onClick={insertMaterialTemplate}
                    className={toolbarButtonClass()}
                  >
                    CTA material
                  </button>
                  <button
                    onClick={insertTableTemplate}
                    className={toolbarButtonClass()}
                  >
                    Tabela
                  </button>

                  <button
                    onClick={() => runCommand("insertUnorderedList")}
                    className={toolbarButtonClass()}
                    title="Lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => runCommand("insertOrderedList")}
                    className={toolbarButtonClass()}
                    title="Lista numerada"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => runCommand("removeFormat")}
                    className={toolbarButtonClass()}
                    title="Limpar formatacao"
                  >
                    <RemoveFormatting className="h-4 w-4" />
                  </button>

                  <button onClick={insertLink} className={toolbarButtonClass()}>
                    Link
                  </button>
                  <button
                    onClick={openImageDialog}
                    className={toolbarButtonClass()}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Imagem
                    </span>
                  </button>
                  <button
                    onClick={removeSelectedImage}
                    className={toolbarButtonClass()}
                  >
                    Remover imagem
                  </button>
                </div>

                <div className="bg-muted/20 p-3 md:p-6">
                  <div
                    className={[
                      "mx-auto flex w-full justify-center",
                      showPreview ? "hidden" : "",
                    ].join(" ")}
                  >
                    <div className="w-full max-w-[980px] rounded-md border bg-white shadow-[0_12px_35px_rgba(24,16,50,0.08)]">
                      <textarea
                        ref={textEditorRef}
                        value={editorHtml}
                        onChange={(event) => setEditorHtml(event.target.value)}
                        placeholder="Escreva o artigo em Markdown simples. HTML seguro com classes do blog tambem e permitido."
                        className={editorClassName}
                        style={editorStyle}
                      />
                    </div>
                  </div>

                  {showPreview && (
                    <div className="mx-auto w-full max-w-[980px] rounded-md border bg-white p-8 shadow-[0_12px_35px_rgba(24,16,50,0.08)] md:p-10">
                      {editorHtml.trim() ? (
                        <BlogContentRenderer
                          content={editorHtml}
                          className={previewClassName}
                          style={previewStyle}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          A visualizacao aparece aqui enquanto voce escreve.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border bg-background/80 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    Publicacao
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use o fuso {BLOG_PUBLICATION_TIMEZONE}. Datas futuras ficam agendadas.
                  </p>
                  <select
                    value={form.status || (form.published ? "published" : "draft")}
                    onChange={(e) => {
                      const status = e.target.value as BlogPublicationStatus;
                      setForm((prev) => ({
                        ...prev,
                        status,
                        published: status !== "draft",
                      }));
                    }}
                    className="mt-3 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="scheduled">Agendado</option>
                  </select>
                  {(form.status === "scheduled" ||
                    (form.status === "published" &&
                      isFuturePublication(form.dateISO, form.publishTime))) && (
                    <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                      A data/hora esta no futuro. Este post so aparecera no blog no horario definido.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border bg-background/80 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    SEO
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Enquanto nao ha campos dedicados no banco, o site usa o
                    titulo e o resumo como fallback de SEO. Revise esses dois
                    campos antes de publicar.
                  </p>
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button onClick={save} disabled={isSavingPost}>
                  {isSavingPost ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>

          {isImageDialogOpen && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
              <div className="w-full max-w-xl rounded-2xl border bg-card p-5 shadow-2xl">
                <div className="text-lg font-bold">Inserir imagem</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Envie uma imagem do computador para gerar uma URL publica ou
                  informe uma URL/caminho ja existente.
                </p>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={pickImageFromComputer}
                    disabled={isUploadingBodyImage}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingBodyImage
                      ? "Enviando..."
                      : "Escolher arquivo do computador"}
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <Input
                    value={imageUrlDraft}
                    onChange={(e) => setImageUrlDraft(e.target.value)}
                    placeholder="https://... ou /caminho-da-imagem"
                  />
                  <Input
                    value={imageAltDraft}
                    onChange={(e) => setImageAltDraft(e.target.value)}
                    placeholder="Texto alternativo (opcional)"
                  />
                  <Input
                    value={imageCaptionDraft}
                    onChange={(e) => setImageCaptionDraft(e.target.value)}
                    placeholder="Legenda opcional"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={closeImageDialog}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={insertImageByUrlDraft}
                    disabled={!imageUrlDraft.trim() || isUploadingBodyImage}
                  >
                    Inserir por URL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
