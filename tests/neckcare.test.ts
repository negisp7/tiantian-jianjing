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
  it("should have exactly 30 tips", () => {
    expect(DAILY_TIPS.length).toBe(30);
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

  it("tip ids should be sequential 0-29", () => {
    DAILY_TIPS.forEach((tip, idx) => {
      expect(tip.id).toBe(idx);
    });
  });
});
