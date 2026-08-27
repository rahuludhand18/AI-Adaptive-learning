import { create } from 'zustand';
import { TimeBlock, DailyTask } from '@/services/focusApi';
import { Subject } from '@/lib/plannerApi';

export interface UserRoutine {
  morning_study_start: string | null;
  morning_study_end: string | null;
  work_college_start: string | null;
  work_college_end: string | null;
  evening_study_start: string | null;
  evening_study_end: string | null;
  snack_time_start: string | null;
  snack_time_end: string | null;
  dinner_time_start: string | null;
  dinner_time_end: string | null;
  default_daily_hours: number;
}

interface FocusState {
  // Auth & User
  user: { name: string; avatarUrl: string; streak: number };
  
  // Dashboard State
  dashboardView: 'morning' | 'evening';
  setDashboardView: (view: 'morning' | 'evening') => void;
  toggleDashboardView: () => void;

  // Onboarding & Subjects
  subjects: Subject[];
  dailyHours: number;
  setSubjects: (subjects: Subject[]) => void;
  clearSubjects: () => void;
  setDailyHours: (hours: number) => void;

  // Routine
  userRoutine: UserRoutine | null;
  setUserRoutine: (routine: UserRoutine | null) => void;

  // Timetable
  timetable: TimeBlock[];
  updateBlockStatus: (id: string, status: 'completed' | 'active' | 'upcoming', type?: TimeBlock['type']) => void;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;

  // Daily Tasks Checklist
  dailyTasks: DailyTask[];
  toggleTask: (id: string) => void;
  addTask: (title: string, subtitle?: string) => void;

  // Reflection
  reflectionText: string;
  setReflectionText: (text: string) => void;

  // Session Timer
  activeSession: {
    blockId: string | null;
    isRunning: boolean;
    elapsedSeconds: number;
    totalSeconds: number;
  };
  startSession: (blockId: string, totalMinutes?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  tickSession: () => void;
}

// unique id even when called many times in the same millisecond (e.g. bulk syllabus import)
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useFocusStore = create<FocusState>((set, get) => ({
  user: {
    name: 'Alex',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    streak: 4,
  },

  dashboardView: 'morning',
  setDashboardView: (view) => set({ dashboardView: view }),
  toggleDashboardView: () => set((state) => ({ dashboardView: state.dashboardView === 'morning' ? 'evening' : 'morning' })),

  subjects: [],
  dailyHours: 6,
  setSubjects: (subjects) => set({ subjects }),
  clearSubjects: () => set({ subjects: [] }),
  setDailyHours: (hours) => set({ dailyHours: hours }),

  userRoutine: null,
  setUserRoutine: (routine) => set({ userRoutine: routine }),

  timetable: [],
  updateBlockStatus: (id, status, type) =>
    set((state) => ({
      timetable: state.timetable.map((b) =>
        b.id === id ? { ...b, status, type: type || (status === 'completed' ? 'completed' : b.type) } : b
      ),
    })),
  addTimeBlock: (newBlock) =>
    set((state) => ({
      timetable: [...state.timetable, { ...newBlock, id: uid('block') }],
    })),

  dailyTasks: [],
  toggleTask: (id) =>
    set((state) => ({
      dailyTasks: state.dailyTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
  addTask: (title, subtitle = 'User added task') =>
    set((state) => ({
      dailyTasks: [
        ...state.dailyTasks,
        { id: uid('task'), title, subtitle, completed: false },
      ],
    })),

  reflectionText: '',
  setReflectionText: (text) => set({ reflectionText: text }),

  activeSession: {
    blockId: null,
    isRunning: false,
    elapsedSeconds: 0,
    totalSeconds: 25 * 60,
  },
  startSession: (blockId, totalMinutes = 25) =>
    set({
      activeSession: {
        blockId,
        isRunning: true,
        elapsedSeconds: 0,
        totalSeconds: totalMinutes * 60,
      },
    }),
  pauseSession: () =>
    set((state) => ({
      activeSession: { ...state.activeSession, isRunning: false },
    })),
  resumeSession: () =>
    set((state) => ({
      activeSession: { ...state.activeSession, isRunning: true },
    })),
  endSession: () =>
    set((state) => {
      const blockId = state.activeSession.blockId;
      if (blockId) {
        get().updateBlockStatus(blockId, 'completed', 'completed');
      }
      return {
        activeSession: {
          blockId: null,
          isRunning: false,
          elapsedSeconds: 0,
          totalSeconds: 25 * 60,
        },
      };
    }),
  tickSession: () =>
    set((state) => {
      if (!state.activeSession.isRunning) return state;
      const nextElapsed = state.activeSession.elapsedSeconds + 1;
      if (nextElapsed >= state.activeSession.totalSeconds) {
        return {
          activeSession: {
            ...state.activeSession,
            elapsedSeconds: state.activeSession.totalSeconds,
            isRunning: false,
          },
        };
      }
      return {
        activeSession: {
          ...state.activeSession,
          elapsedSeconds: nextElapsed,
        },
      };
    }),
}));
