import { describe, expect, it } from 'vitest';
import {
  createForgotPasswordSchema,
  createLoginSchema,
  createRegisterSchema,
  createResetPasswordSchema,
} from '@/lib/forms/schemas/authSchemas';
import { createCustomerSchema } from '@/lib/forms/schemas/customerSchema';

const t = (key: string) => key;

describe('authSchemas', () => {
  it('requires login credentials', () => {
    const schema = createLoginSchema(t);
    const result = schema.safeParse({ login: '', password: '', rememberMe: false });
    expect(result.success).toBe(false);
  });

  it('validates forgot password email', () => {
    const schema = createForgotPasswordSchema(t);
    expect(schema.safeParse({ email: 'not-an-email' }).success).toBe(false);
    expect(schema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('requires matching reset passwords', () => {
    const schema = createResetPasswordSchema(t);
    expect(
      schema.safeParse({ password: '12345678', confirmPassword: '87654321' }).success,
    ).toBe(false);
    expect(
      schema.safeParse({ password: '12345678', confirmPassword: '12345678' }).success,
    ).toBe(true);
  });

  it('requires end client phone on standard registration', () => {
    const schema = createRegisterSchema(t, {
      isPortalInviteFlow: false,
      isTeamInviteFlow: false,
      needsInviteEmail: false,
      requireEndClientPhone: true,
    });

    const result = schema.safeParse({
      firstName: 'Ana',
      lastName: 'Pop',
      email: 'ana@example.com',
      phone: '',
      password: 'secret123',
      acceptTerms: true,
    });

    expect(result.success).toBe(false);
  });
});

describe('customerSchema', () => {
  it('accepts empty optional email', () => {
    const schema = createCustomerSchema(t);
    expect(
      schema.safeParse({
        fullName: 'Client SRL',
        phone: '+37369123456',
        email: '',
        address: 'Chisinau',
        notes: '',
      }).success,
    ).toBe(true);
  });
});
