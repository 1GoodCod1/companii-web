export const companiiRoCompanyShell = {
  dashboard: {
      nav: 'Panou principal',
      panels: {
        newLeads: {
          title: 'Cereri noi',
          viewAll: 'Vezi toate →',
          empty: 'Nicio cerere nouă din servicii sau site.',
          convertToIntervention: 'Preia → Lucrare',
          convertToEstimate: '→ Smetă',
        },
        activeInterventions: {
          title: 'Lucrări recente active',
          viewAll: 'Vezi toate',
          empty: 'Nicio lucrare activă în acest moment.',
          createIntervention: '+ Creează lucrare',
          viewMyJobs: 'Vezi lucrările mele',
          unspecified: 'Nespecificat',
        },
        recentInvoices: {
          title: 'Facturi recente',
          viewAll: 'Vezi toate',
          empty: 'Nicio factură emisă în acest moment.',
          generateInvoice: '+ Generează factură',
          packageClient: 'Client pachet',
          dueLabel: 'Scadent: {{date}}',
          dueImmediate: 'Imediat',
        },
      },
      kpi: {
        totalCustomers: { label: 'Clienți totali', hint: 'Înregistrați în sistem' },
        activeInterventions: { label: 'Lucrări active', hint: 'În curs de execuție' },
        totalInvoiced: { label: 'Total facturat', hint: 'Valoare totală facturi' },
        confirmedPayments: { label: 'Încasări confirmate', hint: 'Facturi plătite integral' },
        myJobs: { label: 'Lucrările mele', hint: 'Total alocate' },
        activeJobs: { label: 'Lucrări active', hint: 'De executat acum' },
        scheduledToday: { label: 'Programate azi', hint: 'Pe calendarul de azi' },
        completed: { label: 'Finalizate', hint: 'Lucrări închise' },
      },
      toasts: {
        leadConvertedIntervention: 'Cerere preluată ca lucrare.',
        leadConvertedEstimate: 'Cerere convertită în smetă.',
        convertLeadFailed: 'Nu s-a putut converti cererea.',
      },
    },

  profile: 'Profil',

  team: 'Echipă',

  servicii: 'Servicii & prețuri',

  cereri: 'Cereri',

  clienti: 'Clienți',

  lucrari: 'Lucrări',

  calendar: 'Calendar',

  oferte: 'Oferte',

  smete: 'Smete inteligente',

  smeteTemplates: 'Șabloane smete',

  facturi: 'Facturi',

  recenzii: 'Recenzii',

  subscription: 'Abonament',

  settings: 'Setări',

  audit: 'Jurnal de activitate',

  sections: {
      main: 'Principal',
      operations: 'Operațiuni',
      company: 'Companie',
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
    },
};
