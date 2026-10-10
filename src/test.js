import fs from 'fs'
import path from 'path'
import test from 'ava'
import yaml from 'js-yaml'
import { readChunkSync } from 'read-chunk'
import imageSize from 'image-size'
import prettyBytes from 'pretty-bytes'
import isPng from './utils/isPng.js'
import blockList from './const/block.js'
import schema from './const/schema.js'
import {
  CUSTOM_CATEGORY,
  buildIssueBody,
  buildIssueTitle,
  buildIssueUrl,
  splitLines,
  validateSubmission
} from '../web/src/lib/submit.js'

const checkImage = (t, filePath) => {
  const buffer = readChunkSync(filePath, {
    startPosition: 0,
    length: 8
  })
  if (!isPng(buffer)) {
    t.fail('图片格式不合法')
  }
  const dimensions = imageSize(filePath)
  const lstat = fs.lstatSync(filePath)

  // 支持两种规格：200x200px/20KB 或 512x512px/50KB
  const is200 = dimensions.width === 200 && dimensions.height === 200
  const is512 = dimensions.width === 512 && dimensions.height === 512

  if (!is200 && !is512) {
    t.fail(`图片尺寸不合法 ${dimensions.width}x${dimensions.height}，需要 200x200 或 512x512`)
  }

  const sizeLimit = is512 ? 1024 * 50 : 1024 * 20
  if (lstat.size > sizeLimit) {
    t.fail(`图片文件体积超过限制 ${prettyBytes(lstat.size)}`)
  }
  t.pass()
}

const checkVCard = (t, filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  const json = yaml.load(data)

  // 检查 schema
  const { value, error } = schema.validate(json)
  if (error) {
    t.fail(`schema 校验失败 ${error.message}, ${JSON.stringify(value)}`)
  }

  for (const block of blockList) {
    if (block.organization === json.basic.organization) {
      t.fail(`不收录 ${block.organization}，原因：${block.reason}`)
    }
  }

  t.pass()
}

const getYamlPaths = () => {
  const base = 'data'
  const categories = fs.readdirSync(base, { withFileTypes: true })
  const paths = []
  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const files = fs.readdirSync(path.join(base, cat.name))
    for (const file of files) {
      if (file.endsWith('.yaml')) {
        paths.push(path.join(base, cat.name, file))
      }
    }
  }
  return paths
}

const yamlPaths = getYamlPaths()

test('Validation/no-duplicate-phones', t => {
  const phoneMap = new Map()
  const duplicates = []

  for (const filePath of yamlPaths) {
    const data = fs.readFileSync(filePath, 'utf8')
    const json = yaml.load(data)
    const phones = json?.basic?.cellPhone ?? []

    for (const phone of phones) {
      const phoneStr = typeof phone === 'object' ? phone.number : phone
      const normalized = String(phoneStr).replace(/\D/g, '')
      if (phoneMap.has(normalized)) {
        duplicates.push(`${normalized}: ${phoneMap.get(normalized)} 和 ${filePath}`)
      } else {
        phoneMap.set(normalized, filePath)
      }
    }
  }

  t.is(
    duplicates.length,
    0,
    `发现重复电话号码:\n${duplicates.join('\n')}`
  )
})

for (const filePath of yamlPaths) {
  const type = filePath.split('/')[1]
  const name = filePath.split('/')[2].split('.')[0]
  test(`Image/${type}/${name}`, checkImage, `data/${type}/${name}.png`)
  test(`vCard/${type}/${name}`, checkVCard, `data/${type}/${name}.yaml`)
}

/* ---------- 网页版「请求收录」纯逻辑 ---------- */

const validForm = {
  category: '金融银行',
  organization: '示例银行',
  phones: '95588\n400-000-0000',
  url: 'https://example.com',
  emails: 'service@example.com',
  note: '客户服务热线'
}

test('Submit/splitLines-ignores-blank', t => {
  t.deepEqual(splitLines(' 95588 \n\n  400-1 \r\n'), ['95588', '400-1'])
  t.deepEqual(splitLines(undefined), [])
})

test('Submit/valid-form-passes', t => {
  const result = validateSubmission(validForm)
  t.true(result.ok)
  t.deepEqual(result.errors, {})
})

test('Submit/requires-organization', t => {
  const result = validateSubmission({ ...validForm, organization: '  ' })
  t.false(result.ok)
  t.truthy(result.errors.organization)
})

test('Submit/requires-phone-or-email', t => {
  const result = validateSubmission({ ...validForm, phones: '', emails: '' })
  t.false(result.ok)
  t.truthy(result.errors.phones)
})

test('Submit/rejects-bad-phone', t => {
  const result = validateSubmission({ ...validForm, phones: 'abc' })
  t.false(result.ok)
  t.truthy(result.errors.phones)
})

test('Submit/rejects-bad-url-and-email', t => {
  const result = validateSubmission({ ...validForm, url: 'example.com', emails: 'not-an-email' })
  t.false(result.ok)
  t.truthy(result.errors.url)
  t.truthy(result.errors.emails)
})

test('Submit/custom-category-resolves', t => {
  const ok = validateSubmission({ ...validForm, category: CUSTOM_CATEGORY, customCategory: '新兴行业' })
  t.true(ok.ok)
  const missing = validateSubmission({ ...validForm, category: CUSTOM_CATEGORY, customCategory: '' })
  t.false(missing.ok)
  t.truthy(missing.errors.category)
})

test('Submit/issue-title-uses-organization', t => {
  t.is(buildIssueTitle(validForm), '[vCard 新增请求] 示例银行')
  t.is(buildIssueTitle({ organization: '' }), '[vCard 新增请求] 未命名')
})

test('Submit/issue-body-contains-all-fields', t => {
  const body = buildIssueBody(validForm)
  t.true(body.includes('**类别**：金融银行'))
  t.true(body.includes('**组织名称**：示例银行'))
  t.true(body.includes('  - 95588'))
  t.true(body.includes('  - 400-000-0000'))
  t.true(body.includes('**官方网址**：https://example.com'))
  t.true(body.includes('  - service@example.com'))
  t.true(body.includes('**备注**：客户服务热线'))
})

test('Submit/issue-url-is-encoded', t => {
  const url = buildIssueUrl(validForm)
  t.true(url.startsWith('https://github.com/dolfly/vCards/issues/new?'))
  t.true(url.includes('title='))
  t.true(url.includes('body='))
  // 标题中的中文与空格已编码，且断言可被 URL 解析器还原
  const query = url.slice(url.indexOf('?') + 1)
  const params = new URLSearchParams(query)
  t.is(params.get('title'), '[vCard 新增请求] 示例银行')
  t.true(params.get('body').includes('示例银行'))
})
