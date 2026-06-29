export function PanelHeader({title, subtitle}: {title: string; subtitle?: string}) {
  return (
    <div className="cw-panel-header">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
