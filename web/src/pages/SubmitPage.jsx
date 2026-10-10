import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { data } from '../lib/data'
import {
  CUSTOM_CATEGORY,
  ISSUE_CHOOSER_URL,
  MAX_ISSUE_URL_LENGTH,
  buildIssueBody,
  buildIssueTitle,
  buildIssueUrl,
  validateSubmission
} from '../lib/submit'
import { CheckIcon, CopyIcon, ExternalIcon } from '../components/icons'

const EMPTY_FORM = {
  category: '',
  customCategory: '',
  organization: '',
  phones: '',
  url: '',
  emails: '',
  note: ''
}

export default function SubmitPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState(false)
  const [copied, setCopied] = useState('')

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const validation = useMemo(() => validateSubmission(form), [form])
  const issueBody = useMemo(() => buildIssueBody(form), [form])
  const issueUrl = useMemo(() => buildIssueUrl(form), [form])
  const tooLong = issueUrl.length > MAX_ISSUE_URL_LENGTH

  const showError = (key) => (touched ? validation.errors[key] : undefined)
  const firstError = touched ? Object.values(validation.errors)[0] : ''

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (!validation.ok || tooLong) return
    window.open(issueUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async (text, mark) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopy(text)
      }
    } catch {
      fallbackCopy(text)
    }
    setCopied(mark)
    window.setTimeout(() => setCopied(''), 1600)
  }

  const fallbackCopy = (value) => {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }

  return (
    <section className="page page--submit">
      <div className="page__header">
        <h1 className="page__title">请求收录</h1>
        <p className="page__lead">
          填写企业与机构信息，提交后将打开预填好的 GitHub Issue，由维护流程完成收录。
          原有的 GitHub 模板提交方式依然可用。
        </p>
      </div>

      <div className="submit-layout">
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="category">类别</label>
            <select
              id="category"
              className="form-select"
              value={form.category}
              onChange={update('category')}
            >
              <option value="">请选择分类</option>
              {data.categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}（{c.count}）</option>
              ))}
              <option value={CUSTOM_CATEGORY}>其他（新增分类）</option>
            </select>
            {form.category === CUSTOM_CATEGORY && (
              <input
                type="text"
                className="form-input"
                style={{ marginTop: 10 }}
                placeholder="填写新的分类名称"
                value={form.customCategory}
                onChange={update('customCategory')}
              />
            )}
            {showError('category') && <p className="form-error">{showError('category')}</p>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="organization">组织名称 <span className="form-required">必填</span></label>
            <input
              id="organization"
              type="text"
              className="form-input"
              placeholder="例如：招商银行"
              value={form.organization}
              onChange={update('organization')}
            />
            {showError('organization') && <p className="form-error">{showError('organization')}</p>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="phones">电话号码</label>
            <textarea
              id="phones"
              className="form-textarea"
              rows={3}
              placeholder={'每行一个，例如：\n95555\n400-820-5555'}
              value={form.phones}
              onChange={update('phones')}
            />
            <p className="form-hint">106 开头的长号码暂不收录；电话与邮箱至少填写一项。</p>
            {showError('phones') && <p className="form-error">{showError('phones')}</p>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="url">官方网址</label>
            <input
              id="url"
              type="url"
              className="form-input"
              placeholder="https://www.example.com"
              value={form.url}
              onChange={update('url')}
            />
            {showError('url') && <p className="form-error">{showError('url')}</p>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="emails">电子邮箱</label>
            <textarea
              id="emails"
              className="form-textarea"
              rows={2}
              placeholder={'每行一个，例如：\nservice@example.com'}
              value={form.emails}
              onChange={update('emails')}
            />
            {showError('emails') && <p className="form-error">{showError('emails')}</p>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="note">备注</label>
            <textarea
              id="note"
              className="form-textarea"
              rows={2}
              placeholder="选填，例如号码用途、图标来源等"
              value={form.note}
              onChange={update('note')}
            />
          </div>

          <div className="form-callout">
            图标无法通过链接携带：提交 Issue 后，请在 Issue 中拖拽上传 PNG（优先 512×512、≤50KB）。
          </div>

          {touched && !validation.ok && firstError && (
            <p className="form-error form-error--summary">请检查表单：{firstError}</p>
          )}
          {tooLong && (
            <p className="form-error form-error--summary">
              内容过长，浏览器可能截断链接。请改用下方「复制正文」后在 GitHub 手动粘贴。
            </p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn--pill" disabled={tooLong}>
              在 GitHub 提交 Issue
            </button>
            <button
              type="button"
              className="btn btn--ghost-pill"
              onClick={() => handleCopy(`${buildIssueTitle(form)}\n\n${issueBody}`, 'body')}
            >
              {copied === 'body' ? <CheckIcon /> : <CopyIcon />} {copied === 'body' ? '已复制' : '复制正文'}
            </button>
          </div>
        </form>

        <aside className="submit-aside">
          <div className="form-card form-card--preview">
            <div className="form-preview__head">
              <h2 className="form-preview__title">Issue 预览</h2>
              <button
                type="button"
                className="text-link"
                onClick={() => handleCopy(`${buildIssueTitle(form)}\n\n${issueBody}`, 'preview')}
              >
                {copied === 'preview' ? '已复制' : '复制'}
              </button>
            </div>
            <p className="form-preview__subject">{buildIssueTitle(form)}</p>
            <pre className="form-preview__body">{issueBody}</pre>
          </div>

          <div className="submit-steps">
            <h2 className="submit-steps__title">提交后会怎样</h2>
            <ol className="submit-steps__list">
              <li>点击「在 GitHub 提交 Issue」，在新页面确认内容。</li>
              <li>补充并拖拽上传图标 PNG，然后提交 Issue。</li>
              <li>收录流程处理完成后，条目会出现在网页与通讯录中。</li>
            </ol>
            <p className="submit-note">
              仍想使用官方模板？<a href={ISSUE_CHOOSER_URL} target="_blank" rel="noopener noreferrer">前往 GitHub 选择模板 <ExternalIcon /></a>
            </p>
            <p className="submit-note">
              需要登录 GitHub 账号才能提交；<Link to="/category">先看看已收录的行业分类</Link>。
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
