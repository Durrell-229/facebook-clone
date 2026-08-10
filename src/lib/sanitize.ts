/**
 * Utilitaires de sécurité côté client : assainissement du contenu
 * avant insertion en base (défense en profondeur contre le XSS).
 */

/** Échappe les caractères HTML sensibles d'une chaîne. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Supprime les balises/scripts et normalise le contenu d'un post. */
export function sanitizeContent(value: string, maxLength = 5000): string {
  return escapeHtml(value)
    .replace(/(<script[\s\S]*?>[\s\S]*?<\/script>)/gi, '')
    .trim()
    .slice(0, maxLength);
}

/** Extrait les hashtags (#tag) d'un texte et retourne une liste unique. */
export function extractHashtags(value: string, limit = 5): string[] {
  const matches = value.match(/#[\p{L}\p{N}_-]+/gu) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))].slice(0, limit);
}
