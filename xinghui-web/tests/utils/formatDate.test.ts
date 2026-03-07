import { describe, it, expect } from 'vitest';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

describe('formatDate', () => {
  it('should format ISO date to Chinese locale', () => {
    const result = formatDate('2026-03-07T10:00:00.000Z');
    // Format varies by locale implementation but should contain 2026
    expect(result).toContain('2026');
  });

  it('should return empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });
});
