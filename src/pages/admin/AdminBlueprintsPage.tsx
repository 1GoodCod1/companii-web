import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, RefreshCw } from 'lucide-react';
import {
  PageHero,
  EmptyState,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/widgets/cabinet/cabinet-ui';
import {
  useAdminBlueprintsQuery,
  useAdminCategoriesQuery,
} from '@/features/admin';
import { useAdminBlueprintForm } from '@/features/admin';
import { AdminBlueprintControlPanel } from '@/features/admin';
import { AdminBlueprintCard } from '@/features/admin';
import { AdminBlueprintModal } from '@/features/admin';

export function AdminBlueprintsPage() {
  const { t } = useTranslation();
  const { data: blueprints, isLoading, refetch } = useAdminBlueprintsQuery();
  const { data: categories } = useAdminCategoriesQuery();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const {
    modalOpen,
    setModalOpen,
    editing,
    activeTab,
    setActiveTab,
    name,
    setName,
    categoryId,
    setCategoryId,
    version,
    setVersion,
    isActive,
    setIsActive,
    defaultLaborRate,
    defaultMarginPct,
    diffEasy,
    diffMedium,
    diffDifficult,
    diffAppliesToMaterial,
    urgUrgent,
    urgEmergency,
    urgAppliesToMaterial,
    configJsonStr,
    jsonError,
    handleVisualChange,
    handleJsonChange,
    handleBeautify,
    handleOpenCreate,
    handleOpenEdit,
    handleToggleActive,
    handleSubmit,
    handleDelete,
    isPending,
    confirmDialog,
  } = useAdminBlueprintForm();

  const availableCategories = useMemo(() => {
    if (!categories) return [];
    const usedCategoryIds = new Set((blueprints || []).map((bp) => bp.categoryId));
    return categories.filter((cat) => !usedCategoryIds.has(cat.id) || cat.id === editing?.categoryId);
  }, [categories, blueprints, editing]);

  const filteredBlueprints = useMemo(() => {
    if (!blueprints) return [];
    return blueprints.filter((bp) => {
      const matchesSearch =
        bp.name.toLowerCase().includes(search.toLowerCase()) ||
        bp.category.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && bp.isActive) ||
        (statusFilter === 'inactive' && !bp.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [blueprints, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHero
        eyebrow={t('admin.blueprintsPage.eyebrow')}
        title={t('admin.blueprintsPage.title')}
        description={t('admin.blueprintsPage.description')}
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className={`${cabinetBtnSecondary} flex items-center gap-1.5`}
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`${cabinetBtnPrimary} flex items-center gap-1.5`}
            >
              <Sliders className="size-3.5" />
              {t('admin.blueprintsPage.createBtn')}
            </button>
          </div>
        }
      />

      <AdminBlueprintControlPanel
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <RefreshCw className="size-8 animate-spin mb-2 text-primary/60" />
          <p className="text-sm font-semibold">{t('cabinet.common.loading')}</p>
        </div>
      ) : filteredBlueprints.length === 0 ? (
        <EmptyState
          message={t('admin.blueprintsPage.empty')}
          action={
            <button type="button" onClick={handleOpenCreate} className={cabinetBtnSecondary}>
              {t('admin.blueprintsPage.emptyAction')}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlueprints.map((bp) => (
            <AdminBlueprintCard
              key={bp.id}
              bp={bp}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <AdminBlueprintModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        availableCategories={availableCategories}
        onSubmit={(e) => void handleSubmit(e)}
        name={name}
        onNameChange={setName}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        version={version}
        onVersionChange={setVersion}
        isActive={isActive}
        onIsActiveChange={setIsActive}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        defaultLaborRate={defaultLaborRate}
        defaultMarginPct={defaultMarginPct}
        diffEasy={diffEasy}
        diffMedium={diffMedium}
        diffDifficult={diffDifficult}
        diffAppliesToMaterial={diffAppliesToMaterial}
        urgUrgent={urgUrgent}
        urgEmergency={urgEmergency}
        urgAppliesToMaterial={urgAppliesToMaterial}
        onVisualChange={handleVisualChange}
        configJsonStr={configJsonStr}
        onJsonChange={handleJsonChange}
        jsonError={jsonError}
        onBeautify={handleBeautify}
        isPending={isPending}
      />
      {confirmDialog}
    </div>
  );
}
