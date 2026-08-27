import { apiRequest } from '@/lib/api';

// Checks a tapped Morse pattern against the parent-configured one for the signed-in child.
// The correct pattern itself never reaches the client — only a pass/fail (+ whether one is set).
export async function verifyMorsePattern(pattern: string): Promise<{ correct: boolean; configured: boolean }> {
  return apiRequest('/api/kids/verify-morse/', {
    method: 'POST',
    body: JSON.stringify({ pattern }),
  });
}
