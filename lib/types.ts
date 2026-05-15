// ─── Exercise & Course Types ──────────────────────────────────────────────────

export type DifficultyLevel = 'light' | 'moderate' | 'intense';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  /** Direction hint for the motion indicator */
  motionType: 'forward' | 'backward' | 'left' | 'right' | 'rotate-cw' | 'rotate-ccw' | 'shoulder' | 'static';
  reps?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  exercises: Exercise[];
  tags: string[];
}

// ─── Workout Record Types ─────────────────────────────────────────────────────

export interface MotionData {
  /** Pitch range in degrees (forward/backward) */
  pitchRange: number;
  /** Yaw range in degrees (left/right rotation) */
  yawRange: number;
  /** Roll range in degrees (lateral tilt) */
  rollRange: number;
  /** Maximum angle reached in any direction */
  maxAngle: number;
}

export interface WorkoutRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  difficulty: DifficultyLevel;
  startTime: string;   // ISO 8601
  endTime: string;     // ISO 8601
  durationSeconds: number;
  completedExercises: number;
  totalExercises: number;
  motionData?: MotionData;
  /** Whether AirPods sensor was used */
  usedAirPods: boolean;
}

// ─── Daily Tip Type ───────────────────────────────────────────────────────────

export interface DailyTip {
  id: number;
  category: 'posture' | 'exercise' | 'lifestyle' | 'science';
  title: string;
  content: string;
  icon: string;
}
