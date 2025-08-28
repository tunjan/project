/**
 * Copy a string to the user's clipboard, with a graceful fallback.
 * Returns true on success, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    // fall through to legacy path
  }

  // Legacy fallback using a temporary textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    const selection = document.getSelection();
    const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    const success = document.execCommand('copy');

    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
    document.body.removeChild(textarea);

    return success;
  } catch (err) {
    console.error('copyToClipboard failed:', err);
    return false;
  }
}
