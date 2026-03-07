import { describe, it, expect } from 'vitest';

// Test the pagination logic directly
function computePages(current: number, total: number): (number | '...')[] {
  const items: (number | '...')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
  } else {
    items.push(1);
    if (current > 3) items.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      items.push(i);
    }
    if (current < total - 2) items.push('...');
    items.push(total);
  }
  return items;
}

describe('Pagination logic', () => {
  it('should show all pages when total <= 7', () => {
    expect(computePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should show ellipsis for large page count', () => {
    const pages = computePages(5, 10);
    expect(pages).toContain('...');
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
  });

  it('should show first page at start', () => {
    const pages = computePages(1, 10);
    expect(pages[0]).toBe(1);
    expect(pages).toContain(2);
  });

  it('should show last page at end', () => {
    const pages = computePages(10, 10);
    expect(pages[pages.length - 1]).toBe(10);
  });

  it('should show current page with neighbors', () => {
    const pages = computePages(5, 10);
    expect(pages).toContain(4);
    expect(pages).toContain(5);
    expect(pages).toContain(6);
  });
});
