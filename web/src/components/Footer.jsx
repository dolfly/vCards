import { Link } from 'react-router-dom'
import { data } from '../lib/data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col">
          <p className="footer__heading">vCards CN</p>
          <p className="footer__text">
            中国常用联系人头像库，收录 {data.total} 个企业与机构、{data.categories.length} 个行业分类，
            优化 iOS 来电与信息界面体验。
          </p>
        </div>
        <div className="footer__col">
          <p className="footer__heading">链接</p>
          <ul className="footer__list">
            <li>
              <a href="https://github.com/dolfly/vCards" target="_blank" rel="noopener noreferrer">
                GitHub 仓库
              </a>
            </li>
            <li>
              <a href="https://github.com/dolfly/vCards/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                MIT 许可证
              </a>
            </li>
            <li>
              <Link to="/submit">请求收录</Link>
            </li>
            <li>
              <a href="https://github.com/dolfly/vCards/issues/new/choose" target="_blank" rel="noopener noreferrer">
                GitHub 模板提交
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__legal">
        <p>本项目为基础模板，数据来源于公开信息，仅供参考。</p>
        <p>© {new Date().getFullYear()} vCards CN · 基于 metowolf/vCards 构建</p>
      </div>
    </footer>
  )
}