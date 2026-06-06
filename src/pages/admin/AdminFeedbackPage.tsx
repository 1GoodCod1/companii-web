import { useTranslation } from 'react-i18next';
import {
  PageHero,
  Panel,
  EmptyState,
  SkeletonPage,
} from '@/widgets/cabinet/cabinet-ui';
import { useAdminFeedbackQuery } from '@/features/admin/api/useAdminFeedback';

export function AdminFeedbackPage() {
  const { t } = useTranslation();
  const { data: feedbacks, isLoading } = useAdminFeedbackQuery();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHero
        title={t('admin.feedbackPage.title', { defaultValue: 'Обратная связь по сметам' })}
        description={t('admin.feedbackPage.description', {
          defaultValue: 'Просмотр отзывов и сообщений о проблемах в калькуляторе смет.',
        })}
      />

      <Panel>
        {isLoading ? (
          <SkeletonPage rows={6} />
        ) : !feedbacks?.length ? (
          <EmptyState message={t('admin.feedbackPage.empty', { defaultValue: 'Нет присланных отзывов.' })} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left">{t('admin.feedbackPage.colDate', { defaultValue: 'Дата' })}</th>
                  <th className="px-6 py-3 text-left">{t('admin.feedbackPage.colUser', { defaultValue: 'Пользователь' })}</th>
                  <th className="px-6 py-3 text-left">{t('admin.feedbackPage.colCompany', { defaultValue: 'Компания' })}</th>
                  <th className="px-6 py-3 text-left">{t('admin.feedbackPage.colProject', { defaultValue: 'Смета' })}</th>
                  <th className="px-6 py-3 text-left">{t('admin.feedbackPage.colCategory', { defaultValue: 'Категория' })}</th>
                  <th className="px-6 py-3 text-left">{t('admin.feedbackPage.colDetails', { defaultValue: 'Детали' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-violet-50/30 align-top">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {new Date(item.createdAt).toLocaleString('ro-MD', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {item.user.firstName || item.user.lastName
                          ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim()
                          : 'User'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {item.company?.name || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {item.project ? (
                        <>
                          <span className="font-bold text-gray-900">{item.project.number}</span>
                          <p className="text-gray-500 text-xs mt-0.5">{item.project.title}</p>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-100/60">
                        {t(`admin.feedbackPage.categories.${item.category}`, {
                          defaultValue: item.category,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap font-medium bg-gray-50/50 p-2.5 border border-gray-100/80">
                        {item.details}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
