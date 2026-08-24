import { apiRequest } from '@/lib/api';

// ---- Parent-added learning videos (shows up in the child's Learn catalog immediately) ----

export interface MyVideo {
  id: number;
  title: string;
  youtube_id: string;
  source_channel: string;
  age_min: number;
  age_max: number;
  level_name: string;
  subject_name: string;
  topic_title: string;
  created_at: string;
}

export interface AddVideoPayload {
  youtube_url: string;
  title: string;
  level_name: string;
  subject_name: string;
  topic_title: string;
  source_channel?: string;
  age_min?: number;
  age_max?: number;
}

export async function addVideo(payload: AddVideoPayload): Promise<MyVideo> {
  return apiRequest<MyVideo>('/api/content/videos/add/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listMyVideos(): Promise<MyVideo[]> {
  return apiRequest<MyVideo[]>('/api/content/videos/mine/');
}

export async function deleteMyVideo(id: number): Promise<void> {
  await apiRequest(`/api/content/videos/mine/${id}/`, { method: 'DELETE' });
}

// ---- Child activity: when they left the app and for how long ----

export interface AwaySession {
  left_at: string;
  returned_at: string;
  away_seconds: number;
}

export interface ChildActivity {
  child_id: number;
  still_away_since: string | null;
  switches_today: number;
  switches_last_7_days: number;
  sessions: AwaySession[];
}

export async function getChildActivity(childId: number): Promise<ChildActivity> {
  return apiRequest<ChildActivity>(`/api/parents/activity/${childId}/`);
}
