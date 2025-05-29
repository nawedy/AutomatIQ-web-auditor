"use client"

import { useEffect } from "react"

export function GlobalPopupManager() {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Close any open dialogs by dispatching a custom event
        const closeEvent = new CustomEvent("closeAllPopups")
        window.dispatchEvent(closeEvent)
      }
    }

    // Add global escape key listener
    document.addEventListener("keydown", handleEscapeKey)

    // Add global click outside listener for custom popups
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // Check if click is outside any popup/modal
      const isInsideModal =
        target.closest('[role="dialog"]') || target.closest(".popup-container") || target.closest("[data-popup]")

      if (!isInsideModal) {
        // Only close custom popups, not shadcn dialogs (they handle this themselves)
        const customCloseEvent = new CustomEvent("closeCustomPopups")
        window.dispatchEvent(customCloseEvent)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return null
}
