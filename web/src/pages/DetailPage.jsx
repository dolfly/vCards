import { Link, useParams } from 'react-router-dom'
import { findContact, iconUrl, vcfUrl } from '../lib/data'
import { DialButton, CopyButton } from '../components/CopyButton'
import { DownloadIcon, GlobeIcon, MailIcon } from '../components/icons'

function fallbackIcon() {
  const svg = `<svg width="240" height="240" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#f5f5f7"/><path d="M12 6.5A5.5 5.5 0 0 1 17.5 12 5.5 5.5 0 0 1 12 17.5 5.5 5.5 0 0 1 6.5 12 5.5 5.5 0 0 1 12 6.5Z" fill="#c7c7cc"/><path d="M12 9a3 3 0 0 1 3 3" stroke="#8e8e93" stroke-width="1.6" stroke-linecap="round"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function DetailPage() {
  const { category, filename } = useParams()
  const contact = findContact(category, filename)

  if (!contact) {
    return (
      <section className="page">
        <div className="empty">
          <h1 className="page__title">未找到该联系人</h1>
          <p className="page__lead">该联系人不存在或已被移除。</p>
          <Link to="/category" className="btn btn--pill">返回行业分类</Link>
        </div>
      </section>
    )
  }

  const downloadName = `${contact.organization}.vcf`

  return (
    <section className="page page--detail">
      <nav className="breadcrumb">
        <Link to="/">首页</Link>
        <span>/</span>
        <Link to="/category">行业分类</Link>
        <span>/</span>
        <Link to={`/category/${encodeURIComponent(contact.category)}`}>{contact.category}</Link>
        <span>/</span>
        <span className="breadcrumb__current">{contact.organization}</span>
      </nav>

      <div className="detail">
        <div className="detail__head">
          <img
            className="detail__icon"
            src={iconUrl(contact)}
            alt={contact.organization}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackIcon() }}
          />
          <div className="detail__title">
            <h1 className="detail__org">{contact.organization}</h1>
            <Link to={`/category/${encodeURIComponent(contact.category)}`} className="detail__category">
              {contact.category}
            </Link>
          </div>
          <div className="detail__actions">
            <a className="btn btn--pill" href={vcfUrl(contact)} download={downloadName}>
              <DownloadIcon /> 下载 vCard
            </a>
          </div>
        </div>

        <div className="detail__sections">
          {contact.phones.length > 0 && (
            <div className="detail__section">
              <h2 className="detail__section-title">电话号码</h2>
              <ul className="phone-list">
                {contact.phones.map((p, i) => (
                  <li className="phone-row" key={`${p.number}-${i}`}>
                    <div className="phone-row__num">
                      {p.label && <span className="phone-label">{p.label}</span>}
                      <span className="phone-value">{p.number}</span>
                    </div>
                    <div className="phone-row__actions">
                      <DialButton number={p.number} label={p.label ? `拨打 ${p.label}` : '拨打'} />
                      <CopyButton text={p.number} label={p.label ? `复制 ${p.label}` : '复制号码'} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contact.url && (
            <div className="detail__section">
              <h2 className="detail__section-title">官方网站</h2>
              <a className="detail__link" href={contact.url} target="_blank" rel="noopener noreferrer">
                <GlobeIcon /> {contact.url}
              </a>
            </div>
          )}

          {contact.emails.length > 0 && (
            <div className="detail__section">
              <h2 className="detail__section-title">邮箱地址</h2>
              <ul className="email-list">
                {contact.emails.map((e, i) => (
                  <li className="email-item" key={`${e.email}-${i}`}>
                    {e.label && <span className="phone-label">{e.label}</span>}
                    <a className="detail__link" href={`mailto:${e.email}`}>
                      <MailIcon /> {e.email}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}