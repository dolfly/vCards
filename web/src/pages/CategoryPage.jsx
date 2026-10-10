import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCategory, getContactsByCategory } from '../lib/data'
import ContactCard from '../components/ContactCard'
import { SearchIcon } from '../components/icons'

export default function CategoryPage() {
  const { name } = useParams()
  const category = getCategory(name)
  const contacts = useMemo(() => getContactsByCategory(name || ''), [name])

  const [term, setTerm] = useState('')

  if (!category) {
    return (
      <section className="page">
        <div className="empty">
          <h1 className="page__title">未找到该分类</h1>
          <p className="page__lead">该行业分类不存在或已被移除。</p>
          <Link to="/category" className="btn btn--pill">返回行业分类</Link>
        </div>
      </section>
    )
  }

  const t = term.trim().toLowerCase()
  const filtered = t
    ? contacts.filter(
        (c) =>
          c.organization.toLowerCase().includes(t) ||
          c.phones.some((p) => p.number.replace(/[\s-]/g, '').includes(t.replace(/[\s-]/g, '')))
      )
    : contacts

  return (
    <section className="page">
      <div className="page__header">
        <nav className="breadcrumb">
          <Link to="/">首页</Link>
          <span>/</span>
          <Link to="/category">行业分类</Link>
          <span>/</span>
          <span className="breadcrumb__current">{category.name}</span>
        </nav>
        <h1 className="page__title">{category.name}</h1>
        <p className="page__lead">共 {category.count} 个企业与机构。</p>
      </div>

      <div className="search-wrap">
        <div className="search">
          <SearchIcon />
          <input
            type="text"
            className="search__input"
            placeholder={`在「${category.name}」中搜索`}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <h3 className="empty__title">没有找到匹配的联系人</h3>
          <p className="empty__desc">换一个关键词，或清空搜索。</p>
        </div>
      ) : (
        <div className="contact-grid">
          {filtered.map((c) => (
            <ContactCard key={`${c.category}/${c.filename}`} contact={c} />
          ))}
        </div>
      )}
    </section>
  )
}