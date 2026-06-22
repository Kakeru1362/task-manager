export interface Crumb {
  label: string
  onClick?: () => void
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="現在地">
      {items.map((c, i) => (
        <span key={i} className="crumb">
          {c.onClick ? (
            <button className="link" onClick={c.onClick}>
              {c.label}
            </button>
          ) : (
            <span className="crumb-current">{c.label}</span>
          )}
          {i < items.length - 1 && <span className="crumb-sep">›</span>}
        </span>
      ))}
    </nav>
  )
}
