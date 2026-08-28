export interface Subject {
  id: string;
  name: string;
  priority: number;
  deadline: string;
  icon: string;
  topics?: string[]; // per-subject topics extracted from the syllabus (divided across blocks)
}

export interface TimeBlock {
  id: string;
  timeRange: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'active' | 'upcoming';
  type: 'default' | 'active' | 'completed' | 'special' | 'empty' | 'warm';
  dayIndex: number; // 0=Mon, 6=Sun
  dateKey?: string; // actual calendar date 'YYYY-MM-DD' (distinguishes the same weekday across weeks)
  subjectId?: string;
  moduleTitle?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
}

export interface WeeklyTrendPoint {
  day: string;
  score: number;
}

export interface SubjectCompletion {
  subject: string;
  percentage: number;
  color: string;
}

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', priority: 5, deadline: '2026-12-15', icon: 'Sigma' },
  { id: 'sub-2', name: 'Cognitive Psychology', priority: 4, deadline: '2026-12-20', icon: 'BookOpen' },
  { id: 'sub-3', name: 'Data Science', priority: 3, deadline: '2027-01-10', icon: 'Microscope' },
  { id: 'sub-4', name: 'Behavioral Economics', priority: 5, deadline: '2027-01-25', icon: 'BookOpen' },
];

export const INITIAL_TIMETABLE: TimeBlock[] = [
  // MON 12
  { id: 'block-1', timeRange: '08:00 - 09:30', title: 'Data Structures', subtitle: 'Linked Lists & Hash Maps', status: 'completed', type: 'completed', dayIndex: 0 },
  { id: 'block-2', timeRange: '10:00 - 11:00', title: 'Break', subtitle: 'Light Reading / Coffee', status: 'completed', type: 'completed', dayIndex: 0 },
  { id: 'block-3', timeRange: '11:30 - 13:00', title: 'System Design', subtitle: 'Scalability Patterns', status: 'active', type: 'active', dayIndex: 0 },
  { id: 'block-4', timeRange: '14:00 - 15:30', title: 'Project Alpha', subtitle: 'Architecture Review', status: 'upcoming', type: 'special', dayIndex: 0 },

  // TUE 13
  { id: 'block-5', timeRange: '09:00 - 11:00', title: 'Microservices', subtitle: 'gRPC Integration', status: 'upcoming', type: 'default', dayIndex: 1 },
  { id: 'block-6', timeRange: '11:30 - 12:30', title: 'Yoga Flow', subtitle: 'Active Recovery', status: 'upcoming', type: 'warm', dayIndex: 1 },
  { id: 'block-7', timeRange: '14:00 - 16:00', title: 'Cloud Security', subtitle: 'IAM Policies', status: 'upcoming', type: 'default', dayIndex: 1 },

  // WED 14
  { id: 'block-8', timeRange: '08:30 - 10:30', title: 'Full Stack Dev', subtitle: 'Component Lifecycle', status: 'upcoming', type: 'default', dayIndex: 2 },
  { id: 'block-9', timeRange: '11:00 - 13:00', title: 'Deep Work', subtitle: 'Algorithm Practice', status: 'upcoming', type: 'default', dayIndex: 2 },

  // THU 15
  { id: 'block-10', timeRange: '09:00 - 10:30', title: 'API Design', subtitle: 'REST vs GraphQL', status: 'upcoming', type: 'default', dayIndex: 3 },
  { id: 'block-11', timeRange: '14:00 - 15:30', title: 'Database', subtitle: 'Query Optimization', status: 'upcoming', type: 'default', dayIndex: 3 },

  // FRI 16
  { id: 'block-12', timeRange: '10:00 - 12:00', title: 'Weekly Review', subtitle: 'Progress Tracking', status: 'upcoming', type: 'default', dayIndex: 4 },
  { id: 'block-13', timeRange: '13:00 - 15:00', title: 'Mentorship', subtitle: 'Code Reviews', status: 'upcoming', type: 'special', dayIndex: 4 },
];

export const INITIAL_TASKS: DailyTask[] = [
  { id: 'task-1', title: 'Email Triage', subtitle: 'Cleared priority inbox (30 mins)', completed: true },
  { id: 'task-2', title: 'Architecture Docs', subtitle: 'Finalized cloud infrastructure diagram', completed: true },
  { id: 'task-3', title: 'Team Sync', subtitle: 'Discussion on Q3 deliverables', completed: false },
  { id: 'task-4', title: 'Focus Session: Deep Work', subtitle: '90 minutes achieved', completed: true },
  { id: 'task-5', title: 'Review Pull Requests', subtitle: '3 pending reviews', completed: false },
];

export const WEEKLY_TREND: WeeklyTrendPoint[] = [
  { day: 'MON', score: 78 },
  { day: 'TUE', score: 82 },
  { day: 'WED', score: 94 },
  { day: 'THU', score: 86 },
  { day: 'FRI', score: 88 },
  { day: 'SAT', score: 75 },
  { day: 'SUN', score: 85 },
];

export const SUBJECT_COMPLETIONS: SubjectCompletion[] = [
  { subject: 'Mathematics', percentage: 82, color: '#4F46E5' },
  { subject: 'Cognitive Psychology', percentage: 64, color: '#3730A3' },
  { subject: 'Data Science', percentage: 41, color: '#4F46E5' },
  { subject: 'Behavioral Economics', percentage: 92, color: '#3730A3' },
];

class FocusApiService {
  private async delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateTimetable(subjects: Subject[], hoursPerDay: number): Promise<TimeBlock[]> {
    await this.delay(400);
    return INITIAL_TIMETABLE;
  }

  async applyOptimization(suggestionId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(300);
    return {
      success: true,
      message: 'Schedule optimized! Advanced Mathematics moved to 10:00 AM peak window.',
    };
  }

  async saveReflection(reflectionText: string, completedTaskIds: string[]): Promise<{ success: boolean; requiresRebuild: boolean }> {
    await this.delay(400);
    const incompleteCount = INITIAL_TASKS.length - completedTaskIds.length;
    return {
      success: true,
      requiresRebuild: incompleteCount > 0,
    };
  }

  async endSession(blockId: string): Promise<{ success: boolean; focusScore: number }> {
    await this.delay(300);
    return {
      success: true,
      focusScore: 94,
    };
  }

  async rebuildPlan(): Promise<{ success: boolean; rescheduledBlocks: TimeBlock[] }> {
    await this.delay(500);
    return {
      success: true,
      rescheduledBlocks: INITIAL_TIMETABLE,
    };
  }
}

export const focusApi = new FocusApiService();
