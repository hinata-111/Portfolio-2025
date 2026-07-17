import { describe, it, expect } from "vitest";
import {
  profile, aboutInfo, aboutParagraphs, motto, stack, timeline, projects, beyond, tickerWords,
} from "@/app/content";

describe("content", () => {
  it("has the catch phrase parts", () => {
    expect(profile.catchTop).toBe("笑顔");
    expect(profile.catchBottom).toBe("心を動かす");
  });
  it("has expected collection sizes", () => {
    expect(aboutInfo).toHaveLength(4);
    expect(aboutParagraphs).toHaveLength(2);
    expect(stack).toHaveLength(5);
    expect(timeline).toHaveLength(5);
    expect(projects).toHaveLength(3);
    expect(beyond).toHaveLength(3);
    expect(tickerWords).toHaveLength(4);
  });
  it("has the Confucius motto", () => {
    expect(motto.quote).toContain("之を楽しむ者に如かず");
    expect(motto.cite).toBe("— 論語・雍也");
  });
});
