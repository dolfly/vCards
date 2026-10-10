import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/', label: '首页' },
  { to: '/category', label: '行业分类' }
]

export default function GlobalNav() {
  return (
    <nav className="global-nav">
      <div className="global-nav__inner">
        <Link to="/" className="global-nav__brand">
          vCards&nbsp;<span className="global-nav__brand-cn">· 中国常用联系人头像库</span>
        </Link>
        <div className="global-nav__links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                'global-nav__link' + (isActive ? ' is-active' : '')
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            className="global-nav__link"
            href="https://github.com/dolfly/vCards"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}