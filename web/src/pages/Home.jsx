import { Link } from 'react-router-dom'
import { data } from '../lib/data'
import CategoryCard from '../components/CategoryCard'

function scrollToUsage() {
  const el = document.getElementById('usage')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const methods = [
  {
    step: '方式一',
    title: '安装 CardDAV 描述文件',
    desc: '使用系统相机扫描二维码，下载配置描述文件，在「设置」中一键导入，推荐首选。'
  },
  {
    step: '方式二',
    title: '订阅 CardDAV 服务',
    desc: '在 iOS/Mac 通讯录中添加 CardDAV 账户，自动更新，方便区分个人通讯录与黄页。'
  },
  {
    step: '方式三',
    title: '下载导入',
    desc: '前往 Releases 下载 archive.zip，解压后按平台指南手动导入 vcf 至 iCloud。'
  }
]

export default function Home() {
  const preview = data.categories.slice(0, 12)

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <h1 className="hero-title">vCards</h1>
          <p className="hero-tagline">中国常用联系人头像库 —— 导入常用联系人，优化 iOS 来电、信息界面体验。</p>
          <div className="hero-stats">
            <span><strong>{data.total}</strong> 联系人</span>
            <span className="hero-stats__dot">·</span>
            <span><strong>{data.categories.length}</strong> 行业分类</span>
          </div>
          <div className="hero-cta">
            <Link to="/category" className="btn btn--pill">浏览行业分类</Link>
            <button type="button" className="btn btn--ghost-pill" onClick={scrollToUsage}>查看使用方法</button>
          </div>
        </div>
      </section>

      <section className="tile tile--parchment" id="usage">
        <div className="tile__inner">
          <h2 className="tile__title">三种使用方式</h2>
          <p className="tile__lead">选择最适合你的方式，把常用企业联系人导入通讯录。</p>
          <div className="method-grid">
            {methods.map((m) => (
              <div className="method-card" key={m.step}>
                <span className="method-card__step">{m.step}</span>
                <h3 className="method-card__title">{m.title}</h3>
                <p className="method-card__desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tile tile--dark">
        <div className="tile__inner">
          <h2 className="tile__title tile__title--on-dark">覆盖 {data.categories.length} 个行业</h2>
          <p className="tile__lead tile__lead--on-dark">
            从金融银行、证券保险到快递物流、外卖订餐，收录常用企业与公共服务号码。
          </p>
          <div className="tile__cta">
            <Link to="/category" className="btn btn--pill">开始浏览</Link>
            <Link to="/submit" className="btn btn--ghost-pill btn--on-dark">请求收录</Link>
          </div>
        </div>
      </section>

      <section className="tile tile--white">
        <div className="tile__inner">
          <div className="tile__head">
            <h2 className="tile__title">行业分类</h2>
            <Link to="/category" className="text-link">查看全部 ›</Link>
          </div>
          <div className="category-grid">
            {preview.map((c) => (
              <CategoryCard key={c.name} category={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}