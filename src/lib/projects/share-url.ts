export function getProjectShareUrl(shareId: string) {
  if (typeof window === 'undefined') {
    return `/share/${shareId}`;
  }

  return `${window.location.origin}/share/${shareId}`;
}
