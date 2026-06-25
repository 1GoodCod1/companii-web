export const companiiRoCompanyAnalytics = {
  analytics: {
    title: 'Analiză business',
    subtitle: 'Indicatorii cheie ai companiei tale',
    error: 'Nu am putut încărca datele analitice. Încearcă din nou.',
    period: {
      '30d': '30 zile',
      '90d': '90 zile',
      '12m': '12 luni',
    },
    charts: {
      revenue: {
        title: 'Evoluția veniturilor',
        subtitle: 'Facturat vs. încasat în perioada selectată',
        empty: 'Nicio factură emisă în perioada selectată.',
        invoiced: 'Facturat',
        collected: 'Încasat',
      },
      invoiceStatus: {
        title: 'Creanțe după status',
        subtitle: 'Situația curentă a facturilor (fără cele anulate)',
        empty: 'Nu există facturi.',
        total: 'Total',
      },
      pipeline: {
        title: 'Pâlnie vânzări',
        subtitle: 'Câte evenimente au avut loc la fiecare etapă în perioada selectată',
        hint:
          'Fiecare etapă este numărată separat — nu neapărat aceleași cereri de la început până la plată. Lățimea barei arată volumul relativ față de etapa cu cele mai multe înregistrări.',
        empty: 'Nicio activitate în perioada selectată.',
        series: 'Tranzacții',
        leads: 'Cereri',
        quotes: 'Oferte',
        accepted: 'Oferte acceptate',
        completed: 'Lucrări finalizate',
        paid: 'Facturi plătite',
        stageDesc: {
          leads: 'Cereri noi create în perioada selectată',
          quotes: 'Oferte (devize) emise în perioada selectată',
          accepted: 'Oferte acceptate sau convertite în lucrare',
          completed: 'Lucrări create în perioadă, deja finalizate sau facturate',
          paid: 'Facturi emise în perioadă și plătite integral',
        },
        insightPaid:
          '{{paid}} din {{completed}} lucrări finalizate au factură plătită în perioadă ({{rate}}%).',
      },
      workload: {
        title: 'Volum lucrări',
        subtitle: 'Distribuția curentă pe status',
        empty: 'Nu există lucrări.',
        series: 'Lucrări',
      },
    },
  },
};
