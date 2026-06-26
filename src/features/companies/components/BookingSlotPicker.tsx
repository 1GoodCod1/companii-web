import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useCompanyBookingSlotsQuery } from '@/features/companies/api/useCompaniesPublic';
import {
  durationFormToMinutes,
  minutesToDurationForm,
} from '@/entities/fsm/model/serviceDuration';
import {
  DURATION_UNIT_OPTIONS,
  type DurationUnit,
} from '@/entities/fsm/model/services.constants';

interface BookingSlotPickerProps {
  slug: string;
  value: string | null;
  onChange: (slotStart: string | null) => void;
  /** Service's default duration (minutes) used to seed the duration selector. */
  defaultDurationMinutes?: number | null;
  /** Reports the chosen approximate duration (or null when cleared). */
  onDurationChange?: (durationMinutes: number | null) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function BookingSlotPicker({
  slug,
  value,
  onChange,
  defaultDurationMinutes,
  onDurationChange,
}: BookingSlotPickerProps) {
  const { t, i18n } = useTranslation();
  const [windowStart, setWindowStart] = useState(todayIso);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  // Duration is optional and expressed as value + unit (minutes / hours / days).
  const initial = useMemo(() => minutesToDurationForm(defaultDurationMinutes), [defaultDurationMinutes]);
  const [durationValue, setDurationValue] = useState(initial.value);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(initial.unit);

  const durationMinutes = durationFormToMinutes(durationValue, durationUnit);

  const { data, isLoading, isError } = useCompanyBookingSlotsQuery(
    slug,
    windowStart,
    durationMinutes ?? undefined,
  );

  // Report the resolved duration (or null when cleared) so the request carries it.
  useEffect(() => {
    onDurationChange?.(durationMinutes);
  }, [durationMinutes, onDurationChange]);

  const durationUnitOptions = useMemo(
    () =>
      DURATION_UNIT_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`companyDetail.booking.durationUnits.${opt.value}`),
      })),
    [t],
  );

  const handleDurationChange = (value: string, unit: DurationUnit) => {
    setDurationValue(value);
    setDurationUnit(unit);
    onChange(null); // the previously selected slot may no longer fit
  };

  const timeFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'ru' ? 'ru-RU' : 'ro-RO', {
        timeZone: data?.timezone ?? 'Europe/Chisinau',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [i18n.language, data?.timezone],
  );
  const dayFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === 'ru' ? 'ru-RU' : 'ro-RO', {
        timeZone: data?.timezone ?? 'Europe/Chisinau',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
    [i18n.language, data?.timezone],
  );

  if (isError) return null;
  if (!isLoading && data && !data.enabled) return null;

  const days = data?.days ?? [];
  const selectedDay =
    days.find((day) => day.date === activeDate && day.slots.length > 0) ??
    days.find((day) => day.slots.length > 0) ??
    null;
  const canGoBack = windowStart > todayIso();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          {t('companyDetail.booking.title')}
        </p>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] font-semibold text-violet-600 hover:underline cursor-pointer"
          >
            {t('companyDetail.booking.clear')}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
      ) : (
        <>
          <div>
            <label
              htmlFor="booking-duration"
              className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500"
            >
              {t('companyDetail.booking.durationLabel')}
              <span className="ml-1 font-medium normal-case text-slate-400">
                {t('companyDetail.booking.durationOptional')}
              </span>
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                id="booking-duration"
                type="number"
                min={1}
                step={1}
                value={durationValue}
                onChange={(e) => handleDurationChange(e.target.value, durationUnit)}
                placeholder={t('companyDetail.booking.durationPlaceholder')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-700"
              />
              <select
                value={durationUnit}
                onChange={(e) => handleDurationChange(durationValue, e.target.value as DurationUnit)}
                aria-label={t('companyDetail.booking.durationLabel')}
                className="cursor-pointer rounded-lg border border-gray-200 px-2 py-2 text-sm text-slate-700"
              >
                {durationUnitOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={t('companyDetail.booking.prevWeek')}
              onClick={() => setWindowStart((prev) => shiftDate(prev, -7))}
              disabled={!canGoBack}
              className="shrink-0 flex size-7 items-center justify-center border border-gray-200 text-slate-500 hover:border-violet-300 disabled:opacity-30 disabled:cursor-default cursor-pointer"
            >
              <CaretLeftIcon className="size-3.5" />
            </button>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const hasSlots = day.slots.length > 0;
                const isActive = selectedDay?.date === day.date;
                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={!hasSlots}
                    onClick={() => setActiveDate(day.date)}
                    className={`px-1 py-1.5 text-[10px] font-bold leading-tight border transition-colors ${
                      isActive
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : hasSlots
                          ? 'border-gray-200 text-slate-600 hover:border-violet-300 cursor-pointer'
                          : 'border-gray-100 text-slate-300'
                    }`}
                  >
                    {dayFormat.format(new Date(`${day.date}T12:00:00Z`))}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label={t('companyDetail.booking.nextWeek')}
              onClick={() => setWindowStart((prev) => shiftDate(prev, 7))}
              className="shrink-0 flex size-7 items-center justify-center border border-gray-200 text-slate-500 hover:border-violet-300 cursor-pointer"
            >
              <CaretRightIcon className="size-3.5" />
            </button>
          </div>

          {selectedDay ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedDay.slots.map((slot) => {
                const isSelected = value === slot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => onChange(isSelected ? null : slot.start)}
                    className={`px-3 py-1.5 text-xs font-bold tabular-nums border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : 'border-gray-200 text-slate-700 hover:border-violet-400'
                    }`}
                  >
                    {timeFormat.format(new Date(slot.start))}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">{t('companyDetail.booking.noSlots')}</p>
          )}

          <p className="text-[10px] text-slate-400 leading-relaxed">
            {value
              ? t('companyDetail.booking.selectedHint')
              : t('companyDetail.booking.optionalHint')}
          </p>
        </>
      )}
    </div>
  );
}
