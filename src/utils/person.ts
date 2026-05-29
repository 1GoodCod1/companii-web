import { SYSTEM_ACTOR_LABEL } from '@/constants/person.constants';
import type { PersonNameInput } from '@/types/person';

export function joinPersonName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

export function formatPersonName(
  person?: PersonNameInput | null,
  fallback = '',
): string {
  if (!person) return fallback;

  const fullName = person.fullName?.trim();
  if (fullName) return fullName;

  const joined = joinPersonName(person.firstName, person.lastName);
  if (joined) return joined;

  const email = person.email?.trim();
  if (email) return email;

  return fallback;
}

export function formatAuditActorName(user?: PersonNameInput | null): string {
  return formatPersonName(user, SYSTEM_ACTOR_LABEL);
}

export function formatPersonNameOrDash(person?: PersonNameInput | null): string {
  const name = formatPersonName(person);
  return name || '—';
}

export function personInitials(name: string, emailFallback = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return emailFallback.slice(0, 2).toUpperCase();
}
