import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readBackendFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("blog backend scheduling source", () => {
  it("save.php preserves scheduled date and time over published=true", () => {
    const savePhp = readBackendFile("backend/api/blog/save.php");

    expect(savePhp).toContain("if ($status === 'published' || $status === 'scheduled')");
    expect(savePhp).toContain("'published_at' => $publishedAt");
    expect(savePhp).toContain("$computedStatus = !$published ? 'draft' : ($publicationDateTime > $now ? 'scheduled' : 'published')");
    expect(savePhp).toContain("'is_published' => $published ? 1 : 0");
    expect(savePhp).toContain("'published_at' => $publishedAt");
    expect(savePhp).toContain("'computed_status' => $computedStatus");
  });

  it("public list.php filters future scheduled posts by published_at", () => {
    const listPhp = readBackendFile("backend/api/blog/list.php");

    expect(listPhp).toContain("new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo'))");
    expect(listPhp).toContain("WHERE is_published = 1 AND published_at <= :now");
    expect(listPhp).not.toContain("published_at IS NULL OR published_at <= :now");
  });

  it("public show.php blocks direct access before published_at", () => {
    const showPhp = readBackendFile("backend/api/blog/show.php");

    expect(showPhp).toContain("$isPubliclyVisible = $isPublished && $publishedAt !== '' && $publishedAt <= $nowSql");
    expect(showPhp).toContain("if (!$isPubliclyVisible)");
    expect(showPhp).not.toContain("$isScheduledForFuture");
  });
});
