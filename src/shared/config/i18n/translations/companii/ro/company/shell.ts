export const companiiRoCompanyShell = {
  dashboard: {
      nav: 'Panou principal',
      panels: {
        newLeads: {
          title: 'Cereri noi',
          viewAll: 'Vezi toate →',
          pending: '{{count}} în așteptare',
          empty: 'Nicio cerere nouă din servicii sau site.',
          convertToIntervention: 'Preia → Lucrare',
          convertToEstimate: 'Calcul preț',
        },
        activeInterventions: {
          title: 'Lucrări recente active',
          description: 'Următoarele intervenții programate',
          viewAll: 'Vezi toate →',
          empty: 'Nicio lucrare activă în acest moment.',
          createIntervention: '+ Creează lucrare',
          viewMyJobs: 'Vezi lucrările mele',
          unspecified: 'Nespecificat',
          todayAt: 'Azi, {{time}}',
        },
        recentInvoices: {
          title: 'Facturi recente',
          viewAll: 'Vezi toate →',
          empty: 'Nicio factură emisă în acest moment.',
          generateInvoice: '+ Generează factură',
          packageClient: 'Client pachet',
          dueLabel: 'Scadent: {{date}}',
          dueImmediate: 'Imediat',
        },
        collections: {
          title: 'Încasări vs facturat',
          subtitle: 'Luna curentă',
          rateLabel: '{{rate}}% încasat',
        },
      },
      kpi: {
        totalCustomers: { label: 'Clienți totali', hint: 'Înregistrați în sistem' },
        activeInterventions: { label: 'Lucrări active', hint: 'În curs de execuție' },
        totalInvoiced: { label: 'Total facturat', hint: 'Valoare totală facturi' },
        confirmedPayments: {
          label: 'Încasări confirmate',
          hint: 'Facturi plătite integral',
          hintRate: '{{rate}}% din facturat',
        },
        myJobs: { label: 'Lucrările mele', hint: 'Total alocate' },
        activeJobs: { label: 'Lucrări active', hint: 'De executat acum' },
        scheduledToday: { label: 'Programate azi', hint: 'Pe calendarul de azi' },
        completed: { label: 'Finalizate', hint: 'Lucrări închise' },
      },
      toasts: {
        leadConvertedIntervention: 'Cerere preluată ca lucrare.',
        leadConvertedEstimate: 'Cerere convertită în calcul de preț.',
        convertLeadFailed: 'Nu s-a putut converti cererea.',
      },
    },

  profile: 'Profil',

  gallery: 'Galerie',

  team: 'Echipă',

  servicii: 'Servicii & prețuri',

  cereri: 'Cereri',

  pipeline: 'Pipeline',

  clienti: 'Clienți',

  lucrari: 'Lucrări',

  calendar: 'Calendar',

  oferte: 'Oferte',

  smete: 'Calcule de preț',

  smeteTemplates: 'Șabloane calcule de preț',

  facturi: 'Facturi',

  recenzii: 'Recenzii',

  subscription: 'Abonament',

  settings: 'Setări',

  audit: 'Jurnal de activitate',

  searchPalette: {
    placeholder: 'Căutare în cabinet: clienți, lucrări, facturi…',
    minChars: 'Introduceți minim 2 caractere.',
    empty: 'Nimic găsit pentru „{{query}}”.',
    navigation: 'Navigare',
    more: '(+{{count}} în plus)',
    hintNavigate: 'selectare',
    hintOpen: 'deschide',
    hintClose: 'închide',
    types: {
      customer: 'Client',
      lead: 'Cerere',
      intervention: 'Lucrare',
      quote: 'Ofertă',
      invoice: 'Factură',
      estimate: 'Calcul de preț',
      service: 'Serviciu',
    },
  },

  sections: {
      main: 'Principal',
      operations: 'Operațiuni',
      company: 'Companie',
    },

  navGroups: {
      clients: 'Clienți & cereri',
      work: 'Lucrări & calendar',
      finance: 'Calcule & facturare',
      catalog: 'Catalog public',
      profile: 'Profil & galerie',
      admin: 'Echipă & setări',
    },

  roles: {
      owner: 'Proprietar',
      manager: 'Manager',
      member: 'Angajat',
      administrator: 'Administrator',
    },

  dashboardPage: {
      eyebrow: 'Panou principal',
      greeting: 'Salut, {{name}}! 👋',
      descriptionManagement:
        'Bine ai venit la panoul tău Faber CRM. Iată starea afacerii tale astăzi.',
      descriptionTechnician:
        'Bine ai venit! Iată lucrările alocate ție și programarea de azi.',
      registerCompany: 'Înregistrează compania',
      createProfile: 'Creează profil companie',
      activeSubscription: 'Abonament activ',
      managePlan: 'Gestionează planul →',
      onboardingPrefix: 'Contul tău nu este legat încă de o companie. Completează',
      onboardingProfileLink: 'profilul companiei',
      onboardingSuffix:
        '(IDNO, adresă, categorie) pentru a accesa clienți, cereri și restul modulelor.',
      technicianPrefix: 'Cont de',
      technicianRole: 'angajat',
      technicianMiddle:
        '— clienții, cererile și setările companiei le gestionează managerul. Lucrările tale sunt în',
      linkAnd: 'și',
      technicianCalendarSuffix:
        '. Pentru a-ți înregistra propria companie, ieși din cont și creează un cont nou de tip «Companie» pe pagina publică de înregistrare.',
      tabs: {
        overview: 'Panou principal',
        analytics: 'Analiză business',
      },
    },
    verificationPending: {
      title: 'Cabinet în curs de moderare',
      description: 'Compania dvs. a fost înregistrată și așteaptă verificarea de către un administrator. Accesul la panourile de lucru se va deschide automat imediat după aprobare.',
      statusTitle: 'Stare verificare',
      statusWaiting: 'În așteptarea aprobării',
      stepRegistered: 'Înregistrarea companiei',
      stepReview: 'Verificarea de către administrator',
      stepActivate: 'Activarea cabinetului',
      autoUpdateInfo: 'Pagina se va actualiza automat, nu o închideți.',
      editProfile: 'Editează profilul',
      settings: 'Setări',
      bannerTitle: 'Cabinet în curs de moderare',
      bannerDescription: 'Accesul complet la panoul de control se va deschide automat imediat după aprobarea de către administrator.',
      approvedToast: 'Cabinetul a fost aprobat cu succes! Bine ați venit.',
    },
};
