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
  /** Render dropdown in a portal so it is not clipped by overflow-hidden ancestors */
  menuPortal?: boolean;
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
}: AppSelectProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
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

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

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
      close();
    };

    const handleEscape = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [close, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    const index = selectedIndex >= 0 ? selectedIndex : 0;
    setActiveIndex(index);
    const node = listRef.current.children[index] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, options, value]);

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
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [menuPortal, open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
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
      let next = activeIndex;

      do {
        next = (next + direction + options.length) % options.length;
      } while (options[next]?.disabled && next !== activeIndex);

      setActiveIndex(next);
      const node = listRef.current?.children[next] as HTMLElement | undefined;
      node?.scrollIntoView({ block: 'nearest' });
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectOption(option);
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
            'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180 text-gray-600',
          )}
          aria-hidden
        />
      </button>

      {open
        ? (() => {
            const listbox = (
              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-labelledby={triggerId}
                tabIndex={-1}
                onKeyDown={handleListKeyDown}
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
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={`${option.value}-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                      title={option.title}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-colors',
                        option.disabled && 'cursor-not-allowed opacity-50',
                        isSelected && 'bg-violet-50 font-semibold text-violet-900',
                        !isSelected && isActive && 'bg-slate-50 text-gray-900',
                        !isSelected && !isActive && 'text-gray-700 hover:bg-slate-50',
                      )}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0 text-violet-600" /> : null}
                    </li>
                  );
                })}
              </ul>
            );

            return menuPortal && typeof document !== 'undefined'
              ? createPortal(listbox, document.body)
              : listbox;
          })()
        : null}
    </div>
  );
}
