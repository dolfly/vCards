import { Link } from 'react-router-dom'
import { iconUrl } from '../lib/data'
import { DialButton, CopyButton } from './CopyButton'

function fallbackDataUri(label) {
  const svg = `
    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#f5f5f7"/>
      <path d="M12 6.5A5.5 5.5 0 0 1 17.5 12 5.5 5.5 0 0 1 12 17.5 5.5 5.5 0 0 1 6.5 12 5.5 5.5 0 0 1 12 6.5Z" fill="#c7c7cc"/>
      <path d="M12 9a3 3 0 0 1 3 3" stroke="#8e8e93" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export default function ContactCard({ contact }) {
  const detailPath = `/detail/${encodeURIComponent(contact.category)}/${encodeURIComponent(contact.filename)}`
  const firstPhone = contact.phones[0]

  return (
    <article className="contact-card">
      <Link to={detailPath} className="contact-card__main">
        <img
          className="contact-card__icon"
          src={iconUrl(contact)}
          alt={contact.organization}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackDataUri(contact.organization) }}
        />
        <div className="contact-card__meta">
          <h3 className="contact-card__title">{contact.organization}</h3>
          <span className="contact-card__category">{contact.category}</span>
        </div>
      </Link>

      <div className="contact-card__actions">
        {firstPhone && (
          <div className="contact-card__phone">
            <div className="contact-card__phone-num">
              {firstPhone.label && <span className="phone-label">{firstPhone.label}</span>}
              <span className="phone-value">{firstPhone.number}</span>
              {contact.phones.length > 1 && (
                <span className="phone-more">+{contact.phones.length - 1}</span>
              )}
            </div>
            <div className="contact-card__btns">
              <DialButton number={firstPhone.number} />
              <CopyButton text={firstPhone.number} />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}