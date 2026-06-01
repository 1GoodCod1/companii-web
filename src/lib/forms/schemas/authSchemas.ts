import { z, type RefinementCtx } from 'zod';
import type { TFunction } from 'i18next';

export type LoginFormValues = {
  login: string;
  password: string;
  rememberMe: boolean;
};

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type RegisterSchemaContext = {
  isPortalInviteFlow: boolean;
  isTeamInviteFlow: boolean;
  needsInviteEmail: boolean;
  requireEndClientPhone: boolean;
};

function requiredString(t: TFunction, messageKey = 'validation.required') {
  return z.string().trim().min(1, t(messageKey));
}

export function createLoginSchema(t: TFunction) {
  return z.object({
    login: requiredString(t),
    password: requiredString(t),
    rememberMe: z.boolean(),
  }) satisfies z.ZodType<LoginFormValues>;
}

export function createForgotPasswordSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('validation.required'))
      .refine((value) => z.email().safeParse(value).success, t('validation.email')),
  }) satisfies z.ZodType<ForgotPasswordFormValues>;
}

export function createResetPasswordSchema(t: TFunction) {
  return z
    .object({
      password: z.string().min(8, t('auth.resetPasswordPage.passwordMinLength')),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.resetPasswordPage.passwordMismatch'),
      path: ['confirmPassword'],
    }) satisfies z.ZodType<ResetPasswordFormValues>;
}

function requireField(
  ctx: RefinementCtx,
  value: string,
  path: keyof RegisterFormValues,
  message: string,
) {
  if (!value.trim()) {
    ctx.addIssue({
      code: 'custom',
      message,
      path: [path],
    });
  }
}

export function createRegisterSchema(t: TFunction, context: RegisterSchemaContext) {
  return z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string(),
      password: requiredString(t),
      acceptTerms: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (!data.acceptTerms) {
        ctx.addIssue({
          code: 'custom',
          message: t('auth.termsRequired'),
          path: ['acceptTerms'],
        });
      }

      if (!context.isPortalInviteFlow && !context.isTeamInviteFlow) {
        requireField(ctx, data.firstName, 'firstName', t('validation.required'));
        requireField(ctx, data.lastName, 'lastName', t('validation.required'));
        requireField(ctx, data.email, 'email', t('validation.required'));

        if (data.email.trim() && !z.email().safeParse(data.email.trim()).success) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.email'),
            path: ['email'],
          });
        }
      }

      if (context.isPortalInviteFlow && context.needsInviteEmail) {
        requireField(ctx, data.email, 'email', t('auth.inviteEmailRequired'));

        if (data.email.trim() && !z.email().safeParse(data.email.trim()).success) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.email'),
            path: ['email'],
          });
        }
      }

      if (context.requireEndClientPhone) {
        requireField(ctx, data.phone, 'phone', t('auth.phoneRequired'));
      }
    }) satisfies z.ZodType<RegisterFormValues>;
}
