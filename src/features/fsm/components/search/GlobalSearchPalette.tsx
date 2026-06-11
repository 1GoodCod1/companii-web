import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import {
  useGlobalSearchQuery,
  type GlobalSearchItem,
  type SearchEntityType,
} from '@/features/fsm/api/useGlobalSearch';
import {
  interventionStatusLabel,
  leadStatusLabel,
  paymentStatusLabel,
  quoteStatusLabel,
} from '@/entities/fsm/model/i18nStatusLabels';
import { canAccessCompanyRoute } from '@/entities/company/model/roleAccess';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useModalLockAndEscape } from '@/shared/hooks/useModalLockAndEscape';

const TYPE_ROUTES: Record<SearchEntityType, string> = {
  customer: '/company/clienti',
  lead: '/company/cereri',
  intervention: '/company/lucrari',
  quote: '/company/oferte',
  invoice: '/company/facturi',
  estimate: '/company/smete',
  service: '/company/servicii',
};

const TYPE_BADGE_CLASSES: Record<SearchEntityType, string> = {
  customer: 'bg-blue-50 text-blue-700 border-blue-100',
  lead: 'bg-amber-50 text-amber-700 border-amber-100',
  intervention: 'bg-violet-50 text-violet-700 border-violet-100',
  quote: 'bg-sky-50 text-sky-700 border-sky-100',
  invoice: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  estimate: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  service: 'bg-slate-100 text-slate-600 border-slate-200',
};

const NAV_COMMANDS: { labelKey: string; to: string; access: string }[] = [
  { labelKey: 'company.clienti', to: '/company/clienti', access: '/clienti' },
  { labelKey: 'company.cereri', to: '/company/cereri', access: '/cereri' },
  { labelKey: 'company.pipeline', to: '/company/pipeline', access: '/pipeline' },
  { labelKey: 'company.lucrari', to: '/company/lucrari', access: '/lucrari' },
  { labelKey: 'company.calendar', to: '/company/calendar', access: '/calendar' },
  { labelKey: 'company.smete', to: '/company/smete', access: '/smete' },
  { labelKey: 'company.oferte', to: '/company/oferte', access: '/oferte' },
  { labelKey: 'company.facturi', to: '/company/facturi', access: '/facturi' },
  { labelKey: 'company.servicii', to: '/company/servicii', access: '/servicii' },
];

type PaletteEntry =
  | { kind: 'nav'; key: string; label: string; to: string }
  | { kind: 'result'; key: string; item: GlobalSearchItem };

function statusLabelFor(item: GlobalSearchItem): string | null {
  if (!item.status) return null;
  switch (item.type) {
    case 'lead':
      return leadStatusLabel(item.status);
    case 'intervention':
      return interventionStatusLabel(item.status);
    case 'quote':
      return quoteStatusLabel(item.status);
    case 'invoice':
      return paymentStatusLabel(item.status);
    default:
      return null;
  }
}

function resultDestination(item: GlobalSearchItem): string {
  if (item.type === 'estimate') return `${TYPE_ROUTES.estimate}/${item.id}`;
  if (item.type === 'customer') {
    return `${TYPE_ROUTES.customer}?q=${encodeURIComponent(item.title)}`;
  }
  return TYPE_ROUTES[item.type];
}

export function GlobalSearchPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const companyRole = useAuthStore((s) => s.user?.companyRole);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useModalLockAndEscape(open, close);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setInput('');
      setQuery('');
      setActiveIndex(0);
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    const id = window.setTimeout(() => setQuery(input), 250);
    return () => window.clearTimeout(id);
  }, [input]);

  const { data, isFetching } = useGlobalSearchQuery(open ? query : '');

  const navMatches = useMemo(() => {
    const needle = input.trim().toLowerCase();
    return NAV_COMMANDS.filter((cmd) => canAccessCompanyRoute(companyRole, cmd.access))
      .map((cmd) => ({ ...cmd, label: t(cmd.labelKey) }))
      .filter((cmd) => !needle || cmd.label.toLowerCase().includes(needle));
  }, [companyRole, input, t]);

  const groups = useMemo(
    () => (query.trim().length >= 2 ? data?.groups ?? [] : []),
    [data, query],
  );

  const entries = useMemo<PaletteEntry[]>(() => {
    const list: PaletteEntry[] = groups.flatMap((group) =>
      group.items.map((item) => ({
        kind: 'result' as const,
        key: `${item.type}:${item.id}`,
        item,
      })),
    );
    for (const cmd of navMatches) {
      list.push({ kind: 'nav', key: `nav:${cmd.to}`, label: cmd.label, to: cmd.to });
    }
    return list;
  }, [groups, navMatches]);

  useEffect(() => {
    setActiveIndex(0);
  }, [entries.length, query]);

  const execute = useCallback(
    (entry: PaletteEntry | undefined) => {
      if (!entry) return;
      navigate(entry.kind === 'nav' ? entry.to : resultDestination(entry.item));
      close();
    },
    [navigate, close],
  );

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (entries.length ? (prev + 1) % entries.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (entries.length ? (prev - 1 + entries.length) % entries.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      execute(entries[activeIndex]);
    }
  };

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, entries.length]);

  const typeLabel = (type: SearchEntityType) => t(`company.searchPalette.types.${type}`);
  const showMinCharsHint = input.trim().length > 0 && input.trim().length < 2;
  const showEmpty =
    query.trim().length >= 2 && !isFetching && groups.length === 0 && navMatches.length === 0;

  let flatIndex = -1;

  const overlay =
    open && typeof document !== 'undefined'
      ? createPortal(
          <dialog
            aria-label={t('company.searchPalette.placeholder')}
            className="fixed inset-0 z-[200] m-0 flex size-full max-h-none max-w-none items-start justify-center border-0 bg-transparent p-4 pt-[10vh] sm:p-8 sm:pt-[12vh]"
          >
            <button
              type="button"
              aria-label={t('cabinet.common.closeAria')}
              className="absolute inset-0 cursor-default border-0 bg-black/40 p-0"
              onClick={close}
            />

            <div className="relative z-10 flex max-h-[min(78vh,780px)] w-full max-w-3xl flex-col overflow-hidden rounded-none border border-gray-200 bg-white shadow-xl animate-modal-in">
              <div className="flex shrink-0 items-center gap-4 border-b border-gray-100 px-6 py-6 sm:px-8">
                {isFetching ? (
                  <SpinnerIcon className="size-7 shrink-0 animate-spin text-violet-500" />
                ) : (
                  <MagnifyingGlassIcon className="size-7 shrink-0 text-violet-500" />
                )}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder={t('company.searchPalette.placeholder')}
                  className="w-full appearance-none !border-0 !bg-transparent !p-0 text-lg font-bold tracking-tight text-gray-900 !shadow-none !outline-none !ring-0 placeholder:font-semibold placeholder:text-gray-300"
                />
                <kbd className="shrink-0 rounded-none border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Esc
                </kbd>
              </div>

              <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-3">
                {showMinCharsHint ? (
                  <p className="px-6 py-3 text-sm font-medium text-gray-400 sm:px-8">
                    {t('company.searchPalette.minChars')}
                  </p>
                ) : null}

                {groups.map((group) => (
                  <div key={group.type} className="mb-3">
                    <p className="flex items-center gap-2 px-6 pb-2 pt-4 text-[11px] font-black uppercase tracking-widest text-gray-400 sm:px-8">
                      <span className="h-px w-4 bg-violet-300" />
                      {typeLabel(group.type)}
                      {group.total > group.items.length ? (
                        <span className="font-bold normal-case tracking-normal text-gray-300">
                          {t('company.searchPalette.more', {
                            count: group.total - group.items.length,
                          })}
                        </span>
                      ) : null}
                    </p>
                    {group.items.map((item) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const status = statusLabelFor(item);
                      return (
                        <button
                          key={`${item.type}:${item.id}`}
                          type="button"
                          data-active={index === activeIndex}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => execute({ kind: 'result', key: '', item })}
                          className={`flex w-full items-center gap-5 border-l-2 px-6 py-4 text-left transition-colors cursor-pointer sm:px-8 ${
                            index === activeIndex
                              ? 'border-violet-600 bg-violet-50'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-28 shrink-0 border px-2 py-1.5 text-center text-[10px] font-black uppercase tracking-wide ${TYPE_BADGE_CLASSES[item.type]}`}
                          >
                            {typeLabel(item.type)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-extrabold tracking-tight text-gray-900">
                              {item.title}
                            </span>
                            {item.subtitle ? (
                              <span className="mt-1 block truncate text-[13px] font-medium text-gray-400">
                                {item.subtitle}
                              </span>
                            ) : null}
                          </span>
                          {status ? (
                            <span className="shrink-0 bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-500">
                              {status}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {navMatches.length > 0 ? (
                  <div>
                    <p className="flex items-center gap-2 px-6 pb-2 pt-4 text-[11px] font-black uppercase tracking-widest text-gray-400 sm:px-8">
                      <span className="h-px w-4 bg-violet-300" />
                      {t('company.searchPalette.navigation')}
                    </p>
                    {navMatches.map((cmd) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      return (
                        <button
                          key={cmd.to}
                          type="button"
                          data-active={index === activeIndex}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() =>
                            execute({ kind: 'nav', key: '', label: cmd.label, to: cmd.to })
                          }
                          className={`flex w-full items-center gap-5 border-l-2 px-6 py-3.5 text-left transition-colors cursor-pointer sm:px-8 ${
                            index === activeIndex
                              ? 'border-violet-600 bg-violet-50'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center bg-gray-100 text-gray-500">
                            <ArrowSquareOutIcon className="size-4" />
                          </span>
                          <span className="text-[15px] font-extrabold tracking-tight text-gray-800">
                            {cmd.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {showEmpty ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-14 text-center sm:px-8">
                    <span className="flex size-14 items-center justify-center bg-gray-100 text-gray-300">
                      <MagnifyingGlassIcon className="size-7" />
                    </span>
                    <p className="text-base font-bold text-gray-500">
                      {t('company.searchPalette.empty', { query: query.trim() })}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-6 border-t border-gray-100 bg-gray-50/80 px-6 py-4 text-xs font-bold text-gray-400 sm:px-8">
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-gray-500">↑↓</kbd>
                  {t('company.searchPalette.hintNavigate')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-gray-500">Enter</kbd>
                  {t('company.searchPalette.hintOpen')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-gray-500">Esc</kbd>
                  {t('company.searchPalette.hintClose')}
                </span>
              </div>
            </div>
          </dialog>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`${t('company.searchPalette.placeholder')} (Ctrl+K)`}
        className="flex size-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
      >
        <MagnifyingGlassIcon className="size-5" />
      </button>
      {overlay}
    </>
  );
}
