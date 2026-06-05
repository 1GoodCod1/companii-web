import { useState, useMemo } from 'react';
import { ArrowsLeftRightIcon, TrendDownIcon, TrendUpIcon, MinusIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useEstimateVersions, useEstimateVersionDiff } from '../api/useEstimateVersions';
import type { EstimateVersionSummary } from '@/entities/estimate/model/estimates';
import { Panel, PanelHeader, AppSelect } from '@/widgets/cabinet/cabinet-ui';

interface Props {
  projectId: string;
}

export function EstimateVersionHistory({ projectId }: Props) {
  const { t } = useTranslation();
  const [selectedA, setSelectedA] = useState<number | undefined>();
  const [selectedB, setSelectedB] = useState<number | undefined>();

  const { data: versions, isLoading } = useEstimateVersions(projectId);
  const diffQuery = useEstimateVersionDiff(projectId, selectedA, selectedB);

  const diff = diffQuery.data;

  const versionOptions: Array<{ value: number; label: string }> = useMemo(() => {
    if (!versions) return [];
    return versions.map((v: EstimateVersionSummary) => ({
      value: v.version,
      label: `${v.label ?? `v${v.version}`} (${v.grandTotal.toLocaleString()} MDL)`,
    }));
  }, [versions]);

  const versionSelectOptions = useMemo(
    () => [
      { value: '', label: t('versions.select', 'Select...') },
      ...versionOptions.map((opt) => ({ value: String(opt.value), label: opt.label })),
    ],
    [versionOptions, t],
  );

  const versionBSelectOptions = useMemo(
    () => {
      const initial = [{ value: '', label: t('versions.select', 'Select...') }];
      return versionOptions.reduce((acc, opt) => {
        if (opt.value !== selectedA) {
          acc.push({ value: String(opt.value), label: opt.label });
        }
        return acc;
      }, initial);
    },
    [versionOptions, selectedA, t],
  );

  return (
    <Panel>
      <PanelHeader
        title={t('versions.title', 'Historique des versions')}
      />

      {isLoading && (
        <div className="text-sm text-muted-foreground p-4">
          {t('common.loading', 'Chargement...')}
        </div>
      )}

      {versions && versions.length > 0 && (
        <div className="p-4 space-y-4">
          {/* Diff selector */}
          <div className="flex flex-wrap items-center gap-3">
            <AppSelect
              value={selectedA != null ? String(selectedA) : ''}
              onChange={(value) => setSelectedA(value ? Number(value) : undefined)}
              options={versionSelectOptions}
              aria-label={t('versions.select', 'Select...')}
              className="min-w-[200px]"
              maxVisibleItems={8}
            />

            <ArrowsLeftRightIcon className="size-4 text-muted-foreground flex-shrink-0" />

            <AppSelect
              value={selectedB != null ? String(selectedB) : ''}
              onChange={(value) => setSelectedB(value ? Number(value) : undefined)}
              options={versionBSelectOptions}
              aria-label={t('versions.select', 'Select...')}
              className="min-w-[200px]"
              maxVisibleItems={8}
            />
          </div>

          {/* Diff result */}
          {diff && (
            <div className="space-y-3 border rounded-lg p-3 bg-muted/10">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {t('versions.linesChanged', 'Lines:')}
                  </span>
                  {diff.lineCountDelta === 0 ? (
                    <span className="flex items-center gap-1">
                      <MinusIcon className="size-3" /> 0
                    </span>
                  ) : diff.lineCountDelta > 0 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendUpIcon className="size-3" />+{diff.lineCountDelta}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <TrendDownIcon className="size-3" />
                      {diff.lineCountDelta}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {t('versions.totalChanged', 'Total:')}
                  </span>
                  {diff.grandTotalDelta === 0 ? (
                    <span className="flex items-center gap-1">0 MDL</span>
                  ) : diff.grandTotalDelta > 0 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendUpIcon className="size-3" />+
                      {diff.grandTotalDelta.toLocaleString()} MDL
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <TrendDownIcon className="size-3" />
                      {diff.grandTotalDelta.toLocaleString()} MDL
                    </span>
                  )}
                </div>
              </div>

              {diff.removedLines.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-700 mb-1">
                    {t('versions.removedLines', 'Removed lines')} ({diff.removedLines.length})
                  </div>
                  <ul className="space-y-1">
                    {diff.removedLines.map((name: string) => (
                      <li
                        key={name}
                        className="text-xs text-red-700 bg-red-50 rounded px-2 py-1"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diff.addedLines.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-700 mb-1">
                    {t('versions.addedLines', 'Added lines')} ({diff.addedLines.length})
                  </div>
                  <ul className="space-y-1">
                    {diff.addedLines.map((name: string) => (
                      <li
                        key={name}
                        className="text-xs text-green-700 bg-green-50 rounded px-2 py-1"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {versions && versions.length === 0 && (
        <div className="text-sm text-muted-foreground p-4">
          {t('versions.empty', 'No versions yet. Version history is created on calculation.')}
        </div>
      )}
    </Panel>
  );
}