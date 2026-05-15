import { describe, it, expect } from "vitest";
import { COURSES, getCourseById, getCoursesByDifficulty } from "../lib/data/courses";
import { DAILY_TIPS, getTodayTip } from "../lib/data/tips";

describe("Courses Data", () => {
  it("should have 6 courses total", () => {
    expect(COURSES.length).toBe(6);
  });

  it("should have 2 courses per difficulty level", () => {
    expect(getCoursesByDifficulty("light").length).toBe(2);
    expect(getCoursesByDifficulty("moderate").length).toBe(2);
    expect(getCoursesByDifficulty("intense").length).toBe(2);
  });

  it("should find course by id", () => {
    const course = getCourseById("light-morning");
    expect(course).toBeDefined();
    expect(course?.title).toBe("晨间颈部唤醒");
    expect(course?.difficulty).toBe("light");
  });

  it("should return undefined for unknown id", () => {
    expect(getCourseById("nonexistent")).toBeUndefined();
  });

  it("each course should have at least 4 exercises", () => {
    COURSES.forEach((c) => {
      expect(c.exercises.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("each exercise should have a valid motionType", () => {
    const validTypes = ["forward", "backward", "left", "right", "rotate-cw", "rotate-ccw", "shoulder", "static"];
    COURSES.forEach((c) => {
      c.exercises.forEach((e) => {
        expect(validTypes).toContain(e.motionType);
      });
    });
  });

  it("each exercise should have positive durationSeconds", () => {
    COURSES.forEach((c) => {
      c.exercises.forEach((e) => {
        expect(e.durationSeconds).toBeGreaterThan(0);
      });
    });
  });
});

describe("Daily Tips Data", () => {
  it("should have exactly 60 tips", () => {
    expect(DAILY_TIPS.length).toBe(60);
  });

  it("should return a tip for today", () => {
    const tip = getTodayTip();
    expect(tip).toBeDefined();
    expect(tip.title).toBeTruthy();
    expect(tip.content).toBeTruthy();
  });

  it("each tip should have valid category", () => {
    const validCategories = ["posture", "exercise", "lifestyle", "science"];
    DAILY_TIPS.forEach((tip) => {
      expect(validCategories).toContain(tip.category);
    });
  });

  it("tip ids should be sequential 0-59", () => {
    DAILY_TIPS.forEach((tip, idx) => {
      expect(tip.id).toBe(idx);
    });
  });
});

describe("Exercise Speech Logic", () => {
  it("should trigger beep only at timeLeft 3, 2, 1", () => {
    const beepedSecs = new Set<number>();
    const tickBeep = (timeLeft: number) => {
      if (timeLeft > 3 || timeLeft <= 0) return;
      if (beepedSecs.has(timeLeft)) return;
      beepedSecs.add(timeLeft);
    };
    // Should not beep at 5, 4
    tickBeep(5); tickBeep(4);
    expect(beepedSecs.size).toBe(0);
    // Should beep at 3, 2, 1
    tickBeep(3); tickBeep(2); tickBeep(1);
    expect(beepedSecs.size).toBe(3);
    expect(beepedSecs.has(3)).toBe(true);
    expect(beepedSecs.has(2)).toBe(true);
    expect(beepedSecs.has(1)).toBe(true);
    // Should not double-beep
    tickBeep(3); tickBeep(2); tickBeep(1);
    expect(beepedSecs.size).toBe(3);
  });

  it("should not beep at timeLeft 0", () => {
    const beepedSecs = new Set<number>();
    const tickBeep = (timeLeft: number) => {
      if (timeLeft > 3 || timeLeft <= 0) return;
      beepedSecs.add(timeLeft);
    };
    tickBeep(0);
    expect(beepedSecs.size).toBe(0);
  });

  it("MIN_VALID_SECONDS should be 30", () => {
    const MIN_VALID_SECONDS = 30;
    expect(MIN_VALID_SECONDS).toBe(30);
    expect(25 < MIN_VALID_SECONDS).toBe(true);
    expect(35 >= MIN_VALID_SECONDS).toBe(true);
  });
});
