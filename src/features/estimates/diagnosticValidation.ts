import type {
  BlueprintCustomField,
  BlueprintDiagnosticQuestion,
  EstimateBlueprintConfig,
} from '@/types/estimate-blueprint-config.types';
import { isCustomFieldActive, isCustomFieldRequired, readEnabledWorkModules } from './workModules';

export type DiagnosticFieldWarning = {
  key: string;
  message: string;
};

export type DiagnosticValidationResult = {
  ok: boolean;
  fieldErrors: Record<string, string>;
  warnings: DiagnosticFieldWarning[];
};

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function parseNumber(value: unknown): number | null {
  if (isEmpty(value)) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
}

function validateCustomField(
  field: BlueprintCustomField,
  rawValue: unknown,
): string | null {
  const val = isEmpty(rawValue) ? field.defaultValue : rawValue;

  if (isEmpty(val)) return null;

  if (field.type === 'number') {
    const n = parseNumber(val);
    if (Number.isNaN(n)) return 'Trebuie să fie un număr valid';
    if (n === null) return null;
    if (field.validation?.min !== undefined && n < field.validation.min) {
      return `Minim ${field.validation.min}`;
    }
    if (field.validation?.max !== undefined && n > field.validation.max) {
      return `Maxim ${field.validation.max}`;
    }
  }

  if (field.type === 'select' && field.options && !field.options.includes(String(val))) {
    return 'Opțiune invalidă';
  }

  return null;
}

function validateDiagnosticQuestion(
  question: BlueprintDiagnosticQuestion,
  rawValue: unknown,
): string | null {
  if (isEmpty(rawValue)) return null;
  if (question.type === 'number') {
    const n = parseNumber(rawValue);
    if (Number.isNaN(n)) return 'Trebuie să fie un număr valid';
  }
  if (question.type === 'select' && question.options && !question.options.includes(String(rawValue))) {
    return 'Opțiune invalidă';
  }
  return null;
}

export function evaluateWarningRule(
  when: string,
  answers: Record<string, unknown>,
): boolean {
  const normalized = when.trim();

  const stringEq = normalized.match(/^(\w+)\s*===\s*'([^']+)'$/);
  if (stringEq) {
    return String(answers[stringEq[1]] ?? '') === stringEq[2];
  }

  const cmp = normalized.match(/^(\w+)\s*(>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)$/);
  if (cmp) {
    const left = Number(answers[cmp[1]]);
    const right = Number(cmp[3]);
    if (!Number.isFinite(left)) return false;
    switch (cmp[2]) {
      case '>':
        return left > right;
      case '<':
        return left < right;
      case '>=':
        return left >= right;
      case '<=':
        return left <= right;
    }
  }
  return false;
}

function collectFieldWarnings(
  field: BlueprintCustomField,
  answers: Record<string, unknown>,
): DiagnosticFieldWarning[] {
  const out: DiagnosticFieldWarning[] = [];
  for (const rule of field.warningRules ?? []) {
    if (evaluateWarningRule(rule.when, answers)) {
      out.push({ key: field.key, message: rule.message });
    }
  }
  return out;
}

export function validateDiagnostic(
  config: EstimateBlueprintConfig | null | undefined,
  answers: Record<string, unknown>,
): DiagnosticValidationResult {
  const fieldErrors: Record<string, string> = {};
  const warnings: DiagnosticFieldWarning[] = [];

  if (!config) return { ok: true, fieldErrors, warnings };

  const enabledModules = readEnabledWorkModules(answers, config);

  for (const field of config.customFields ?? []) {
    if (!isCustomFieldActive(field, config, enabledModules)) continue;

    const rawValue = answers[field.key];
    const val = isEmpty(rawValue) ? field.defaultValue : rawValue;

    if (isCustomFieldRequired(field, config, enabledModules) && isEmpty(val)) {
      fieldErrors[field.key] = `${field.label} este obligatoriu`;
      continue;
    }

    const err = validateCustomField(field, rawValue);
    if (err) {
      fieldErrors[field.key] = err;
      continue;
    }

    warnings.push(...collectFieldWarnings(field, { ...answers, [field.key]: val }));
  }

  for (const question of config.diagnosticQuestions ?? []) {
    const err = validateDiagnosticQuestion(question, answers[question.key]);
    if (err) fieldErrors[question.key] = err;
  }

  return {
    ok: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    warnings,
  };
}

export function parseNumberInputValue(raw: string): number | undefined {
  if (raw === '' || raw === '-' || raw === '.') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}
