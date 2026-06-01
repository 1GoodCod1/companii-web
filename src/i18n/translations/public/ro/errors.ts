export const publicRoErrors = {
  notFound: {
    seoTitle: 'Pagina nu a fost găsită',
    badge: 'Eroare de navigare',
    title: 'Traseul nu există pe hartă',
    description:
      'Adresa pe care ai accesat-o nu corespunde niciunui ecran din Faber. Poate a fost mutată, redenumită sau nu a trecut încă inspecția QA.',
    hint: 'Verifică linkul sau revino la punctele sigure de mai jos.',
    goHome: 'Pagina principală',
    browseCompanies: 'Catalog companii',
    contactSupport: 'Contacte & suport',
  },

  forbidden: {
    seoTitle: 'Acces restricționat',
    badge: 'Acces limitat',
    title: 'Nu ai permisiunea pentru acest ecran',
    description:
      'Contul tău este autentificat, dar nu are rolul necesar pentru această secțiune. Dacă crezi că e o greșeală, contactează administratorul companiei.',
    hint: 'Revino în cabinetul tău sau pe pagina principală.',
    goHome: 'Pagina principală',
    goLogin: 'Autentificare',
    contactSupport: 'Contacte & suport',
  },

  routeError: {
    seoTitle: 'Ceva nu a mers bine',
    badge: 'Eroare neașteptată',
    title: 'Am întâmpinat o problemă',
    updateTitle: 'Aplicația s-a actualizat',
    updateMessage:
      'O versiune nouă a platformei este disponibilă. Reîncarcă pagina pentru a continua.',
    description: 'A apărut o eroare neașteptată. Poți reîncerca sau reveni la pagina principală.',
    reload: 'Reîncarcă pagina',
    goHome: 'Pagina principală',
  },
} as const;
