import { useState } from 'react'
import { CopyIcon, CheckIcon, PhoneIcon } from './icons'

/**
 * 复制按钮：优先使用异步剪贴板 API，降级到 execCommand。
 */
export function CopyButton({ text, label = '复制号码' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopy(text)
      }
    } catch {
      fallbackCopy(text)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
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
    <button
      type="button"
      className="chip-btn"
      onClick={handleCopy}
      title={label}
      aria-label={label}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span>{copied ? '已复制' : '复制'}</span>
    </button>
  )
}

/**
 * 拨打按钮：移动端唤起拨号，桌面端交给系统处理 tel: 协议。
 */
export function DialButton({ number, label = '拨打' }) {
  return (
    <a className="chip-btn chip-btn--primary" href={`tel:${number}`} title={`拨打 ${number}`}>
      <PhoneIcon />
      <span>{label}</span>
    </a>
  )
}