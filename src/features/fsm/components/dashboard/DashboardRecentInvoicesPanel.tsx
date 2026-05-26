import { Link } from 'react-router-dom';
import { Panel, PanelHeader, EmptyState } from '@/components/cabinet/cabinet-ui';
import type { InvoiceDto } from '@/types/fsm';
import { paymentStatusClass } from '@/utils/dashboard';
import { formatDateRo } from '@/utils/date';

export function DashboardRecentInvoicesPanel({ invoices }: { invoices: InvoiceDto[] | undefined }) {
  return (
    <Panel>
      <PanelHeader
        title="Facturi recente"
        action={
          <Link to="/company/facturi" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
            Vezi toate
          </Link>
        }
      />

      {!invoices?.length ? (
        <EmptyState
          message="Nicio factură emisă în acest moment."
          action={
            <Link to="/company/facturi" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
              + Generează factură
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {invoices.slice(0, 5).map((inv) => (
            <div
              key={inv.id}
              className="flex justify-between items-center gap-4 rounded-2xl bg-white/70 px-4 py-3.5 transition-colors hover:bg-violet-50/40"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{inv.number}</span>
                <h3 className="font-bold text-gray-800 text-sm mt-0.5">
                  {Number(inv.amount).toLocaleString('ro-MD', { style: 'currency', currency: 'MDL' })}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {inv.intervention?.customer?.fullName || 'Client pachet'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusClass(inv.paymentStatus)}`}
                >
                  {inv.paymentStatus}
                </span>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Scadent: {inv.dueDate ? formatDateRo(inv.dueDate) : 'Imediat'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
