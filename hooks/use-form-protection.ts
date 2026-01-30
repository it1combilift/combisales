"use client";

import { useState, useCallback } from "react";

export interface UseFormProtectionOptions {
  onClose: () => void;
}

export interface UseFormProtectionReturn {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  showConfirmDialog: boolean;
  handleOpenChange: (open: boolean) => void;
  confirmClose: () => void;
  cancelClose: () => void;
}

/**
 * Hook to protect forms from accidental data loss.
 * Intercepts close attempts when data is unsaved and shows a confirmation dialog.
 */
export function useFormProtection({
  onClose,
}: UseFormProtectionOptions): UseFormProtectionReturn {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // If trying to close and form is dirty, show confirmation
      if (!open && isDirty) {
        setShowConfirmDialog(true);
        return;
      }

      // If closing and form is clean, allow it
      if (!open) {
        onClose();
      }
    },
    [isDirty, onClose],
  );

  const confirmClose = useCallback(() => {
    setShowConfirmDialog(false);
    setIsDirty(false);
    onClose();
  }, [onClose]);

  const cancelClose = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  return {
    isDirty,
    setIsDirty,
    showConfirmDialog,
    handleOpenChange,
    confirmClose,
    cancelClose,
  };
}
