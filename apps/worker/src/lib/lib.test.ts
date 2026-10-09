import { describe, expect, it } from "vitest";
import { buildEmail } from "./email";
import { generateSlug, isValidSlug } from "./slug";

describe("slug", () => {
  it("generates 8 lowercase alphanumerics that pass validation", () => {
    const slugs = new Set(Array.from({ length: 500 }, generateSlug));
    for (const slug of slugs) expect(isValidSlug(slug)).toBe(true);
    expect(slugs.size).toBe(500);
  });

  it("rejects anything else", () => {
    for (const bad of ["", "abc", "ABCDEFGH", "abcd123!", "abcd12345", "../etc/x"]) {
      expect(isValidSlug(bad)).toBe(false);
    }
  });
});

describe("buildEmail", () => {
  it("escapes the sender hint and builds the letter link", () => {
    const email = buildEmail({
      slug: "abcd1234",
      accent: "#8b90d0",
      fromHint: `<script>alert("x")</script>`,
      baseUrl: "https://letters.example/",
    });
    expect(email.url).toBe("https://letters.example/m/abcd1234");
    expect(email.html).toContain('href="https://letters.example/m/abcd1234"');
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.text).toContain(email.url);
  });
});
