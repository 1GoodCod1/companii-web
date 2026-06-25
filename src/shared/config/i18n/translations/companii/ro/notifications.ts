export const companiiRoNotifications = {
  notifications: {
    title: 'Notificări',
    markAllRead: 'Marchează toate citite',
    deleteAll: 'Șterge toate',
    emptyTitle: 'Nicio notificare',
    newBadge: 'Nou',
    newToast: 'Notificare nouă',
    // Localized notification bodies, keyed by `metadata.i18nKey` set by the API.
    // If a key is missing, the stored (Romanian) title/message is shown instead.
    messages: {
      newLead: {
        title: 'Cerere nouă',
        client: 'Client: {{contactName}} ({{contactPhone}})',
        service: 'Serviciu/Proiect: {{serviceTitle}}',
        budget: 'Buget estimativ: {{budget}} lei',
      },
      estimateSent: {
        title: 'Calcul de preț nou',
        body: '{{companyName}} v-a trimis calculul de preț #{{number}} „{{title}}” spre examinare.',
      },
      estimateAccepted: {
        title: 'Calcul acceptat',
        body: 'Clientul {{clientName}} a acceptat calculul de preț #{{number}} — {{title}}.',
      },
      estimateRejected: {
        title: 'Calcul respins',
        body: 'Clientul {{clientName}} a respins calculul de preț #{{number}} — {{title}}.',
      },
      estimateFeedback: {
        title: 'Comentariu la calcul',
        body: 'Clientul {{clientName}} a lăsat un comentariu la calculul #{{number}} — {{title}}:\n\n„{{comment}}”',
      },
      interventionScheduled: {
        title: 'Lucrare programată',
        body: 'Lucrarea #{{number}} a fost programată.',
        bodyDated: 'Lucrarea #{{number}} a fost programată pentru {{date}}.',
      },
      interventionCompleted: {
        title: 'Lucrare finalizată',
        body: 'Lucrarea #{{number}} a fost finalizată.',
      },
      invoiceIssued: {
        title: 'Factură nouă',
        body: '{{companyName}} v-a emis factura #{{number}} în valoare de {{total}} MDL.',
      },
      paymentConfirmed: {
        title: 'Plată confirmată',
        body: 'Plata pentru factura #{{number}} a fost confirmată. Vă mulțumim!',
      },
    },
  },
};
