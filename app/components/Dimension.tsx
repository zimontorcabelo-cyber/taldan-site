import CountUp from './CountUp';

/**
 * A figure set as a dimension callout — witness lines, measure bars and the
 * value sitting in the run, exactly as a dimension is annotated on a plan.
 * Numeric values count into place when scrolled into view; pass `countFrom`
 * to start that count from a different number than 0 (e.g. counting down
 * from the current year to a founding year). Text values (a classification
 * code) render directly. Renders em-dashes when no value has been supplied.
 */
export default function Dimension({
  value,
  label,
  countFrom,
}: {
  value?: string | number | null;
  label: string;
  countFrom?: number;
}) {
  const has = value !== null && value !== undefined && value !== '';
  const numeric =
    has && (typeof value === 'number' || (typeof value === 'string' && /^[\d,]+$/.test(value)));

  return (
    <div className="dim">
      <div className="dim-line">
        <span className="dim-tick" />
        <span className="dim-bar" />
        <span className={has ? 'dim-val' : 'dim-val pending'}>
          {has
            ? numeric
              ? (
                <CountUp
                  value={typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''))}
                  from={countFrom}
                />
              )
              : value
            : '––'}
        </span>
        <span className="dim-bar" />
        <span className="dim-tick" />
      </div>
      <div className="dim-label">{label}</div>
    </div>
  );
}
