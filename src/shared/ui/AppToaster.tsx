import { Toaster } from 'react-hot-toast';

const toastStyle = {
  background: '#ffffff',
  color: '#0f172a',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  boxShadow:
    '0 8px 30px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(124, 58, 237, 0.05)',
  fontSize: '0.8125rem',
  fontWeight: '600',
  lineHeight: '1.4',
  padding: '0.875rem 1rem',
  maxWidth: 'min(22rem, calc(100vw - 2rem))',
} as const;

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      containerStyle={{
        bottom: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: toastStyle,
        success: {
          style: {
            ...toastStyle,
            borderLeft: '3px solid #059669',
            paddingLeft: 'calc(1rem - 2px)',
          },
          iconTheme: {
            primary: '#059669',
            secondary: '#ecfdf5',
          },
        },
        error: {
          style: {
            ...toastStyle,
            borderLeft: '3px solid #e11d48',
            paddingLeft: 'calc(1rem - 2px)',
          },
          iconTheme: {
            primary: '#e11d48',
            secondary: '#fff1f2',
          },
        },
      }}
    />
  );
}
