import type { ReactNode } from 'react';

type Props = {
  list: ReactNode;
  detail: ReactNode;
};

export function EntityListDetailLayout({ list, detail }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {list}
      {detail}
    </div>
  );
}
