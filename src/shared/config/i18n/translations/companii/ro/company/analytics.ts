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
        subtitle: 'Volumul tranzacțiilor în perioada selectată',
        empty: 'Nicio activitate în perioada selectată.',
        series: 'Tranzacții',
        leads: 'Lead-uri',
        quotes: 'Oferte',
        accepted: 'Acceptate',
        completed: 'Finalizate',
        paid: 'Plătite',
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
