"use client"

import { useEffect, useState } from "react"
import { loadCatalog, type Catalog } from "@/lib/catalog"

type CatalogState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; catalog: Catalog }

/** Loads the published catalog from Supabase in the browser. */
export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ status: "loading" })

  useEffect(() => {
    let active = true
    void loadCatalog().then((catalog) => {
      if (active) setState(catalog ? { status: "ready", catalog } : { status: "unavailable" })
    })
    return () => {
      active = false
    }
  }, [])

  return state
}
