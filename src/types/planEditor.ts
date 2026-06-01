import type { EstimateBlueprintConfig, Plan2dData } from '@/types/estimates';

export type PlanEditorProps = {
  value: Plan2dData;
  config?: EstimateBlueprintConfig | null;
  categoryName?: string;
  categorySlug?: string;
  onChange: (plan: Plan2dData) => void;
  readOnly?: boolean;
  /** Worksheet: hide empty plan sections (no blank rooms/global/inventory). */
  variant?: 'wizard' | 'worksheet';
};

export type WorkContext = 'general' | 'indoor' | 'roof' | 'facade';
