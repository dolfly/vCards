import { Link } from 'react-router-dom'
import { data } from '../lib/data'

function sampleIconUrl(category) {
  const first = data.contacts.find((c) => c.category === category.name)
  if (!first) return null
  return `icons/${encodeURIComponent(first.category)}/${encodeURIComponent(first.filename)}.png`
}

function fallbackIcon() {
  const svg = `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#f5f5f7"/><path d="M12 6.5A5.5 5.5 0 0 1 17.5 12 5.5 5.5 0 0 1 12 17.5 5.5 5.5 0 0 1 6.5 12 5.5 5.5 0 0 1 12 6.5Z" fill="#c7c7cc"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function CategoryCard({ category }) {
  const src = sampleIconUrl(category)
  return (
    <Link to={`/category/${encodeURIComponent(category.name)}`} className="category-card">
      <div className="category-card__icon-wrap">
        <img
          className="category-card__icon"
          src={src || undefined}
          alt={category.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackIcon() }}
        />
      </div>
      <div className="category-card__meta">
        <h3 className="category-card__name">{category.name}</h3>
        <span className="category-card__count">{category.count} 个联系人</span>
      </div>
    </Link>
  )
}