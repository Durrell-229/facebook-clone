/**
 * Configuration globale de SyntaxHub.
 * Remplacez les images fournies dans /public/assets ou renseignez les variables d'environnement.
 */
export const APP_ASSETS = {
  /** Image de fond de la landing page (fournie par l'utilisateur). */
  landingBackground:
    (import.meta.env.VITE_LANDING_BG_URL as string | undefined) ??
    '/assets/landing-bg.jpg',
  /** Icône / logo du projet (fourni par l'utilisateur). */
  appIcon:
    (import.meta.env.VITE_APP_ICON_URL as string | undefined) ??
    '/assets/icon.png',
  /** Bannière par défaut des profils. */
  defaultBanner: 'https://random.imagecdn.app/1920/1080',
  /** Avatar par défaut. */
  defaultAvatar: 'https://random.imagecdn.app/200/200',
};

export const APP_NAME = 'SyntaxHub';
export const APP_TAGLINE =
  'Le réseau social des développeurs. Code, projets, emplois, communautés et défis.';
