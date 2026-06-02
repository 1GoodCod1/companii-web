import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cabinetFieldClass } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';

export type AppSelectOption = {
  value: string;
  label: string;
  title?: string;
  disabled?: boolean;
};

const ITEM_HEIGHT_PX = 40;

type AppSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  maxVisibleItems?: number;
  menuPortal?: boolean;
  menuMinWidth?: number;
};

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  maxVisibleItems = 6,
  menuPortal = false,
  menuMinWidth = 0,
}: AppSelectProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const selectedLabel = selectedOption?.label;
  const listMaxHeight = Math.min(options.length, maxVisibleItems) * ITEM_HEIGHT_PX;

  const selectedIndex = useMemo(() => {
    const idx = options.findIndex((option) => option.value === value && !option.disabled);
    return idx >= 0 ? idx : 0;
  }, [options, value]);

  const currentActiveIndex = activeIndex >= 0 ? activeIndex : (open ? selectedIndex : -1);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  const selectOption = useCallback(
    (option: AppSelectOption) => {
      if (option.disabled) return;
      onChange(option.value);
      close();
    },
    [close, onChange],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      closeRef.current();
    };

    const handleEscape = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') closeRef.current();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, selectedIndex]);

  useLayoutEffect(() => {
    if (!open || !menuPortal || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, menuMinWidth),
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [menuPortal, menuMinWidth, open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (open && currentActiveIndex >= 0) {
        const option = options[currentActiveIndex];
        if (option) selectOption(option);
        return;
      }
      setOpen((prev) => !prev);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      let next = currentActiveIndex;

      do {
        next = (next + direction + options.length) % options.length;
      } while (options[next]?.disabled && next !== currentActiveIndex);

      setActiveIndex(next);
      const node = listRef.current?.children[next] as HTMLElement | undefined;
      node?.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div ref={rootRef} className={cn('relative w-full min-w-0', className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        title={selectedOption?.title ?? selectedLabel ?? undefined}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          cabinetFieldClass,
          'flex items-center justify-between gap-3 text-left font-medium transition-colors',
          open && 'border-slate-300 bg-white',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className={cn('min-w-0 truncate', !selectedLabel && 'text-gray-400')}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180 text-gray-600',
          )}
          aria-hidden
        />
      </button>

      {open
        ? (() => {
            const listbox = (
              <div
                ref={listRef}
                id={listboxId}
                aria-labelledby={triggerId}
                style={{
                  maxHeight: listMaxHeight,
                  ...(menuPortal && menuStyle
                    ? {
                        position: 'fixed',
                        top: menuStyle.top,
                        left: menuStyle.left,
                        width: menuStyle.width,
                        zIndex: 300,
                      }
                    : undefined),
                }}
                className={cn(
                  'custom-scrollbar overflow-y-auto border border-slate-300 bg-white shadow-lg shadow-slate-900/10',
                  !menuPortal && 'absolute left-0 right-0 top-full z-50 mt-1',
                )}
              >
                {options.map((option, index) => {
                  const isSelected = option.value === value;
                  const isActive = index === currentActiveIndex;

                  return (
                    <button
                      key={`${option.value}-${index}`}
                      type="button"
                      aria-current={isSelected ? 'true' : undefined}
                      disabled={option.disabled}
                      onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                      title={option.title}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors',
                        option.disabled && 'cursor-not-allowed opacity-50',
                        isSelected && 'bg-violet-50 font-semibold text-violet-900',
                        !isSelected && isActive && 'bg-slate-50 text-gray-900',
                        !isSelected && !isActive && 'text-gray-700 hover:bg-slate-50',
                      )}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      {isSelected ? <Check className="size-4 shrink-0 text-violet-600" /> : null}
                    </button>
                  );
                })}
              </div>
            );

            return menuPortal && typeof document !== 'undefined'
              ? createPortal(listbox, document.body)
              : listbox;
          })()
        : null}
    </div>
  );
}
