import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react";
import {
  type BlogCategory,
  type BlogPost,
  deletePost,
  getAllPosts,
  makeId,
  makeSlug,
  upsertPost,
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
import { contentToHtml } from "@/lib/markdown";

const categories: BlogCategory[] = ["GTM", "ICP", "Oferta", "Sales", "Growth", "IA"];
type BlockType = "p" | "h1" | "h2" | "h3";
type EditorFont = "theme" | "arial" | "georgia" | "times";
type TextAlignType = "left" | "center" | "right" | "justify";

const MIN_EDITOR_PAGE_HEIGHT = 1200;
const TOOLBAR_BUTTON_CLASS = "inline-flex h-9 items-center justify-center rounded-lg border bg-background px-2.5 text-sm";
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
    readTime: "5 min",
    category: "GTM",
    tags: [],
    content: "",
    published: false,
    updatedAtISO: today,
  };
}

function escapeHtmlForEditor(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function closestNumber(value: number, options: number[]) {
  return options.reduce((prev, current) => (Math.abs(current - value) < Math.abs(prev - value) ? current : prev), options[0]);
}

function normalizeBlockType(value: string | null): BlockType | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/[<>"']/g, "").trim();
  if (normalized.includes("h1")) return "h1";
  if (normalized.includes("h2")) return "h2";
  if (normalized.includes("h3")) return "h3";
  if (normalized.includes("p") || normalized.includes("normal") || normalized.includes("div")) return "p";
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
  const [refresh, setRefresh] = useState(0);
  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blockType, setBlockType] = useState<BlockType>("p");
  const [editorFont, setEditorFont] = useState<EditorFont>(DEFAULT_EDITOR_SETTINGS.font);
  const [editorFontSize, setEditorFontSize] = useState<number>(DEFAULT_EDITOR_SETTINGS.fontSize);
  const [editorLineHeight, setEditorLineHeight] = useState<number>(DEFAULT_EDITOR_SETTINGS.lineHeight);
  const [paragraphSpaceBefore, setParagraphSpaceBefore] = useState<number>(DEFAULT_EDITOR_SETTINGS.paragraphSpaceBefore);
  const [paragraphSpaceAfter, setParagraphSpaceAfter] = useState<number>(DEFAULT_EDITOR_SETTINGS.paragraphSpaceAfter);
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
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [imageAltDraft, setImageAltDraft] = useState("");
  const [form, setForm] = useState<BlogPost>(newPostTemplate());
  const [editorHtml, setEditorHtml] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const selectionRangeRef = useRef<Range | null>(null);
  const spacingMenuRef = useRef<HTMLDivElement | null>(null);

  const posts = useMemo(() => getAllPosts(), [refresh]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((p) => {
      const hay = `${p.title} ${p.slug} ${p.category} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(s);
    });
  }, [posts, q]);

  const previewHtml = useMemo(() => contentToHtml(editorHtml), [editorHtml]);

  function refreshList() {
    setRefresh((r) => r + 1);
  }

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
    setForm({ ...post });
    setEditorHtml(contentToHtml(post.content || ""));
    setEditorFont(post.editorSettings?.font ?? DEFAULT_EDITOR_SETTINGS.font);
    setEditorFontSize(post.editorSettings?.fontSize ?? DEFAULT_EDITOR_SETTINGS.fontSize);
    setEditorLineHeight(post.editorSettings?.lineHeight ?? DEFAULT_EDITOR_SETTINGS.lineHeight);
    setParagraphSpaceBefore(post.editorSettings?.paragraphSpaceBefore ?? DEFAULT_EDITOR_SETTINGS.paragraphSpaceBefore);
    setParagraphSpaceAfter(post.editorSettings?.paragraphSpaceAfter ?? DEFAULT_EDITOR_SETTINGS.paragraphSpaceAfter);
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
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isOpen]);

  function currentEditorHtml() {
    return editorRef.current?.innerHTML?.trim() || editorHtml || "";
  }

  function currentEditorText() {
    return editorRef.current?.textContent?.trim() || "";
  }

  function save() {
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

    const today = new Date().toISOString().slice(0, 10);
    const payload: BlogPost = {
      ...form,
      id: editingId ?? form.id,
      title,
      slug: form.slug.trim() || makeSlug(title),
      excerpt: form.excerpt.trim(),
      content,
      editorSettings: {
        font: editorFont,
        fontSize: editorFontSize,
        lineHeight: editorLineHeight,
        paragraphSpaceBefore,
        paragraphSpaceAfter,
      },
      updatedAtISO: today,
    };

    upsertPost(payload);
    refreshList();
    closeModal();
  }

  function remove(post: BlogPost) {
    if (!confirm(`Excluir "${post.title}"?`)) return;
    deletePost(post.id);
    refreshList();
  }

  function togglePublish(post: BlogPost) {
    upsertPost({
      ...post,
      published: !post.published,
      updatedAtISO: new Date().toISOString().slice(0, 10),
    });
    refreshList();
  }

  function syncEditorHtml() {
    const html = editorRef.current?.innerHTML ?? "";
    setEditorHtml(html);
    saveCurrentSelection();
    updateToolbarFromSelection();
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
    keepLinesTogether ? "[&_p]:[break-inside:avoid]" : "",
    avoidWidows ? "[&_p]:[orphans:2] [&_p]:[widows:2]" : "",
    pageBreakBefore ? "[&_p:first-of-type]:[break-before:page]" : "",
    keepWithNext ? "[&_h1]:[break-after:avoid] [&_h2]:[break-after:avoid] [&_h3]:[break-after:avoid]" : "",
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
    if (parent && parent.tagName === "P" && parent.querySelectorAll("img").length === 0 && !(parent.textContent || "").trim()) {
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

    const nextBlock = normalizeBlockType(document.queryCommandValue("formatBlock"));
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

    const elementNode = selection.focusNode instanceof HTMLElement ? selection.focusNode : selection.focusNode?.parentElement;
    if (!elementNode || !editor.contains(elementNode)) return;

    const style = window.getComputedStyle(elementNode);
    const nextFont = fontKeyFromFamily(style.fontFamily || "");
    setEditorFont(nextFont);

    const parsedSize = Number.parseFloat(style.fontSize || "0");
    if (!Number.isNaN(parsedSize) && parsedSize > 0) {
      setEditorFontSize(closestNumber(parsedSize, FONT_SIZE_OPTIONS));
    }

    const parsedLineHeight = Number.parseFloat(style.lineHeight || "0");
    if (!Number.isNaN(parsedLineHeight) && parsedLineHeight > 0 && parsedSize > 0) {
      const ratio = parsedLineHeight / parsedSize;
      setEditorLineHeight(closestNumber(ratio, LINE_HEIGHT_OPTIONS));
    }

    const parsedMarginTop = Number.parseFloat(style.marginTop || "0");
    if (!Number.isNaN(parsedMarginTop)) {
      setParagraphSpaceBefore(closestNumber(parsedMarginTop, PARAGRAPH_SPACE_OPTIONS));
    }

    const parsedMarginBottom = Number.parseFloat(style.marginBottom || "0");
    if (!Number.isNaN(parsedMarginBottom)) {
      setParagraphSpaceAfter(closestNumber(parsedMarginBottom, PARAGRAPH_SPACE_OPTIONS));
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

  function runCommand(command: string, value?: string) {
    focusEditor();
    restoreSelection();
    document.execCommand(command, false, value);
    syncEditorHtml();
    updateToolbarFromSelection();
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
      p: "<p>",
      h1: "<h1>",
      h2: "<h2>",
      h3: "<h3>",
    };
    runCommand("formatBlock", map[type]);
  }

  function insertLink() {
    focusEditor();
    const url = prompt("URL do link (https://...)");
    if (!url) return;
    runCommand("createLink", url);
  }

  function openImageDialog() {
    setImageUrlDraft("");
    setImageAltDraft("");
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
      .map((part) => `<p>${escapeHtmlForEditor(part).replace(/\n/g, "<br />")}</p>`)
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

  function insertImageByUrl(url: string, alt: string) {
    const src = url.trim();
    if (!src) return;
    if (!/^(https?:\/\/|\/|data:image\/)/i.test(src)) {
      alert("Use uma URL valida (http/https) ou caminho relativo.");
      return;
    }
    const imageHtml = `<p><img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" /></p>`;
    runCommand("insertHTML", imageHtml);
    closeImageDialog();
  }

  function insertImageByUrlDraft() {
    insertImageByUrl(imageUrlDraft, imageAltDraft);
  }

  function pickImageFromComputer() {
    imageUploadRef.current?.click();
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 1_800_000) {
      alert("Imagem muito grande para salvar localmente. Use ate 1.8MB ou insira por URL.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      const imageHtml = `<p><img src="${escapeAttribute(src)}" alt="${escapeAttribute(imageAltDraft.trim())}" /></p>`;
      runCommand("insertHTML", imageHtml);
      closeImageDialog();
    };
    reader.readAsDataURL(file);
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

          <Button onClick={openNew} className="h-11 gap-2 rounded-xl px-6 shadow-lg">
            <Plus className="h-5 w-5" />
            Novo Post
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-2xl font-bold">Admin - Blog</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre posts e publique/despublique. O que estiver publicado aparece em <b>/blog</b>.
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 md:max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por titulo, categoria, tag..."
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
                    <span className="rounded-full border bg-background px-2 py-1">{p.category}</span>
                    <span className="rounded-full border bg-background px-2 py-1">
                      {p.published ? "Publicado" : "Rascunho"}
                    </span>
                  </div>

                  <div className="mt-2 text-base font-bold">{p.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.excerpt}</div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.slice(0, 6).map((t) => (
                      <span key={t} className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="outline" size="sm" onClick={() => togglePublish(p)} className="gap-2">
                    {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {p.published ? "Despublicar" : "Publicar"}
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>

                  <Button variant="destructive" size="sm" onClick={() => remove(p)} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
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
              <div className="text-lg font-bold">{editingId ? "Editar post" : "Novo post"}</div>
              <Button variant="ghost" onClick={closeModal}>
                Fechar
              </Button>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Titulo do post"
                className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Slug (opcional - gera automatico)"
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                />
                <input
                  value={form.dateISO}
                  onChange={(e) => setForm((prev) => ({ ...prev, dateISO: e.target.value }))}
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                  type="date"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as BlogCategory }))}
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  value={form.readTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, readTime: e.target.value }))}
                  placeholder="Tempo de leitura (ex: 8 min)"
                  className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
                />
              </div>

              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Resumo curto (excerpt)"
                className="min-h-[96px] w-full rounded-xl border bg-background p-3 outline-none"
              />

              <input
                value={form.tags.join(", ")}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Tags separadas por virgula"
                className="h-11 w-full rounded-xl border bg-background px-3 outline-none"
              />

              <div className="rounded-xl border bg-background">
                <input ref={imageUploadRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div
                  className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b bg-muted/95 p-3 shadow-sm backdrop-blur-sm"
                  onMouseDown={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button")) event.preventDefault();
                  }}
                >
                  <button onClick={() => runCommand("undo")} className={toolbarButtonClass()} title="Desfazer">
                    <Undo2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("redo")} className={toolbarButtonClass()} title="Refazer">
                    <Redo2 className="h-4 w-4" />
                  </button>

                  <div className="mx-1 h-6 w-px bg-border" />

                  <select
                    value={blockType}
                    onChange={(e) => {
                      const nextType = e.target.value as BlockType;
                      setBlockType(nextType);
                      applyBlock(nextType);
                    }}
                    className="h-9 rounded-lg border bg-background px-2 text-sm outline-none"
                  >
                    <option value="p">Texto normal</option>
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                  <button onClick={() => applyBlock()} className={toolbarButtonClass()}>
                    Inserir bloco
                  </button>

                  <select
                    value={editorFont}
                    onChange={(e) => setEditorFont(e.target.value as EditorFont)}
                    className="h-9 rounded-lg border bg-background px-2 text-sm outline-none"
                  >
                    <option value="theme">Fonte do tema</option>
                    <option value="arial">Arial</option>
                    <option value="georgia">Georgia</option>
                    <option value="times">Times New Roman</option>
                  </select>

                  <select
                    value={String(editorFontSize)}
                    onChange={(e) => setEditorFontSize(Number(e.target.value))}
                    className="h-9 rounded-lg border bg-background px-2 text-sm outline-none"
                  >
                    {FONT_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>

                  <div ref={spacingMenuRef} className="relative">
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
                        <button onClick={() => applySpacingPreset(1)} className={spacingOptionClass(editorLineHeight === 1)}>
                          <span className="w-4 text-center">{editorLineHeight === 1 ? "✓" : ""}</span>
                          Simples
                        </button>
                        <button onClick={() => applySpacingPreset(1.15)} className={spacingOptionClass(editorLineHeight === 1.15)}>
                          <span className="w-4 text-center">{editorLineHeight === 1.15 ? "✓" : ""}</span>
                          1,15
                        </button>
                        <button onClick={() => applySpacingPreset(1.5)} className={spacingOptionClass(editorLineHeight === 1.5)}>
                          <span className="w-4 text-center">{editorLineHeight === 1.5 ? "✓" : ""}</span>
                          1,5
                        </button>
                        <button onClick={() => applySpacingPreset(2)} className={spacingOptionClass(editorLineHeight === 2)}>
                          <span className="w-4 text-center">{editorLineHeight === 2 ? "✓" : ""}</span>
                          Duplo
                        </button>

                        <div className="my-2 border-t" />
                        <button onClick={removeSpacingBefore} className={spacingOptionClass(paragraphSpaceBefore === 0)}>
                          <span className="w-4 text-center">{paragraphSpaceBefore === 0 ? "✓" : ""}</span>
                          Remover espaco antes do paragrafo
                        </button>
                        <button onClick={removeSpacingAfter} className={spacingOptionClass(paragraphSpaceAfter === 0)}>
                          <span className="w-4 text-center">{paragraphSpaceAfter === 0 ? "✓" : ""}</span>
                          Remover espaco depois do paragrafo
                        </button>

                        <div className="my-2 border-t" />
                        <button onClick={() => setIsCustomSpacingOpen((v) => !v)} className={spacingOptionClass(isCustomSpacingOpen)}>
                          <span className="w-4 text-center">{isCustomSpacingOpen ? "✓" : ""}</span>
                          Espacamento personalizado
                        </button>
                        {isCustomSpacingOpen && (
                          <div className="grid grid-cols-2 gap-2 px-2 py-2">
                            <select
                              value={String(paragraphSpaceBefore)}
                              onChange={(e) => setParagraphSpaceBefore(Number(e.target.value))}
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
                              onChange={(e) => setParagraphSpaceAfter(Number(e.target.value))}
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
                        <button onClick={toggleKeepWithNext} className={spacingOptionClass(keepWithNext)}>
                          <span className="w-4 text-center">{keepWithNext ? "✓" : ""}</span>
                          Manter com o proximo
                        </button>
                        <button onClick={toggleKeepLinesTogether} className={spacingOptionClass(keepLinesTogether)}>
                          <span className="w-4 text-center">{keepLinesTogether ? "✓" : ""}</span>
                          Manter as linhas juntas
                        </button>
                        <button onClick={toggleAvoidWidows} className={spacingOptionClass(avoidWidows)}>
                          <span className="w-4 text-center">{avoidWidows ? "✓" : ""}</span>
                          Evitar linhas unicas
                        </button>
                        <button onClick={togglePageBreakBefore} className={spacingOptionClass(pageBreakBefore)}>
                          <span className="w-4 text-center">{pageBreakBefore ? "✓" : ""}</span>
                          Adicionar quebra de pagina antes do texto
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={() => runCommand("bold")} className={toolbarButtonClass(isBoldActive)} title="Negrito">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("italic")} className={toolbarButtonClass(isItalicActive)} title="Italico">
                    <Italic className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("underline")} className={toolbarButtonClass(isUnderlineActive)} title="Sublinhado">
                    <Underline className="h-4 w-4" />
                  </button>

                  <button onClick={() => runCommand("formatBlock", "blockquote")} className={toolbarButtonClass()}>
                    Citacao
                  </button>

                  <button onClick={() => runCommand("justifyLeft")} className={toolbarButtonClass(textAlign === "left")} title="Alinhar a esquerda">
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("justifyCenter")} className={toolbarButtonClass(textAlign === "center")} title="Centralizar">
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("justifyRight")} className={toolbarButtonClass(textAlign === "right")} title="Alinhar a direita">
                    <AlignRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("justifyFull")} className={toolbarButtonClass(textAlign === "justify")} title="Justificar">
                    <AlignJustify className="h-4 w-4" />
                  </button>

                  <button onClick={() => runCommand("insertUnorderedList")} className={toolbarButtonClass()} title="Lista">
                    <List className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("insertOrderedList")} className={toolbarButtonClass()} title="Lista numerada">
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button onClick={() => runCommand("removeFormat")} className={toolbarButtonClass()} title="Limpar formatacao">
                    <RemoveFormatting className="h-4 w-4" />
                  </button>

                  <button onClick={insertLink} className={toolbarButtonClass()}>
                    Link
                  </button>
                  <button onClick={openImageDialog} className={toolbarButtonClass()}>
                    <span className="inline-flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Imagem
                    </span>
                  </button>
                  <button onClick={removeSelectedImage} className={toolbarButtonClass()}>
                    Remover imagem
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview((v) => !v);
                      syncEditorHtml();
                    }}
                    className={toolbarButtonClass(showPreview)}
                  >
                    {showPreview ? "Ocultar preview" : "Mostrar preview"}
                  </button>
                </div>

                <div className="bg-muted/20 p-3 md:p-6">
                  <div className="mx-auto flex w-full justify-center">
                    <div className="w-full max-w-[980px] rounded-md border bg-white shadow-[0_12px_35px_rgba(24,16,50,0.08)]">
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={syncEditorHtml}
                        onBlur={syncEditorHtml}
                        onMouseUp={saveCurrentSelection}
                        onKeyUp={saveCurrentSelection}
                        onFocus={saveCurrentSelection}
                        onClick={handleEditorClick}
                        onKeyDown={handleEditorKeyDown}
                        onPaste={handleEditorPaste}
                        className={editorClassName}
                        style={editorStyle}
                      />
                    </div>
                  </div>

                  {showPreview && (
                    <div className="mx-auto mt-6 w-full max-w-[980px] rounded-md border bg-white p-8 shadow-[0_12px_35px_rgba(24,16,50,0.08)] md:p-10">
                      {editorHtml.trim() ? (
                        <article
                          className={previewClassName}
                          style={previewStyle}
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">A visualizacao aparece aqui enquanto voce escreve.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                />
                Publicado
              </label>

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button onClick={save}>Salvar</Button>
              </div>
            </div>
          </div>

          {isImageDialogOpen && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4">
              <div className="w-full max-w-xl rounded-2xl border bg-card p-5 shadow-2xl">
                <div className="text-lg font-bold">Inserir imagem</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha um arquivo no computador ou insira uma URL.
                </p>

                <div className="mt-4">
                  <Button variant="outline" onClick={pickImageFromComputer} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Escolher arquivo do computador
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
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={closeImageDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={insertImageByUrlDraft} disabled={!imageUrlDraft.trim()}>
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
