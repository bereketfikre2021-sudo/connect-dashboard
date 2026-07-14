/**
 * useUnsavedWarning
 * Returns a `guardedClose` function. If the form is dirty or a file has been
 * selected, it asks the user to confirm before calling `onClose`.
 */
export function useUnsavedWarning(
  isDirty: boolean,
  onClose: () => void,
  hasFile = false,
) {
  const guardedClose = () => {
    if (isDirty || hasFile) {
      if (!window.confirm('You have unsaved changes. Discard them?')) return;
    }
    onClose();
  };
  return guardedClose;
}
