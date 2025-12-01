// Exemplo de formulário com react-hook-form + zod (para referência futura)
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '../../utils/validation';
import { Customer } from '../../types/customer';
import { useLanguage } from '../../context/LanguageContext';

interface CustomerFormWithValidationProps {
  customer: Partial<Customer>;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

// Este é um exemplo de como migrar formulários para react-hook-form + zod
// Pode ser usado como referência para migrar outros formulários no futuro
export const CustomerFormWithValidation: React.FC<CustomerFormWithValidationProps> = ({
  customer,
  onSave,
  onCancel,
}) => {
  const { t, language } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer,
  });

  const onSubmit = async (data: Customer) => {
    try {
      await onSave(data);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>{language === 'pt-BR' ? 'Nome' : 'First Name'}</label>
        <input {...register('firstName')} />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>

      <div>
        <label>{language === 'pt-BR' ? 'Sobrenome' : 'Last Name'}</label>
        <input {...register('lastName')} />
        {errors.lastName && <span>{errors.lastName.message}</span>}
      </div>

      <div>
        <label>{language === 'pt-BR' ? 'Endereço' : 'Address'}</label>
        <input {...register('address')} />
        {errors.address && <span>{errors.address.message}</span>}
      </div>

      <div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (language === 'pt-BR' ? 'Salvando...' : 'Saving...') : t('common.save')}
        </button>
        <button type="button" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
};

