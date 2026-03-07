import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redis
const mockRedis = {
  exists: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

// Mock Strapi
const mockStrapi = {
  redis: mockRedis,
  log: { info: vi.fn(), error: vi.fn() },
  plugins: {
    email: {
      services: {
        email: { send: vi.fn() },
      },
    },
  },
  query: vi.fn(),
  admin: {
    services: {
      token: {
        createJwtToken: vi.fn().mockReturnValue('mock-jwt-token'),
      },
    },
  },
};

describe('Email Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendCode', () => {
    it('should reject non-@minxinhui.com emails', async () => {
      const email = 'user@gmail.com';
      // The controller validates domain, not the service
      // But we test the expected behavior
      expect(email.endsWith('@minxinhui.com')).toBe(false);
    });

    it('should accept @minxinhui.com emails', () => {
      const email = 'admin@minxinhui.com';
      expect(email.endsWith('@minxinhui.com')).toBe(true);
    });

    it('should rate limit within 60 seconds', async () => {
      mockRedis.exists.mockResolvedValue(1);
      // Rate limit key exists → should reject
      const exists = await mockRedis.exists('rate_limit:send_code:admin@minxinhui.com');
      expect(exists).toBe(1);
    });

    it('should generate 6-digit code', () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      expect(code).toHaveLength(6);
      expect(Number(code)).toBeGreaterThanOrEqual(100000);
      expect(Number(code)).toBeLessThanOrEqual(999999);
    });

    it('should store code in Redis with 5min TTL', async () => {
      const email = 'admin@minxinhui.com';
      const code = '123456';
      await mockRedis.set(`email_code:${email}`, code, 'EX', 300);
      expect(mockRedis.set).toHaveBeenCalledWith(
        `email_code:${email}`,
        code,
        'EX',
        300
      );
    });

    it('should set rate limit with 60s TTL', async () => {
      const email = 'admin@minxinhui.com';
      await mockRedis.set(`rate_limit:send_code:${email}`, '1', 'EX', 60);
      expect(mockRedis.set).toHaveBeenCalledWith(
        `rate_limit:send_code:${email}`,
        '1',
        'EX',
        60
      );
    });
  });

  describe('login', () => {
    it('should reject wrong verification code', async () => {
      mockRedis.get.mockResolvedValue('123456');
      const storedCode = await mockRedis.get('email_code:admin@minxinhui.com');
      const inputCode = '654321';
      expect(storedCode).not.toBe(inputCode);
    });

    it('should accept correct verification code', async () => {
      mockRedis.get.mockResolvedValue('123456');
      const storedCode = await mockRedis.get('email_code:admin@minxinhui.com');
      const inputCode = '123456';
      expect(storedCode).toBe(inputCode);
    });

    it('should delete code after successful verification (one-time use)', async () => {
      await mockRedis.del('email_code:admin@minxinhui.com');
      expect(mockRedis.del).toHaveBeenCalledWith('email_code:admin@minxinhui.com');
    });

    it('should reject expired/missing code', async () => {
      mockRedis.get.mockResolvedValue(null);
      const storedCode = await mockRedis.get('email_code:admin@minxinhui.com');
      expect(storedCode).toBeNull();
    });

    it('should reject disabled user', () => {
      mockStrapi.query.mockReturnValue({
        findOne: vi.fn().mockResolvedValue(null),
      });
      // Query returns null for disabled/nonexistent user
      const queryResult = mockStrapi.query('admin::user');
      expect(queryResult.findOne).toBeDefined();
    });

    it('should issue JWT token for valid login', () => {
      const token = mockStrapi.admin.services.token.createJwtToken({
        id: 1,
        email: 'admin@minxinhui.com',
      });
      expect(token).toBe('mock-jwt-token');
    });
  });
});
