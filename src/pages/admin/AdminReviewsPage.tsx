import toast from 'react-hot-toast';
import { useAdminReviewsQuery, useModerateReviewMutation, type AdminReviewDto } from '@/features/admin/api/useAdmin';

export function AdminReviewsPage() {
  const { data: reviews, isLoading } = useAdminReviewsQuery();
  const moderateReview = useModerateReviewMutation();

  const handleToggle = async (review: AdminReviewDto, status: 'VISIBLE' | 'HIDDEN') => {
    try {
      await moderateReview.mutateAsync({ id: review.id, status });
      toast.success(status === 'HIDDEN' ? 'Recenzie ascunsă.' : 'Recenzie vizibilă.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Moderarea a eșuat.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recenzii</h1>
        <p className="text-gray-500 text-sm mt-1">Moderare recenzii clienți — ascunde sau reactivează.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Se încarcă recenziile...</p>
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-premium overflow-hidden">
          {!reviews?.length ? (
            <p className="p-6 text-sm text-gray-500">Nicio recenzie.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Companie</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Rating</th>
                    <th className="px-6 py-3 text-left">Comentariu</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Acțiuni</th>
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
                          [review.author.firstName, review.author.lastName].filter(Boolean).join(' ') ||
                          review.author.email}
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
                          {review.status === 'VISIBLE' ? 'Vizibilă' : 'Ascunsă'}
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
                            Ascunde
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(review, 'VISIBLE')}
                            disabled={moderateReview.isPending}
                            className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Reactivează
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
