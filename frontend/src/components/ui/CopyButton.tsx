import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface CopyButtonProps {
  text: string
  size?: number
}

export function CopyButton({ text, size = 14 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className="btn-ghost"
      onClick={handleCopy}
      style={{ padding: '4px 8px', fontSize: 12 }}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check size={size} style={{ color: 'var(--success)' }} />
      ) : (
        <Copy size={size} />
      )}
      {copied ? 'Đã copy!' : 'Copy'}
    </button>
  )
}
