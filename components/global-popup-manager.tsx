"use client"

import { useEffect } from "react"

export function GlobalPopupManager() {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Dispatch custom event to close all popups
        window.dispatchEvent(new CustomEvent("closeAllPopups"))
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // Check if click is outside any popup
      const popups = document.querySelectorAll("[data-popup]")
      let clickedInsidePopup = false

      popups.forEach((popup) => {
        if (popup.contains(target)) {
          clickedInsidePopup = true
        }
      })

      // If clicked outside all popups, close them
      if (!clickedInsidePopup && popups.length > 0) {
        window.dispatchEvent(new CustomEvent("closeCustomPopups"))
      }
    }

    // Add event listeners
    document.addEventListener("keydown", handleEscapeKey)
    document.addEventListener("click", handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return null
}
