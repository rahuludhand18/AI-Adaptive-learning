import { apiRequest, getCookie } from '@/lib/api';
import { TimeBlock } from '@/services/focusApi';

export interface Topic {
  id: number;
  name: string;
  estimated_hours: number;
  is_completed: boolean;
  order_index: number;
}

export interface Module {
  id: number;
  title: string;
  order_index: number;
  topics: Topic[];
}

export interface Subject {
  id: number;
  name: string;
  color_code: string;
  target_exam_date: string | null;
  created_at: string;
  modules: Module[];
}

export interface StudySession {
  id: number;
  topic: number; // topic ID
  topic_name: string;
  module_title: string;
  subject_name: string;
  subject_color: string;
  date: string;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  tab_switch_count: number;
  focus_score: number;
}

// "HH:MM AM/PM" (12h) formatter for the UI timeRange.
function hhmm(timeStr: string): string {
  // timeStr is usually HH:MM:SS
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  const hStr = String(h).padStart(2, '0');
  return `${hStr}:${m} ${ampm}`;
}

// Backend StudySession -> UI TimeBlock.
export function sessionToTimeBlock(session: StudySession): TimeBlock {
  const startDt = new Date(`${session.date}T${session.start_time}`);
  const endDt = new Date(`${session.date}T${session.end_time}`);
  const now = new Date();
  
  const isActive = !session.is_completed && startDt <= now && endDt >= now;
  const status: TimeBlock['status'] =
    session.is_completed ? 'completed' : isActive ? 'active' : 'upcoming';
    
  return {
    id: String(session.id),
    timeRange: `${hhmm(session.start_time)} - ${hhmm(session.end_time)}`,
    title: session.subject_name,
    subtitle: session.topic_name,
    moduleTitle: session.module_title,
    status,
    type: status === 'completed' ? 'completed' : status === 'active' ? 'active' : 'default',
    dayIndex: (startDt.getDay() + 6) % 7, // Mon=0 .. Sun=6
    dateKey: session.date,
  };
}

// ---- API calls ----

export async function listSubjects(): Promise<Subject[]> {
  return apiRequest<Subject[]>('/api/planner/subjects/');
}

export async function listSessions(): Promise<StudySession[]> {
  return apiRequest<StudySession[]>('/api/planner/sessions/');
}

export async function updateSession(id: number, payload: Partial<StudySession>): Promise<StudySession> {
  return apiRequest<StudySession>(`/api/planner/sessions/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function uploadSyllabus(file: File, subjectName: string, difficulty: string = 'Medium'): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  if (subjectName) {
    form.append('subject_name', subjectName);
  }
  form.append('difficulty', difficulty);
  return apiRequest<any>('/api/planner/syllabus-upload/', {
    method: 'POST',
    body: form,
  });
}

export async function generateSchedule(payload: any): Promise<any> {
  return apiRequest<any>('/api/planner/generate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function clearSchedule(): Promise<{ cleared: number }> {
  return apiRequest<{ cleared: number }>('/api/planner/clear/', { method: 'POST' });
}

export async function deleteSubject(subjectId: number): Promise<void> {
  return apiRequest<void>(`/api/planner/subjects/${subjectId}/`, {
    method: 'DELETE',
  });
}
// =========================================================================
// FALLBACK STUBS TO PREVENT NEXT.JS BUILD CRASHES DURING MIGRATION
// =========================================================================

export interface Task {
  id: string | number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  deadline: string;
  priority: number;
  status: 'ACTIVE' | 'UPDATED' | 'ARCHIVED' | 'COMPLETED';
}

export interface RebuiltTask {
  task_id: number;
  title: string;
  original_start: string;
  original_end: string;
  proposed_start: string;
  proposed_end: string;
  deadline: string;
  achievable: boolean;
}

export function taskToTimeBlock(task: any): any { return {} as any; }
export function timeBlockToTaskPayload(block: any): any { return {} as any; }

export async function listTasks(): Promise<any[]> { return []; }
export async function createSession(payload: Partial<StudySession>): Promise<StudySession> {
  return apiRequest<StudySession>('/api/planner/sessions/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteSession(id: number): Promise<void> {
  return apiRequest<void>(`/api/planner/sessions/${id}/`, { method: 'DELETE' });
}

export const updateTask = async (taskId: string | number, updates: any) => {
  return apiRequest(`/api/planner/tasks/${taskId}/`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const carryOverOverdue = async (childId?: string) => {
  // Append child_id if managing a specific kid, otherwise hit the adult/default endpoint
  const url = childId 
      ? `/api/planner/sessions/carry_over/?child_id=${childId}` 
      : `/api/planner/sessions/carry_over/`;

  return apiRequest(url, {
      method: 'POST',
  });
};

export const carryOverSession = async (sessionId: string | number) => {
    return apiRequest(`/api/planner/sessions/${sessionId}/carry_over/`, {
        method: 'POST',
    });
};
export async function rebuildSchedule(): Promise<any> { return {} as any; }
export async function acceptRebuild(d: any): Promise<any> { return {} as any; }
export async function askPlannerAssistant(query: string, mode: string, history: any[]): Promise<{ reply: string, action?: string, error?: boolean }> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? getCookie('accessToken') || localStorage.getItem('accessToken') : null;
  
  const res = await fetch(`${base}/api/planner/assistant/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, mode, chat_history: history })
  });
  
  if (!res.ok) {
    let msg = 'Failed to reach assistant';
    try {
      const errData = await res.json();
      if (errData.reply) return errData;
      if (errData.error === 'rate_limit' || errData.message) msg = errData.message || msg;
      else if (errData.error) msg = String(errData.error);
    } catch (e) {}
    return { error: true, reply: msg || "The AI is currently resting. Please try again later." };
  }
  
  const data = await res.json();
  return data;
}

export async function fetchUserRoutine(): Promise<any> {
  return apiRequest<any>('/api/user/routine/');
}

export async function saveUserRoutine(routine: any): Promise<any> {
  return apiRequest<any>('/api/user/routine/', {
    method: 'POST',
    body: JSON.stringify(routine),
  });
}
