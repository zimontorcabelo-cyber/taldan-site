'use client';

type Project = {
  id: string;
  title: string;
  year?: number | null;
};

/**
 * A horizontal ruler from the founding year to the present, in the same
 * dimension-line language used elsewhere on the site. Projects with a year
 * set land on their tick as a small card; years with none still render as
 * plain ticks, so the ruler works today and fills in as projects get dated.
 */
export default function Timeline({
  foundedYear,
  currentYear,
  projects,
}: {
  foundedYear: number;
  currentYear: number;
  projects: Project[];
}) {
  const years: number[] = [];
  for (let y = foundedYear; y <= currentYear; y++) years.push(y);
  const dated = projects.filter((p) => typeof p.year === 'number');

  return (
    <div className="tl-wrap">
      <div className="tl-scroll">
        <div className="tl-track" style={{ width: `${years.length * 92}px` }}>
          <div className="tl-line" aria-hidden="true" />
          {years.map((y) => {
            const yearProjects = dated.filter((p) => p.year === y);
            return (
              <div className="tl-tick" key={y}>
                {yearProjects.length > 0 && (
                  <div className="tl-cards">
                    {yearProjects.map((p) => (
                      <div className="tl-card" key={p.id}>{p.title}</div>
                    ))}
                  </div>
                )}
                <span className="tl-dot" />
                <span className="tl-year">{y}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
