import { apiRequest } from '@/lib/api';
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
  return {
    id: String(task.id),
    timeRange: `${hhmm(task.start_time)} - ${hhmm(task.end_time)}`,
    title: task.title,
    subtitle: task.description || 'Study session',
    status,
    type: status === 'completed' ? 'completed' : status === 'active' ? 'active' : 'default',
    dayIndex: (start.getDay() + 6) % 7, // Mon=0 .. Sun=6
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
