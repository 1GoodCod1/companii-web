import { Panel, EmptyState } from '@/components/cabinet/cabinet-ui';

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
