import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AppModal } from '@/components/ui/AppModal';
import { FormFieldError } from '@/components/ui/FormFieldError';
import {
  cabinetFieldClass,
  cabinetLabelClass,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
} from '@/components/cabinet/cabinet-ui';
import type { CustomerDto } from '@/types/fsm';
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '@/features/fsm/api/useCustomers';
import { getErrorMessage } from '@/utils/errors';
import { fieldClassName } from '@/lib/forms/fieldClassName';
import {
  createCustomerSchema,
  type CustomerFormValues,
} from '@/lib/forms/schemas/customerSchema';
import { showFirstFormError } from '@/lib/forms/showFirstFormError';

type Props = {
  open: boolean;
  onClose: () => void;
  editingCustomer: CustomerDto | null;
};

type FormBodyProps = {
  editingCustomer: CustomerDto | null;
  onClose: () => void;
};

function CustomerFormBody({ editingCustomer, onClose }: FormBodyProps) {
  const { t } = useTranslation();
  const createCustomer = useCreateCustomerMutation();
  const updateCustomer = useUpdateCustomerMutation();

  const schema = useMemo(() => createCustomerSchema(t), [t]);
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: editingCustomer?.fullName ?? '',
      phone: editingCustomer?.phone ?? '',
      email: editingCustomer?.email ?? '',
      address: editingCustomer?.address ?? '',
      notes: editingCustomer?.notes ?? '',
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        if (editingCustomer) {
          await updateCustomer.mutateAsync({
            id: editingCustomer.id,
            fullName: values.fullName,
            phone: values.phone,
            email: values.email || undefined,
            address: values.address,
            notes: values.notes || undefined,
          });
          toast.success(t('company.fsm.customers.form.toast.updated'));
        } else {
          await createCustomer.mutateAsync({
            fullName: values.fullName,
            phone: values.phone,
            email: values.email || undefined,
            address: values.address,
            notes: values.notes || undefined,
          });
          toast.success(t('company.fsm.customers.form.toast.created'));
        }
        onClose();
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, t('company.fsm.common.errorGeneric')));
      }
    },
    (validationErrors) => showFirstFormError(validationErrors),
  );

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div>
        <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.fullName')}</label>
        <input
          type="text"
          placeholder={t('company.fsm.customers.form.fields.fullNamePlaceholder')}
          className={fieldClassName(cabinetFieldClass, !!errors.fullName)}
          {...register('fullName')}
        />
        <FormFieldError message={errors.fullName?.message} />
      </div>

      <div>
        <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.phone')}</label>
        <input
          type="text"
          placeholder={t('company.fsm.customers.form.fields.phonePlaceholder')}
          className={fieldClassName(cabinetFieldClass, !!errors.phone)}
          {...register('phone')}
        />
        <FormFieldError message={errors.phone?.message} />
      </div>

      <div>
        <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.email')}</label>
        <input
          type="email"
          placeholder={t('company.fsm.customers.form.fields.emailPlaceholder')}
          className={fieldClassName(cabinetFieldClass, !!errors.email)}
          {...register('email')}
        />
        <FormFieldError message={errors.email?.message} />
      </div>

      <div>
        <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.address')}</label>
        <input
          type="text"
          placeholder={t('company.fsm.customers.form.fields.addressPlaceholder')}
          className={fieldClassName(cabinetFieldClass, !!errors.address)}
          {...register('address')}
        />
        <FormFieldError message={errors.address?.message} />
      </div>

      <div>
        <label className={cabinetLabelClass}>{t('company.fsm.customers.form.fields.notes')}</label>
        <textarea
          placeholder={t('company.fsm.customers.form.fields.notesPlaceholder')}
          rows={3}
          className={`${fieldClassName(cabinetFieldClass, !!errors.notes)} resize-none`}
          {...register('notes')}
        />
        <FormFieldError message={errors.notes?.message} />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={cabinetBtnSecondary}>
          {t('cabinet.common.cancel')}
        </button>
        <button
          type="submit"
          disabled={createCustomer.isPending || updateCustomer.isPending}
          className={cabinetBtnPrimary}
        >
          {t('cabinet.common.save')}
        </button>
      </div>
    </form>
  );
}

export function CustomerFormModal({ open, onClose, editingCustomer }: Props) {
  const { t } = useTranslation();
  const formKey = editingCustomer?.id ?? 'create';

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        editingCustomer
          ? t('company.fsm.customers.form.titleEdit')
          : t('company.fsm.customers.form.titleCreate')
      }
      size="lg"
      backgroundIndex={1}
    >
      {open ? <CustomerFormBody key={formKey} editingCustomer={editingCustomer} onClose={onClose} /> : null}
    </AppModal>
  );
}
