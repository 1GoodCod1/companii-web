export const companiiRuNotifications = {
  notifications: {
    title: 'Уведомления',
    markAllRead: 'Прочитать все',
    deleteAll: 'Удалить все',
    emptyTitle: 'Нет уведомлений',
    newBadge: 'Новое',
    newToast: 'Новое уведомление',
    // Localized notification bodies, keyed by `metadata.i18nKey` set by the API.
    // If a key is missing, the stored (Romanian) title/message is shown instead.
    messages: {
      newLead: {
        title: 'Новая заявка',
        client: 'Клиент: {{contactName}} ({{contactPhone}})',
        service: 'Услуга/Проект: {{serviceTitle}}',
        budget: 'Ориентировочный бюджет: {{budget}} лей',
      },
      estimateSent: {
        title: 'Новый расчёт стоимости',
        body: '{{companyName}} отправил(а) вам расчёт стоимости №{{number}} «{{title}}» на рассмотрение.',
      },
      estimateAccepted: {
        title: 'Расчёт принят',
        body: 'Клиент {{clientName}} принял расчёт стоимости №{{number}} — {{title}}.',
      },
      estimateRejected: {
        title: 'Расчёт отклонён',
        body: 'Клиент {{clientName}} отклонил расчёт стоимости №{{number}} — {{title}}.',
      },
      estimateFeedback: {
        title: 'Комментарий к расчёту',
        body: 'Клиент {{clientName}} оставил комментарий к расчёту №{{number}} — {{title}}:\n\n«{{comment}}»',
      },
      interventionScheduled: {
        title: 'Работа запланирована',
        body: 'Работа №{{number}} запланирована.',
        bodyDated: 'Работа №{{number}} запланирована на {{date}}.',
      },
      interventionCompleted: {
        title: 'Работа завершена',
        body: 'Работа №{{number}} завершена.',
      },
      invoiceIssued: {
        title: 'Новый счёт',
        body: '{{companyName}} выставил(а) вам счёт №{{number}} на сумму {{total}} MDL.',
      },
      paymentConfirmed: {
        title: 'Оплата подтверждена',
        body: 'Оплата счёта №{{number}} подтверждена. Спасибо!',
      },
    },
  },
};
