'use client';

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
  costPerUnit?: number;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Barra de progresso que mostra usado vs limite.
 * Cor muda conforme percentual: success < 70%, warning 70-90%, error > 90%.
 */
export function UsageBar({ label, used, limit, unit = 'unidades', costPerUnit = 0 }: UsageBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const colorClass =
    pct > 90 ? 'bg-error' : pct >= 70 ? 'bg-warning' : 'bg-success';
  const textColorClass =
    pct > 90 ? 'text-error' : pct >= 70 ? 'text-warning' : 'text-success';
  const cost = used * costPerUnit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-brand-text">{label}</span>
        <span className={`font-semibold ${textColorClass}`}>
          {used.toLocaleString('pt-BR')} / {limit.toLocaleString('pt-BR')} {unit}
        </span>
      </div>
      <div
        className="w-full h-2.5 rounded-full bg-brand-elevated overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${used} de ${limit} ${unit} usados`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {costPerUnit > 0 && (
        <div className="text-xs text-brand-text-secondary">
          {currencyFormatter.format(cost)} usado · {currencyFormatter.format(costPerUnit)} por {unit.replace(/s$/, '')}
        </div>
      )}
    </div>
  );
}
