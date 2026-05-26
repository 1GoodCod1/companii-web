import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAdminReviewsQuery, useModerateReviewMutation, type AdminReviewDto } from '@/features/admin/api/useAdmin';
import { formatPersonName } from '@/utils/person';
import { getErrorMessage } from '@/utils/errors';

export function AdminReviewsPage() {
  const { t } = useTranslation();
  const { data: reviews, isLoading } = useAdminReviewsQuery();
  const moderateReview = useModerateReviewMutation();

  const handleToggle = async (review: AdminReviewDto, status: 'VISIBLE' | 'HIDDEN') => {
    try {
      await moderateReview.mutateAsync({ id: review.id, status });
      toast.success(status === 'HIDDEN' ? t('admin.reviewsPage.toastHidden') : t('admin.reviewsPage.toastVisible'));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('admin.reviewsPage.moderateFailed')));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.reviewsPage.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.reviewsPage.description')}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">{t('admin.reviewsPage.loading')}</p>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
          {!reviews?.length ? (
            <p className="p-6 text-sm text-gray-500">{t('admin.reviewsPage.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">{t('admin.reviewsPage.colCompany')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.reviewsPage.colClient')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.reviewsPage.colRating')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.reviewsPage.colComment')}</th>
                    <th className="px-6 py-3 text-left">{t('admin.reviewsPage.colStatus')}</th>
                    <th className="px-6 py-3 text-right">{t('admin.reviewsPage.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{review.company.name}</p>
                        <p className="text-xs text-gray-400">#{review.intervention.number}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {review.clientName ||
                          formatPersonName(review.author, review.author.email)}
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-600">{review.rating}/5</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {review.comment || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            review.status === 'VISIBLE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-gray-50 text-gray-500 border-gray-100'
                          }`}
                        >
                          {review.status === 'VISIBLE'
                            ? t('admin.reviewsPage.visible')
                            : t('admin.reviewsPage.hidden')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {review.status === 'VISIBLE' ? (
                          <button
                            type="button"
                            onClick={() => handleToggle(review, 'HIDDEN')}
                            disabled={moderateReview.isPending}
                            className="text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-xl hover:bg-red-100 disabled:opacity-50"
                          >
                            {t('cabinet.common.hide')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(review, 'VISIBLE')}
                            disabled={moderateReview.isPending}
                            className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {t('cabinet.common.reactivate')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
