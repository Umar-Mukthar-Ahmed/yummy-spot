"use client"

import { useEffect, useRef } from "react"

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      "expired-callback": () => void
      "error-callback": () => void
    }
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_ID = "cf-turnstile-script"
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    const script = existing ?? Object.assign(document.createElement("script"), { id: SCRIPT_ID, src: SCRIPT_SRC, async: true, defer: true })
    script.addEventListener("load", () => resolve())
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load")))
    if (!existing) document.head.appendChild(script)
  })
}

type TurnstileProps = {
  siteKey: string
  onToken: (token: string | null) => void
  /** Change this value to ask for a fresh challenge (for example after a rejected submission). */
  resetSignal: number
}

/** Cloudflare Turnstile widget; the token it produces is verified on the server by /api/orders. */
export function Turnstile({ siteKey, onToken, resetSignal }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const callback = useRef(onToken)

  useEffect(() => {
    callback.current = onToken
  }, [onToken])

  useEffect(() => {
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile || widgetId.current) return
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: siteKey,
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        })
      })
      .catch(() => callback.current(null))
    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [siteKey])

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) {
      callback.current(null)
      window.turnstile.reset(widgetId.current)
    }
  }, [resetSignal])

  return <div ref={container} className="min-h-[65px]" aria-label="Spam protection check" />
}
