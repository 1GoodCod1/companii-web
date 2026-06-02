export const companiiRuCompanyOperations = {
  calendarPage: {
      title: 'Календарь записей',
      description: 'Неделя {{week}} — запланированные, backlog и открытые заявки.',
      loading: 'Загрузка календаря...',
      selectDateTime: 'Выберите дату и время.',
      toastScheduled: 'Работа запланирована.',
      toastScheduleFailed: 'Не удалось запланировать работу.',
      toastLeadEstimateHint: 'Откройте страницу Заявки для сметы.',
      toastConvertFailed: 'Не удалось конвертировать заявку.',
    },

  interventionsPage: {
      title: 'Работы',
      descriptionManagement:
        'Управляйте заказами, расписанием, назначенными сотрудниками и ходом выполнения.',
      descriptionTechnician:
        'Назначенные вам работы — обновляйте статус и добавляйте заметки после выполнения.',
      createBtn: '+ Создать работу',
    },

  subscriptionPage: {
      title: 'Подписка',
      descriptionNoCompany:
        'Чтобы управлять подпиской, сначала зарегистрируйте компанию.',
      createProfileBtn: 'Создать профиль компании',
      description:
        'Ваш план определяет, какие FSM-модули доступны: клиенты, работы, сметы, предложения и счета.',
      loading: 'Загрузка текущей подписки...',
      activePlan: 'Активный план',
      statusTrial: 'Пробный период',
      validUntil: 'Действует до:',
      technicians: 'Сотрудники',
      unlimited: 'без лимита',
      jobsThisMonth: 'Работ в этом месяце',
      freePlanHint:
        'Вы на плане Free — активируйте Pro или Business бесплатно на 30 дней.',
      proUpgradeHint:
        'Можно перейти на Business в любой момент — Pro отменяется автоматически при апгрейде.',
      noSubscription: 'Нет активной подписки для вашей компании.',
      plansTitleAll: 'Все планы',
      plansTitle: 'Ваш план',
      loadingPlans: 'Загрузка планов...',
      toastBusinessActivated: 'План Business активирован. Pro заменён автоматически.',
      toastPlanActivated: 'План {{plan}} активирован бесплатно на 30 дней!',
      toastActivateFailed: 'Не удалось активировать план.',
    },

  auditPage: {
      title: 'Журнал активности',
      description: 'История всех действий сотрудников: изменения цен, смет, статусов работ и настроек компании.',
      filterAllActions: 'Все действия',
      filterAllUsers: 'Все сотрудники',
      loading: 'Загрузка журнала...',
      empty: 'Журнал активности пуст. Действия ваших сотрудников будут записываться автоматически.',
      colDate: 'Дата и время',
      colAction: 'Действие',
      colUser: 'Сотрудник',
      colEntity: 'Объект',
      colDetails: 'Детали',
    },

  servicesPage: {
      title: 'Услуги и цены',
      description: 'Публичный каталог на профиле компании + внутренние тарифы для смет (Pro+).',
      createBtn: '+ Новая услуга',
      catalogTitle: 'Каталог услуг',
      categoryUnset: '— не задана —',
      toastNamePriceRequired: 'Заполните название и цену.',
      toastCategoryRequired: 'Укажите категорию компании в профиле перед добавлением услуг.',
      toastUpdated: 'Услуга обновлена.',
      toastCreated: 'Услуга добавлена.',
      toastDeleted: 'Услуга удалена.',
      confirmDelete: 'Удалить эту услугу из каталога?',
    },

  reviewsPage: {
      eyebrow: 'Репутация',
      title: 'Полученные отзывы',
      description: 'Отзывы клиентов после завершения работ',
      reviewsCount: '({{count}} отзывов)',
      panelTitle: 'Список отзывов',
      panelDescription: 'Отзывы появляются, когда клиенты оценивают завершённые работы.',
      loading: 'Загрузка отзывов...',
      emptyNoCompany: 'Заполните профиль компании, чтобы получать отзывы от клиентов.',
      emptyNoReviews:
        'Пока нет отзывов. Клиенты могут оставить feedback в портале после завершения работ.',
      goToProfile: 'Перейти к профилю компании',
      retry: 'Повторить',
    },

  quotesPage: {
      title: 'Коммерческие предложения',
      description:
        'Создавайте сметы расходов, рабочие бюджеты и ценовые предложения для клиентов.',
      createBtn: '+ Создать предложение',
    },

  invoicesPage: {
      title: 'Счета FSM',
      description:
        'Управляйте финансовым потоком, платежами, НДС и выставлением счетов по завершённым заказам.',
      exportCsv: 'Экспорт CSV',
      generateBtn: '+ Создать счёт',
    },

  workSheetPage: {
      loading: 'Загрузка рабочего листа...',
      noAccess: 'У этой работы нет связанной сметы или нет доступа.',
      backToJobs: 'Назад к работам',
      title: 'Лист выполнения',
      descriptionManagement:
        'Полный обзор для координации — сотрудник видит ту же структуру без цен.',
      descriptionTechnician: 'План, этапы и материалы — без коммерческой информации.',
      jobLabel: 'Работа',
      clientLabel: 'Клиент',
      estimateLabel: 'Смета',
      checklist: 'Чеклист',
      materials: 'Материалы',
      colDescription: 'Описание',
      colQuantity: 'Количество',
      hours: '~{{count}} ч.',
      days: '{{count}} дн.',
      saveProgressFailed: 'Не удалось сохранить прогресс.',
      photos: 'Фотографии',
      photosEmpty: 'Добавьте фото с объекта — видны только команде.',
      takePhoto: 'Фото',
      attachPhoto: 'Прикрепить',
      photoDelete: 'Удалить',
      photoUploadedCount: '{{count}} фото загружено.',
      photoUploadFailed: 'Не удалось загрузить фото.',
      confirmDeletePhoto: 'Удалить фото?',
      photoDeleted: 'Фото удалено.',
      photoDeleteFailed: 'Не удалось удалить фото.',
    },

  myWorksheets: {
      title: 'Мои объекты',
      description: 'Назначенные вам работы с активной сметой.',
      empty: 'Назначенных объектов пока нет.',
      loadError: 'Ошибка загрузки списка.',
      notForRole: 'Эта страница для сотрудников.',
      open: 'Открыть наряд',
    },
};
