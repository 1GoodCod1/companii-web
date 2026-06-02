export const companiiRuCompanyShell = {
  dashboard: {
      nav: 'Главная',
      panels: {
        newLeads: {
          title: 'Новые заявки',
          viewAll: 'Смотреть все →',
          empty: 'Нет новых заявок с сайта или из каталога.',
          convertToIntervention: 'Принять → Работа',
          convertToEstimate: '→ Смета',
        },
        activeInterventions: {
          title: 'Недавние активные работы',
          viewAll: 'Смотреть все',
          empty: 'Сейчас нет активных работ.',
          createIntervention: '+ Создать работу',
          viewMyJobs: 'Мои работы',
          unspecified: 'Не указано',
        },
        recentInvoices: {
          title: 'Недавние счета',
          viewAll: 'Смотреть все',
          empty: 'Пока нет выставленных счетов.',
          generateInvoice: '+ Создать счёт',
          packageClient: 'Клиент пакета',
          dueLabel: 'Срок: {{date}}',
          dueImmediate: 'Немедленно',
        },
      },
      kpi: {
        totalCustomers: { label: 'Всего клиентов', hint: 'Зарегистрировано в системе' },
        activeInterventions: { label: 'Активные работы', hint: 'В процессе выполнения' },
        totalInvoiced: { label: 'Всего выставлено', hint: 'Общая сумма счетов' },
        confirmedPayments: { label: 'Подтверждённые поступления', hint: 'Полностью оплаченные счета' },
        myJobs: { label: 'Мои работы', hint: 'Всего назначено' },
        activeJobs: { label: 'Активные работы', hint: 'К выполнению сейчас' },
        scheduledToday: { label: 'Запланировано сегодня', hint: 'В календаре на сегодня' },
        completed: { label: 'Завершено', hint: 'Закрытые работы' },
      },
      toasts: {
        leadConvertedIntervention: 'Заявка принята как работа.',
        leadConvertedEstimate: 'Заявка преобразована в смету.',
        convertLeadFailed: 'Не удалось преобразовать заявку.',
      },
    },

  profile: 'Профиль',

  team: 'Команда',

  servicii: 'Услуги и цены',

  cereri: 'Заявки',

  clienti: 'Клиенты',

  lucrari: 'Работы',

  calendar: 'Календарь',

  oferte: 'Предложения',

  smete: 'Умные сметы',

  smeteTemplates: 'Шаблоны смет',

  facturi: 'Счета',

  recenzii: 'Отзывы',

  subscription: 'Подписка',

  settings: 'Настройки',

  audit: 'Журнал активности',

  sections: {
      main: 'Главное',
      operations: 'Операции',
      company: 'Компания',
    },

  roles: {
      owner: 'Владелец',
      manager: 'Менеджер',
      member: 'Сотрудник',
      administrator: 'Администратор',
    },

  dashboardPage: {
      eyebrow: 'Главная',
      greeting: 'Привет, {{name}}! 👋',
      descriptionManagement:
        'Добро пожаловать в панель Faber CRM. Вот состояние вашего бизнеса сегодня.',
      descriptionTechnician:
        'Добро пожаловать! Вот работы, назначенные вам, и расписание на сегодня.',
      registerCompany: 'Зарегистрировать компанию',
      createProfile: 'Создать профиль компании',
      activeSubscription: 'Активная подписка',
      managePlan: 'Управлять планом →',
      onboardingPrefix: 'Ваш аккаунт ещё не привязан к компании. Заполните',
      onboardingProfileLink: 'профиль компании',
      onboardingSuffix:
        '(IDNO, адрес, категория), чтобы получить доступ к клиентам, заявкам и остальным модулям.',
      technicianPrefix: 'Аккаунт',
      technicianRole: 'сотрудника',
      technicianMiddle:
        '— клиентов, заявки и настройки компании управляет менеджер. Ваши работы в разделах',
      linkAnd: 'и',
      technicianCalendarSuffix:
        '. Чтобы зарегистрировать свою компанию, выйдите из аккаунта и создайте новый аккаунт типа «Компания» на публичной странице регистрации.',
    },
};
