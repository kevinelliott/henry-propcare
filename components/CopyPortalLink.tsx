'use client'
import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

export default function CopyPortalLink({ token, appUrl }: { token: string; appUrl: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${appUrl}/portal/${token}`

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={copy}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-2 py-1.5 rounded-lg transition-colors">
        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
