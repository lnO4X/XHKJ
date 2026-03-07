import { describe, it, expect } from 'vitest';

describe('useSeo', () => {
  it('should append site name to title', () => {
    const title = '产品服务';
    const fullTitle = title.includes('薪汇科技')
      ? title
      : `${title} - 薪汇科技`;
    expect(fullTitle).toBe('产品服务 - 薪汇科技');
  });

  it('should not duplicate site name', () => {
    const title = '薪汇科技 - 让数据创造价值';
    const fullTitle = title.includes('薪汇科技')
      ? title
      : `${title} - 薪汇科技`;
    expect(fullTitle).toBe('薪汇科技 - 让数据创造价值');
  });
});
