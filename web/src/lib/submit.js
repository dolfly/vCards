/**
 * vCard 收录请求的纯逻辑：表单校验、Issue 正文/标题生成与预填链接。
 *
 * 字段与 `.github/ISSUE_TEMPLATE/vcard-create.md` 保持一致，
 * 生成的正文可直接作为 GitHub Issue 内容，进入既有的收录处理流程。
 * 本模块不依赖 React / 浏览器 API，方便单元测试。
 */

/** 仓库地址与新建 Issue 入口 */
export const GITHUB_REPO = 'https://github.com/dolfly/vCards'
export const NEW_ISSUE_URL = `${GITHUB_REPO}/issues/new`
export const ISSUE_CHOOSER_URL = `${GITHUB_REPO}/issues/new/choose`

/** 分类选项中的「其他」占位值 */
export const CUSTOM_CATEGORY = '__custom__'

/** 预填 URL 过长时回退为复制正文（各浏览器 URL 上限不一致，取保守值） */
export const MAX_ISSUE_URL_LENGTH = 7000

const PHONE_RE = /^\+?[\d\s()（）.-]+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https?:\/\/\S+$/i

/** 按行拆分并去除空白行 */
export function splitLines(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/** 把「其他分类」占位值替换为用户自定义分类名 */
export function resolveCategory(form) {
  const category = (form.category || '').trim()
  if (category === CUSTOM_CATEGORY) {
    return (form.customCategory || '').trim()
  }
  return category
}

/**
 * 校验提交表单。
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateSubmission(form) {
  const errors = {}
  const category = resolveCategory(form)
  const organization = (form.organization || '').trim()
  const phones = splitLines(form.phones)
  const url = (form.url || '').trim()
  const emails = splitLines(form.emails)

  if (!category) {
    errors.category = '请选择分类，或选择「其他」后填写新分类名称'
  }
  if (!organization) {
    errors.organization = '请填写组织名称'
  }
  if (phones.length === 0 && emails.length === 0) {
    errors.phones = '请至少填写一个电话号码或邮箱'
  }
  for (const phone of phones) {
    const digits = phone.replace(/\D/g, '')
    if (!PHONE_RE.test(phone) || digits.length < 5) {
      errors.phones = `电话号码格式不正确：${phone}`
      break
    }
  }
  if (url && !URL_RE.test(url)) {
    errors.url = '网址需以 http:// 或 https:// 开头'
  }
  for (const email of emails) {
    if (!EMAIL_RE.test(email)) {
      errors.emails = `邮箱格式不正确：${email}`
      break
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}

/** Issue 标题：[vCard 新增请求] 组织名称 */
export function buildIssueTitle(form) {
  const organization = (form.organization || '').trim() || '未命名'
  return `[vCard 新增请求] ${organization}`
}

/** 按 issue 模板字段格式生成 Markdown 正文 */
export function buildIssueBody(form) {
  const lines = ['### vCard 新增请求', '']
  lines.push(`- **类别**：${resolveCategory(form) || '（未填写）'}`)
  lines.push(`- **组织名称**：${(form.organization || '').trim() || '（未填写）'}`)

  const phones = splitLines(form.phones)
  if (phones.length > 0) {
    lines.push('- **电话号码**：')
    for (const phone of phones) lines.push(`  - ${phone}`)
  } else {
    lines.push('- **电话号码**：（未填写）')
  }

  lines.push(`- **官方网址**：${(form.url || '').trim() || '（未填写）'}`)

  const emails = splitLines(form.emails)
  if (emails.length > 0) {
    lines.push('- **电子邮箱**：')
    for (const email of emails) lines.push(`  - ${email}`)
  } else {
    lines.push('- **电子邮箱**：（未填写）')
  }

  const note = (form.note || '').trim()
  if (note) lines.push(`- **备注**：${note}`)

  lines.push('')
  lines.push('<!-- 请在提交后于本 Issue 中拖拽上传 PNG 图标（优先 512×512、≤50KB；圆形有效区 140×140）。 -->')
  return lines.join('\n')
}

/** 生成预填标题与正文的 GitHub 新建 Issue 链接 */
export function buildIssueUrl(form, base = NEW_ISSUE_URL) {
  const query = [
    ['title', buildIssueTitle(form)],
    ['body', buildIssueBody(form)]
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  return `${base}?${query}`
}
