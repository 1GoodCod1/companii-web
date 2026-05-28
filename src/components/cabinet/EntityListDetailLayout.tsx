import type { ReactNode } from 'react';

interface Props {
  list: ReactNode;
  detail?: ReactNode;
}

export function EntityListDetailLayout({ list, detail }: Props) {
  if (!detail) {
    return <div className="space-y-4">{list}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* On mobile: list takes full width, detail below */}
      {/* On lg+: classic 1:2 split */}
      <div className="lg:col-span-1 order-1 lg:order-none">
        {list}
      </div>
      <div className="lg:col-span-2 order-2 lg:order-none">
        {detail}
      </div>
    </div>
  );
}