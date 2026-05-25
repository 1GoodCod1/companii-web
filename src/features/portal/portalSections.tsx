import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile } from '@/api/files';
import {
  PageHero,
  Panel,
  PanelHeader,
  EmptyState,
  SoftBadge,
} from '@/components/cabinet/cabinet-ui';
import { useUpdatePortalQuoteMutation, useUpdatePortalEstimateMutation, usePortalEstimateQuery } from '@/features/portal/api/usePortal';
import { downloadPortalEstimatePdf } from '@/features/estimates/api/useEstimates';
import {
  interventionStatusTone,
  invoiceStatusTone,
  quoteStatusTone,
} from '@/features/portal/portalStatus';
import { useCreateReviewMutation } from '@/features/reviews/api/useReviews';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { StarRating } from '@/components/reviews/StarRating';
import type { PortalDashboardDto } from '@/features/portal/api/usePortal';
import type { PortalInterventionDto } from '@/features/reviews/types';
import type { InvoiceDto, QuoteDto } from '@/features/fsm/types';
import type { EstimateProjectListDto, EstimateStageDto } from '@/features/estimates/types';
import { ESTIMATE_STATUS_LABELS, ESTIMATE_STATUS_TONES } from '@/features/estimates/statusLabels';
import { downloadPortalInvoicePdf } from '@/features/fsm/api/useFsm';
import { PAYMENT_STATUS_LABELS } from '@/features/fsm/statusLabels';

type ReviewTarget = {
  interventionId: string;
  companyId: string;
  companyName: string;
  interventionLabel: string;
};

export function PortalLoading() {
  return <p className="text-sm text-gray-400 animate-pulse">Se încarcă contul tău...</p>;
}

export function PortalError() {
  return (
    <Panel>
      <EmptyState
        message="Nu s-au putut prelua datele tale de client."
        action={
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Contul trebuie legat de profilul client creat de companie. Verifică invitația primită
            sau contactează compania care ți-a deschis accesul.
          </p>
        }
      />
    </Panel>
  );
}

export function PortalHero({ data }: { data: PortalDashboardDto }) {
  const { customer, interventions, quotes, invoices, estimates } = data;
  const pendingQuotes = quotes.filter((q) => q.status === 'SENT').length;
  const pendingEstimates = estimates.filter((e) => e.status === 'SENT').length;
  const activeJobs = interventions.filter(
    (i) => !['COMPLETED', 'PAID', 'CANCELLED'].includes(i.status),
  ).length;

  return (
    <PageHero
      eyebrow="Portal client Faber"
      title={`Salut, ${customer.fullName}! 👋`}
      description="Urmărește lucrările, aprobă oferte și consultă facturile — totul într-un singur loc."
      action={
        <div className="rounded-2xl bg-white/70 px-4 py-3 text-xs text-gray-600 space-y-1.5 shadow-xs min-w-[200px]">
          <p className="truncate">
            <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wide mr-1">
              Adresă
            </span>
            {customer.address}
          </p>
          <p>
            <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-wide mr-1">
              Telefon
            </span>
            {customer.phone}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <SoftBadge tone="violet">{activeJobs} active</SoftBadge>
            <SoftBadge tone="blue">{pendingQuotes} oferte</SoftBadge>
            <SoftBadge tone="amber">{pendingEstimates} smete</SoftBadge>
            <SoftBadge tone="emerald">{invoices.length} facturi</SoftBadge>
          </div>
        </div>
      }
    />
  );
}

export function PortalDashboardOverview({ data }: { data: PortalDashboardDto }) {
  const { interventions, quotes, invoices, reviews, estimates } = data;
  const pendingQuotes = quotes.filter((q) => q.status === 'SENT').length;
  const pendingEstimates = estimates.filter((e) => e.status === 'SENT').length;
  const pendingReviews = interventions.filter((i) => i.canReview).length;

  const cards = [
    {
      label: 'Lucrările mele',
      value: String(interventions.length),
      hint: `${interventions.filter((i) => !['COMPLETED', 'PAID', 'CANCELLED'].includes(i.status)).length} în curs`,
      to: '/portal/lucrari',
      tone: 'from-violet-500/10 to-indigo-500/5',
    },
    {
      label: 'Oferte de aprobat',
      value: String(pendingQuotes),
      hint: pendingQuotes ? 'Necesită răspuns' : 'Nicio ofertă în așteptare',
      to: '/portal/oferte',
      tone: 'from-blue-500/10 to-cyan-500/5',
    },
    {
      label: 'Smete de aprobat',
      value: String(pendingEstimates),
      hint: pendingEstimates ? 'Necesită răspuns' : 'Nicio smetă în așteptare',
      to: '/portal/smete',
      tone: 'from-violet-500/10 to-purple-500/5',
    },
    {
      label: 'Facturile mele',
      value: String(invoices.length),
      hint: `${invoices.filter((i) => i.paymentStatus === 'PAID').length} plătite`,
      to: '/portal/facturi',
      tone: 'from-emerald-500/10 to-teal-500/5',
    },
    {
      label: 'Recenzii trimise',
      value: String(reviews.length),
      hint: pendingReviews ? `${pendingReviews} de lăsat` : 'Mulțumim pentru feedback',
      to: '/portal/lucrari',
      tone: 'from-amber-500/10 to-orange-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          to={card.to}
          className={`block rounded-3xl bg-gradient-to-br ${card.tone} p-5 shadow-premium hover:-translate-y-0.5 transition-transform`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
          <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
          <p className="mt-2 text-xs font-medium text-gray-500">{card.hint}</p>
        </Link>
      ))}
    </div>
  );
}

export function PortalInterventionsSection({ data }: { data: PortalDashboardDto }) {
  const createReview = useCreateReviewMutation();
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const { interventions } = data;
  const pendingReviews = interventions.filter((i) => i.canReview);

  const openReviewModal = (item: PortalInterventionDto) => {
    setReviewTarget({
      interventionId: item.id,
      companyId: item.companyId,
      companyName: item.company?.name ?? 'Companie',
      interventionLabel: `${item.type} · ${item.number}`,
    });
  };

  const handleSubmitReview = async (payload: { rating: number; comment: string }) => {
    if (!reviewTarget) return;
    try {
      await createReview.mutateAsync({
        companyId: reviewTarget.companyId,
        interventionId: reviewTarget.interventionId,
        rating: payload.rating,
        comment: payload.comment || undefined,
      });
      toast.success('Recenzia a fost trimisă. Mulțumim!');
      setReviewTarget(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nu s-a putut trimite recenzia.');
    }
  };

  return (
    <>
      {pendingReviews.length > 0 ? (
        <Panel className="border-amber-100/80 bg-amber-50/40">
          <p className="text-sm font-bold text-amber-900">
            Ai {pendingReviews.length} lucrări finalizate fără recenzie
          </p>
          <p className="text-xs text-amber-800/80 mt-1">
            Părerea ta ajută alți clienți să aleagă servicii de calitate.
          </p>
        </Panel>
      ) : null}

      <Panel>
        <PanelHeader
          title="Solicitările mele"
          meta={
            <span className="text-xs text-gray-400">{interventions.length} lucrări</span>
          }
        />
        {interventions.length === 0 ? (
          <EmptyState message="Nu ai nicio lucrare înregistrată." />
        ) : (
          <ul className="space-y-3">
            {interventions.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white/60 px-4 py-4 hover:bg-violet-50/30 transition-colors space-y-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {item.number}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm mt-0.5">{item.type}</h3>
                    {item.company?.name ? (
                      <p className="text-[11px] text-violet-600 font-semibold mt-1">{item.company.name}</p>
                    ) : null}
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <SoftBadge tone={interventionStatusTone(item.status)}>{item.status}</SoftBadge>
                    <p className="text-[10px] text-gray-400">
                      {item.scheduledAt
                        ? new Date(item.scheduledAt).toLocaleDateString('ro-MD')
                        : 'În procesare'}
                    </p>
                  </div>
                </div>

                {item.review ? (
                  <div className="rounded-xl bg-emerald-50/70 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                        Recenzie trimisă
                      </p>
                      <StarRating value={item.review.rating} size="sm" />
                    </div>
                    {item.review.comment ? (
                      <p className="text-xs text-emerald-900/80 mt-1">{item.review.comment}</p>
                    ) : null}
                  </div>
                ) : item.canReview ? (
                  <button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Lasă recenzie
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <ReviewModal
        open={!!reviewTarget}
        companyName={reviewTarget?.companyName ?? ''}
        interventionLabel={reviewTarget?.interventionLabel ?? ''}
        isSubmitting={createReview.isPending}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}

export function PortalQuotesSection({ data }: { data: PortalDashboardDto }) {
  const updateQuote = useUpdatePortalQuoteMutation();
  const { quotes } = data;

  const handleQuoteStatus = async (quoteId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const word = status === 'ACCEPTED' ? 'acceptați' : 'respingeți';
    if (!confirm(`Sigur doriți să ${word} această ofertă?`)) return;
    try {
      await updateQuote.mutateAsync({ id: quoteId, status });
      toast.success(status === 'ACCEPTED' ? 'Oferta a fost acceptată!' : 'Oferta a fost respinsă.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la actualizarea ofertei.');
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Oferte de aprobat"
        description="Acceptă sau respinge devizele primite de la companie."
        meta={<span className="text-xs text-gray-400">{quotes.length} oferte</span>}
      />
      {quotes.length === 0 ? (
        <EmptyState message="Nu ai oferte în curs de aprobare." />
      ) : (
        <ul className="space-y-3">
          {quotes.map((item: QuoteDto) => (
            <li
              key={item.id}
              className="rounded-2xl bg-white/60 px-4 py-4 hover:bg-violet-50/30 transition-colors space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.number}
                  </span>
                  <p className="font-black text-violet-700 text-lg mt-0.5 tracking-tight">
                    {Number(item.total).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
                </div>
                <SoftBadge tone={quoteStatusTone(item.status)}>{item.status}</SoftBadge>
              </div>
              {item.status === 'SENT' ? (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleQuoteStatus(item.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Declină
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuoteStatus(item.id, 'ACCEPTED')}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Acceptă
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function PortalEstimatesSection({ data }: { data: PortalDashboardDto }) {
  const updateEstimate = useUpdatePortalEstimateMutation();
  const { estimates } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { data: estimateDetail, isLoading: detailLoading } = usePortalEstimateQuery(
    expandedId ?? '',
    !!expandedId,
  );

  const handleEstimateStatus = async (estimateId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const word = status === 'ACCEPTED' ? 'acceptați' : 'respingeți';
    if (!confirm(`Sigur doriți să ${word} această smetă?`)) return;
    try {
      await updateEstimate.mutateAsync({ id: estimateId, status });
      toast.success(status === 'ACCEPTED' ? 'Smeta a fost acceptată!' : 'Smeta a fost respinsă.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la actualizarea smetei.');
    }
  };

  const handleDownloadPdf = async (estimateId: string, number: string) => {
    setDownloadingId(estimateId);
    try {
      await downloadPortalEstimatePdf(estimateId, `${number}.pdf`);
      toast.success('PDF descărcat.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Eroare la descărcarea PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Smete de aprobat"
        description="Acceptă sau respinge smetele primite de la companie."
        meta={<span className="text-xs text-gray-400">{estimates.length} smete</span>}
      />
      {estimates.length === 0 ? (
        <EmptyState message="Nu ai smete în curs de aprobare." />
      ) : (
        <ul className="space-y-3">
          {estimates.map((item: EstimateProjectListDto) => (
            <li
              key={item.id}
              className="rounded-2xl bg-white/60 px-4 py-4 hover:bg-violet-50/30 transition-colors space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.number}
                  </span>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.category.name}</p>
                  <p className="font-black text-violet-700 text-lg mt-1 tracking-tight">
                    {Number(item.grandTotal).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                  </p>
                </div>
                <SoftBadge tone={ESTIMATE_STATUS_TONES[item.status] ?? 'gray'}>
                  {ESTIMATE_STATUS_LABELS[item.status] ?? item.status}
                </SoftBadge>
              </div>
              {item.status === 'SENT' ? (
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleEstimateStatus(item.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Declină
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEstimateStatus(item.id, 'ACCEPTED')}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Acceptă
                  </button>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 justify-end border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  {expandedId === item.id ? 'Ascunde detalii' : 'Vezi detalii'}
                </button>
                <button
                  type="button"
                  disabled={downloadingId === item.id}
                  onClick={() => handleDownloadPdf(item.id, item.number)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {downloadingId === item.id ? 'Se descarcă...' : 'PDF'}
                </button>
              </div>
              {expandedId === item.id ? (
                <div className="rounded-xl bg-slate-50/80 p-4 space-y-3">
                  {detailLoading ? (
                    <p className="text-xs text-gray-400">Se încarcă detaliile...</p>
                  ) : estimateDetail ? (
                    <>
                      {(estimateDetail.stages as EstimateStageDto[]).map((stage) => (
                        <div key={stage.id} className="space-y-1">
                          <p className="text-xs font-bold text-gray-800">{stage.name}</p>
                          <ul className="text-xs text-gray-600 space-y-1.5 mt-2">
                            {(stage.lines ?? []).map((line) => {
                              const isLabor =
                                line.unit === 'ore' ||
                                line.unit === 'h' ||
                                line.description.toLowerCase().includes('manoperă') ||
                                line.description.toLowerCase().includes('manopera');
                              return (
                                <li
                                  key={line.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 p-2.5 shadow-xs border border-slate-100"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-800">{line.description}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                      {Number(line.qty)} {line.unit} ·{' '}
                                      {Number(line.lineTotal ?? 0).toLocaleString('ro-MD')} MDL
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!isLabor && line.materialStore && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200">
                                        Magazin: {line.materialStore}
                                      </span>
                                    )}
                                    {!isLabor && line.receiptFileKey && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadFile(
                                            line.receiptFileKey!,
                                            `Bon-${line.description.replace(/\s+/g, '_')}.pdf`,
                                          )
                                        }
                                        className="inline-flex items-center gap-1 rounded-xl bg-violet-600 hover:bg-violet-700 px-2.5 py-1 text-[9px] font-extrabold text-white transition-all shadow-xs cursor-pointer"
                                      >
                                        <Eye className="w-3 h-3" /> Bon Fiscal
                                      </button>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Detaliile nu sunt disponibile.</p>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function PortalInvoicesSection({ data }: { data: PortalDashboardDto }) {
  const { invoices } = data;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (inv: InvoiceDto) => {
    setDownloadingId(inv.id);
    try {
      await downloadPortalInvoicePdf(inv.id, `${inv.number}.pdf`);
      toast.success('Chitanța PDF a fost descărcată!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Eroare la descărcarea PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Facturile mele"
        description="Istoricul facturilor emise pentru lucrările tale."
        meta={<span className="text-xs text-gray-400">{invoices.length} facturi</span>}
      />
      {invoices.length === 0 ? (
        <EmptyState message="Nu s-a emis nicio factură încă." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-violet-100/60 text-gray-500">
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Număr</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Emitere</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Total cu TVA</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider">Plată</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {invoices.map((inv: InvoiceDto) => (
                <tr key={inv.id} className="hover:bg-violet-50/20 transition-colors">
                  <td className="p-3 font-bold text-gray-800">{inv.number}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {new Date(inv.issuedAt).toLocaleDateString('ro-MD')}
                  </td>
                  <td className="p-3 font-black text-gray-900">
                    {(Number(inv.amount) + Number(inv.tvaAmount)).toLocaleString('ro-MD', {
                      style: 'currency',
                      currency: 'MDL',
                    })}
                  </td>
                  <td className="p-3">
                    <SoftBadge tone={invoiceStatusTone(inv.paymentStatus)}>
                      {PAYMENT_STATUS_LABELS[inv.paymentStatus]}
                    </SoftBadge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(inv)}
                      disabled={downloadingId === inv.id}
                      className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {downloadingId === inv.id ? 'Se generează...' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function PortalReviewsSection({ data }: { data: PortalDashboardDto }) {
  const { reviews } = data;

  return (
    <Panel>
      <PanelHeader title="Recenziile mele" meta={<span className="text-xs text-gray-400">{reviews.length}</span>} />
      {reviews.length === 0 ? (
        <EmptyState message="După finalizarea unei lucrări vei putea lăsa o recenzie din secțiunea Lucrări." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </Panel>
  );
}
