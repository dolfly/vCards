/**
 * 生成 React 网页版所需的数据与静态资源：
 *
 * 1. 读取 data/各分类目录下的 YAML，生成 web/src/data/vcards.json（联系人 + 分类汇总）
 * 2. 复制图标 PNG → web/public/icons/<分类>/<文件>.png
 * 3. 复制 VCF（需先运行 `generator` 生成 temp/*.vcf）→ web/public/vcf/<分类>/<文件>.vcf
 *
 * 电话号码 / 邮箱支持两种写法：
 *   - 纯字符串：95526
 *   - 带标签对象：{ number: '95508', label: '信用卡专线' } / { email: 'a@b.com', label: '客服' }
 * 统一归一化为 { number/email, label }。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const WEB_DIR = path.join(ROOT, 'web')
const DATA_OUT = path.join(WEB_DIR, 'src', 'data', 'vcards.json')
const ICONS_DIR = path.join(WEB_DIR, 'public', 'icons')
const VCF_DIR = path.join(WEB_DIR, 'public', 'vcf')

const isObject = (value) => value !== null && typeof value === 'object'

/** 归一化电话号码列表 */
function normalizePhones(raw) {
  const list = Array.isArray(raw) ? raw : []
  return list.map((item) => {
    if (isObject(item) && item.number !== undefined) {
      return { number: String(item.number), label: item.label || null }
    }
    return { number: String(item), label: null }
  })
}

/** 归一化邮箱列表 */
function normalizeEmails(raw) {
  const list = Array.isArray(raw) ? raw : []
  return list.map((item) => {
    if (isObject(item) && item.email !== undefined) {
      return { email: String(item.email), label: item.label || null }
    }
    return { email: String(item), label: null }
  })
}

function readYamlFiles() {
  const categories = fs.readdirSync(DATA_DIR).filter((name) => {
    return fs.statSync(path.join(DATA_DIR, name)).isDirectory()
  })

  const contacts = []
  const cats = []

  for (const category of categories) {
    const dir = path.join(DATA_DIR, category)
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'))

    const categoryContacts = files.map((file) => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8')
      const data = yaml.load(content)
      const basic = (data && data.basic) || {}
      const filename = path.basename(file, '.yaml')

      return {
        organization: basic.organization || filename,
        category,
        filename,
        phones: normalizePhones(basic.cellPhone),
        url: basic.url || null,
        emails: normalizeEmails(basic.workEmail)
      }
    })

    cats.push({
      name: category,
      count: categoryContacts.length,
      sampleIcons: categoryContacts.slice(0, 4).map((c) => c.filename)
    })

    contacts.push(...categoryContacts)
  }

  // 分类按数量降序，便于首页/分类页展示
  cats.sort((a, b) => b.count - a.count)

  return { contacts, categories: cats }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyStaticAssets(contacts) {
  ensureDir(ICONS_DIR)
  ensureDir(VCF_DIR)

  let iconMissing = 0
  let vcfMissing = 0

  for (const c of contacts) {
    const iconSrc = path.join(DATA_DIR, c.category, `${c.filename}.png`)
    const iconDest = path.join(ICONS_DIR, c.category, `${c.filename}.png`)
    if (fs.existsSync(iconSrc)) {
      ensureDir(path.dirname(iconDest))
      fs.copyFileSync(iconSrc, iconDest)
    } else {
      iconMissing += 1
    }

    const vcfSrc = path.join(ROOT, 'temp', c.category, `${c.filename}.vcf`)
    const vcfDest = path.join(VCF_DIR, c.category, `${c.filename}.vcf`)
    if (fs.existsSync(vcfSrc)) {
      ensureDir(path.dirname(vcfDest))
      fs.copyFileSync(vcfSrc, vcfDest)
    } else {
      vcfMissing += 1
    }
  }

  console.log(`复制资源：图标缺失 ${iconMissing} 个，VCF 缺失 ${vcfMissing} 个`)
  if (vcfMissing > 0) {
    console.warn('提示：VCF 缺失，请先运行 `gulp generator` 生成 temp/*.vcf')
  }
}

function main() {
  const { contacts, categories } = readYamlFiles()

  ensureDir(path.dirname(DATA_OUT))
  const payload = {
    generatedAt: new Date().toISOString(),
    total: contacts.length,
    categories,
    contacts
  }
  fs.writeFileSync(DATA_OUT, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`已生成数据：${contacts.length} 个联系人，${categories.length} 个分类 → ${path.relative(ROOT, DATA_OUT)}`)

  copyStaticAssets(contacts)
}

main()