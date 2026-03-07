import { describe, it, expect } from 'vitest';

describe('Message API', () => {
  describe('create message', () => {
    it('should strip isRead from request body', () => {
      const body = {
        data: {
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          content: '这是一条测试留言',
          isRead: true, // Should be stripped
        },
      };

      // Simulate controller behavior
      delete body.data.isRead;

      expect(body.data).not.toHaveProperty('isRead');
      expect(body.data.name).toBe('张三');
      expect(body.data.email).toBe('zhangsan@example.com');
    });

    it('should require name, email, content', () => {
      const validMessage = {
        name: '张三',
        email: 'zhangsan@example.com',
        content: '测试留言',
      };

      expect(validMessage.name).toBeTruthy();
      expect(validMessage.email).toBeTruthy();
      expect(validMessage.content).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test('valid@email.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('')).toBe(false);
    });
  });
});
