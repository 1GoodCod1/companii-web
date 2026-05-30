import { useTranslation } from 'react-i18next';

type DiagnosticWarningsProps = {
  diagnostic: Record<string, unknown>;
  enabledWorkModules: string[];
};

export function DiagnosticWarnings({ diagnostic }: DiagnosticWarningsProps) {
  const { t } = useTranslation();

  const heightRaw = diagnostic.buildingHeightM;
  const heightNum = typeof heightRaw === 'number' ? heightRaw : Number(heightRaw);
  const showHeightCoeffNotice = Number.isFinite(heightNum) && heightNum > 9;

  const slopeRaw = diagnostic.roofSlope;
  const slopeNum = typeof slopeRaw === 'number' ? slopeRaw : Number(slopeRaw);
  const shapeRaw = diagnostic.roofShape;
  const showRoofManualReview =
    (Number.isFinite(slopeNum) && slopeNum > 60) || shapeRaw === 'complex';

  return (
    <>
      {showHeightCoeffNotice && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-200 p-3">
          <span className="text-amber-600 font-extrabold text-sm shrink-0">⚠️</span>
          <span className="text-xs font-semibold text-amber-950 leading-relaxed">
            {t('company.estimateWizard.diagnosticStep.heightCoeffNotice', {
              defaultValue:
                'Înălțime peste 9 m — se aplică automat un coeficient de înălțime 1.2× la manoperă.',
            })}
          </span>
        </div>
      )}

      {showRoofManualReview && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50/70 border border-rose-200 p-3">
          <span className="text-rose-600 font-extrabold text-sm shrink-0">⚠️</span>
          <span className="text-xs font-semibold text-rose-950 leading-relaxed">
            {t('company.estimateWizard.diagnosticStep.roofManualReviewNotice', {
              defaultValue:
                'Pantă abruptă sau formă complexă — devizul este orientativ și necesită verificare la fața locului de către maistru.',
            })}
          </span>
        </div>
      )}
    </>
  );
}
