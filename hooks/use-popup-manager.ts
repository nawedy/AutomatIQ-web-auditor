"use client"

import { useEffect, useCallback } from "react"

interface UsePopupManagerProps {
  isOpen: boolean
  onClose: () => void
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
  popupId?: string
}

export function usePopupManager({
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnClickOutside = true,
  popupId,
}: UsePopupManagerProps) {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const handleGlobalClose = () => {
      handleClose()
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        handleClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!closeOnClickOutside) return

      const target = event.target as Element
      const popupElement = popupId ? document.querySelector(`[data-popup="${popupId}"]`) : null

      if (popupElement && !popupElement.contains(target)) {
        handleClose()
      }
    }

    // Global popup close events
    window.addEventListener("closeAllPopups", handleGlobalClose)
    window.addEventListener("closeCustomPopups", handleGlobalClose)

    // Escape key handling
    if (closeOnEscape) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    // Click outside handling
    if (closeOnClickOutside) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      window.removeEventListener("closeAllPopups", handleGlobalClose)
      window.removeEventListener("closeCustomPopups", handleGlobalClose)
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, handleClose, closeOnEscape, closeOnClickOutside, popupId])

  return {
    handleClose,
  }
}
