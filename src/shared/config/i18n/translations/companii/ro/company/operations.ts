export const companiiRoCompanyOperations = {
  calendarPage: {
      title: 'Calendar programări',
      description: 'Săptămâna {{week}} — programate, backlog și cereri deschise.',
      loading: 'Se încarcă calendarul...',
      selectDateTime: 'Selectați data și ora.',
      toastScheduled: 'Lucrare programată.',
      toastScheduleFailed: 'Nu s-a putut programa lucrarea.',
      toastLeadEstimateHint: 'Deschideți pagina Cereri pentru calcul de preț.',
      toastConvertFailed: 'Nu s-a putut converti cererea.',
    },

  interventionsPage: {
      title: 'Lucrări',
      descriptionManagement:
        'Gestionează comenzile de lucru, programările, angajații alocați și stadiul execuției.',
      descriptionTechnician:
        'Lucrările alocate ție — actualizează statusul și adaugă note după execuție.',
      createBtn: '+ Creează lucrare',
    },

  subscriptionPage: {
      title: 'Abonament',
      descriptionNoCompany:
        'Pentru a gestiona abonamentul, mai întâi trebuie să înregistrezi compania ta.',
      createProfileBtn: 'Creează profil companie',
      description:
        'Planul tău determină ce module FSM poți folosi: clienți, lucrări, calcule de preț, oferte și facturi.',
      loading: 'Se încarcă abonamentul curent...',
      activePlan: 'Plan activ',
      statusTrial: 'Perioadă probă',
      validUntil: 'Valabil până la:',
      technicians: 'Angajați',
      unlimited: 'nelimitat',
      jobsThisMonth: 'Lucrări luna aceasta',
      freePlanHint:
        'Sunteți pe planul Free — activați Pro sau Business gratuit pentru 30 de zile.',
      proUpgradeHint:
        'Puteți trece oricând la Business — planul Pro se anulează automat la upgrade.',
      noSubscription: 'Nu există un abonament activ pentru compania ta.',
      plansTitleAll: 'Toate planurile',
      plansTitle: 'Planul tău',
      loadingPlans: 'Se încarcă planurile...',
      toastBusinessActivated: 'Planul Business a fost activat. Pro a fost înlocuit automat.',
      toastPlanActivated: 'Planul {{plan}} a fost activat gratuit pentru 30 de zile!',
      toastActivateFailed: 'Nu s-a putut activa planul.',
    },

  auditPage: {
      title: 'Jurnal de activitate',
      description: 'Istoricul tuturor acțiunilor angajaților: modificări de prețuri, calcule de preț, statusuri de lucrări și setări ale companiei.',
      filterAllActions: 'Toate acțiunile',
      filterAllUsers: 'Toți angajații',
      loading: 'Se încarcă jurnalul...',
      empty: 'Jurnalul de activitate este gol. Acțiunile angajaților vor fi înregistrate automat.',
      colDate: 'Data și ora',
      colAction: 'Acțiune',
      colUser: 'Angajat',
      colEntity: 'Obiect',
      colDetails: 'Detalii',
    },

  servicesPage: {
      title: 'Servicii & prețuri',
      description: 'Catalog public pe profilul companiei + tarife interne pentru devize (Pro+).',
      createBtn: '+ Serviciu nou',
      catalogTitle: 'Catalog servicii',
      categoryUnset: '— nesetată —',
      toastNamePriceRequired: 'Completați numele și prețul.',
      toastCategoryRequired: 'Setați categoria companiei în profil înainte de a adăuga servicii.',
      toastUpdated: 'Serviciu actualizat.',
      toastCreated: 'Serviciu adăugat.',
      toastDeleted: 'Serviciu șters.',
      confirmDelete: 'Ștergeți acest serviciu din catalog?',
    },

  reviewsPage: {
      eyebrow: 'Reputație',
      title: 'Recenzii primite',
      description: 'Feedback de la clienți după finalizarea lucrărilor',
      reviewsCount: '({{count}} recenzii)',
      panelTitle: 'Lista recenziilor',
      panelDescription: 'Recenziile apar automat când clienții evaluează lucrările finalizate.',
      loading: 'Se încarcă recenziile...',
      emptyNoCompany: 'Completează profilul companiei ca să poți primi recenzii de la clienți.',
      emptyNoReviews:
        'Nu ai încă recenzii. Clienții pot lăsa feedback din portal după ce marchezi lucrările ca finalizate.',
      goToProfile: 'Mergi la profil companie',
      retry: 'Reîncearcă',
    },

  quotesPage: {
      title: 'Oferte comerciale',
      description:
        'Generează devize de cheltuieli, bugete de lucru și oferte de preț pentru clienții tăi.',
      createBtn: '+ Creează ofertă',
      filterAll: 'Toate',
    },

  invoicesPage: {
      title: 'Facturi FSM',
      description:
        'Gestionează fluxul financiar, plățile, TVA-ul și facturarea comenzilor finalizate.',
      exportCsv: 'Export CSV',
      generateBtn: '+ Generează factură',
    },

  workSheetPage: {
      loading: 'Se încarcă fișa de lucru...',
      noAccess: 'Această lucrare nu are calcul de preț asociat sau nu aveți acces.',
      backToJobs: 'Înapoi la lucrări',
      title: 'Fișă de execuție',
      descriptionManagement:
        'Vizualizare completă pentru coordonare — angajatul vede aceeași structură fără prețuri.',
      descriptionTechnician: 'Plan, etape și materiale — fără informații comerciale.',
      jobLabel: 'Lucrare',
      clientLabel: 'Client',
      estimateLabel: 'Calcul de preț',
      checklist: 'Checklist',
      materials: 'Materiale',
      colDescription: 'Descriere',
      colQuantity: 'Cantitate',
      hours: '~{{count}} ore',
      days: '{{count}} zile',
      saveProgressFailed: 'Nu s-a putut salva progresul.',
      photos: 'Fotografii',
      photosEmpty: 'Adăugați fotografii din șantier — vizibile doar echipei.',
      takePhoto: 'Foto',
      attachPhoto: 'Atașează',
      photoDelete: 'Șterge',
      photoUploadedCount: '{{count}} fotografii încărcate.',
      photoUploadFailed: 'Nu s-au putut încărca fotografiile.',
      confirmDeletePhoto: 'Sigur ștergeți fotografia?',
      photoDeleted: 'Fotografie ștearsă.',
      photoDeleteFailed: 'Nu s-a putut șterge fotografia.',
    },

  myWorksheets: {
      title: 'Obiectele mele',
      description: 'Lucrările asignate vouă cu calcul de preț activă.',
      empty: 'Nu există obiecte asignate momentan.',
      loadError: 'Eroare la încărcarea listei.',
      notForRole: 'Această pagină este pentru angajați.',
      open: 'Deschide fișa',
    },
};
