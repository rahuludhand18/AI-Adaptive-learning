import { apiRequest, getCookie } from '@/lib/api';
import { TimeBlock } from '@/services/focusApi';

// Backend Task shape (planner app)
export interface Task {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  deadline: string;
  priority: number;
  status: 'ACTIVE' | 'UPDATED' | 'ARCHIVED' | 'COMPLETED';
}

// ---- date/time helpers (bridge the week-grid UI and real datetimes) ----

// Monday 00:00 of the current week, used as the anchor for dayIndex.
function mondayOfThisWeek(): Date {
  const now = new Date();
  const diff = (now.getDay() + 6) % 7; // days since Monday (JS getDay: Sun=0)
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Apply a time string ("08:00" or "03:00 PM") onto a base date.
function applyTime(base: Date, t: string): Date {
  const d = new Date(base);
  const m = t.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return d;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && hh < 12) hh += 12;
  if (ap === 'AM' && hh === 12) hh = 0;
  d.setHours(hh, mm, 0, 0);
  return d;
}

// "HH:MM" (24h) formatter for the UI timeRange.
function hhmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---- mapping ----

// Backend Task -> UI TimeBlock.
export function taskToTimeBlock(task: Task): TimeBlock {
  const start = new Date(task.start_time);
  const now = new Date();
  const isActive = task.status !== 'COMPLETED' && start <= now && new Date(task.end_time) >= now;
  const status: TimeBlock['status'] =
    task.status === 'COMPLETED' ? 'completed' : isActive ? 'active' : 'upcoming';
  // local YYYY-MM-DD for the block's calendar date (not UTC, so it matches the displayed day)
  const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  return {
    id: String(task.id),
    timeRange: `${hhmm(task.start_time)} - ${hhmm(task.end_time)}`,
    title: task.title,
    subtitle: task.description || 'Study session',
    status,
    type: status === 'completed' ? 'completed' : status === 'active' ? 'active' : 'default',
    dayIndex: (start.getDay() + 6) % 7, // Mon=0 .. Sun=6
    dateKey,
  };
}

// UI block (from the "Add block" modal) -> backend create payload.
// deadline/priority are defaulted since the modal does not capture them.
export function timeBlockToTaskPayload(block: Omit<TimeBlock, 'id'>) {
  const base = new Date(mondayOfThisWeek());
  base.setDate(base.getDate() + (block.dayIndex ?? 0));
  const [startStr, endStr] = block.timeRange.split('-');
  const start = applyTime(base, startStr || '09:00');
  const end = applyTime(base, endStr || '10:00');
  const deadline = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000); // default: a week out
  return {
    title: block.title,
    description: block.subtitle,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    deadline: deadline.toISOString(),
    priority: 2, // default: medium
  };
}

// ---- API calls ----

export async function listTasks(): Promise<Task[]> {
  return apiRequest<Task[]>('/api/planner/tasks/');
}

export async function createTask(payload: ReturnType<typeof timeBlockToTaskPayload>): Promise<Task> {
  return apiRequest<Task>('/api/planner/tasks/', { method: 'POST', body: JSON.stringify(payload) });
}

// Upload a .txt or .pdf syllabus; the server extracts subject names + their topics.
export async function parseSyllabusFile(file: File): Promise<{ name: string; topics?: string[] }[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = typeof window !== 'undefined' ? getCookie('accessToken') || localStorage.getItem('accessToken') : null;
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${base}/api/planner/syllabus-upload/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form, // let the browser set the multipart boundary
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Could not read the file.');
  }
  const data = await res.json();
  return data.subjects || [];
}

// Generate a whole timetable from subjects + a finish-by date + hours/day.
export async function generateSchedule(
  subjects: { name: string; difficulty: number; topics?: string[] }[],
  dailyHours: number,
  finishBy: string, // 'YYYY-MM-DD'
): Promise<Task[]> {
  return apiRequest<Task[]>('/api/planner/generate/', {
    method: 'POST',
    body: JSON.stringify({ subjects, daily_hours: dailyHours, finish_by: finishBy }),
  });
}

// Patch a task: mark done/pending (status), reschedule (start_time/end_time), or edit (title/description/priority).
export async function updateTask(
  id: number,
  patch: Partial<Pick<Task, 'status' | 'start_time' | 'end_time' | 'title' | 'description' | 'priority'>>,
): Promise<Task> {
  return apiRequest<Task>(`/api/planner/tasks/${id}/`, { method: 'PATCH', body: JSON.stringify(patch) });
}

// Soft-delete (archive) a task so it drops off the timetable.
export async function deleteTask(id: number): Promise<void> {
  await apiRequest(`/api/planner/tasks/${id}/`, { method: 'DELETE' });
}

// Delete the whole syllabus plan: archives every active task so the timetable is emptied.
export async function clearSchedule(): Promise<{ detail: string; cleared: number }> {
  return apiRequest('/api/planner/clear/', { method: 'POST' });
}

// Ask the data-driven assistant. tab 'planner' answers from the schedule; 'syllabus' from subjects/topics.
export async function askPlannerAssistant(message: string, tab: 'planner' | 'syllabus' = 'planner'): Promise<string> {
  const res = await apiRequest<{ reply: string }>('/api/planner/assistant/', {
    method: 'POST',
    body: JSON.stringify({ message, tab }),
  });
  return res.reply;
}

// Spread overdue (incomplete, past) blocks into upcoming free slots, respecting deadlines.
export async function carryOverOverdue(): Promise<{ detail: string; moved: number }> {
  return apiRequest('/api/planner/carryover/', { method: 'POST' });
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

export async function rebuildSchedule(): Promise<{ detail: string; rebuilt_tasks?: RebuiltTask[] }> {
  return apiRequest('/api/planner/rebuild/', { method: 'POST' });
}

// Send the proposed plan back explicitly so acceptance does not depend on a server session.
export async function acceptRebuild(
  plan: { task_id: number; proposed_start: string; proposed_end: string }[]
): Promise<{ detail: string }> {
  return apiRequest('/api/planner/rebuild/accept/', { method: 'POST', body: JSON.stringify({ plan }) });
}
