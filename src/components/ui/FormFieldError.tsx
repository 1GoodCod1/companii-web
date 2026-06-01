type FormFieldErrorProps = {
  message?: string;
};

export function FormFieldError({ message }: FormFieldErrorProps) {
  if (!message) return null;

  return <p className="text-xs text-red-600 mt-1 leading-snug">{message}</p>;
}
