import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_ASSETS, APP_NAME, APP_TAGLINE } from '../../config';

const features = [
  {
    icon: 'fas fa-code',
    title: 'Fil dev en direct',
    text: 'Posts, repos GitHub tendance, articles Dev.to, Hacker News et Reddit : un flux réel et temps réel.',
    color: 'from-primary to-hub-cyan',
  },
  {
    icon: 'fas fa-briefcase',
    title: 'Emplois & Projets',
    text: 'Offres CDI, freelance, remote et projets open-source pour toute la communauté dev.',
    color: 'from-hub-cyan to-emerald-400',
  },
  {
    icon: 'fas fa-users',
    title: 'Communautés',
    text: 'Rejoignez des espaces dédiés aux langages, frameworks, DevOps et cybersécurité.',
    color: 'from-hub-violet to-primary',
  },
  {
    icon: 'fas fa-flag-checkered',
    title: 'Défis & Compétitions',
    text: 'Challenges de code, CTF et tournois pour progresser et se mesurer à la communauté.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: 'fas fa-robot',
    title: 'Syntax AI',
    text: 'Un assistant IA intégré pour revoir votre code, rédiger et apprendre plus vite.',
    color: 'from-hub-violet to-hub-cyan',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Sécurisé',
    text: 'Authentification GitHub / Google, sécurité RLS côté base et données protégées.',
    color: 'from-emerald-400 to-teal-500',
  },
];

const LandingPage: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      {/* Header */}
      <header className="fixed z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#0b1220]/80 px-5 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={APP_ASSETS.appIcon}
            alt="SyntaxHub"
            className="h-10 w-10 rounded-xl object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-hub-cyan bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <Link
              to="/feed"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold hover:bg-primary-dark"
            >
              <img
                src={profile?.avatar_url ?? APP_ASSETS.defaultAvatar}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
              Accéder au flux
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={APP_ASSETS.landingBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/80 via-[#0b1220]/70 to-[#0b1220]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-primary/30">
            <img
              src={APP_ASSETS.appIcon}
              alt="Logo"
              className="h-full w-full object-cover"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                const parent = el.parentElement;
                parent?.classList.add(
                  'bg-gradient-to-br',
                  'from-primary',
                  'to-hub-cyan',
                );
              }}
            />
          </div>

          <h1 className="text-4xl font-black leading-tight sm:text-6xl">
            Le réseau social des{' '}
            <span className="bg-gradient-to-r from-primary via-hub-cyan to-hub-violet bg-clip-text text-transparent">
              développeurs
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">{APP_TAGLINE}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                to="/feed"
                className="rounded-full bg-primary px-8 py-3 text-base font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark"
              >
                Voir mon flux →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-full bg-primary px-8 py-3 text-base font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark"
                >
                  Rejoindre gratuitement
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 bg-white/5 px-8 py-3 text-base font-bold backdrop-blur hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span>
              <i className="fab fa-github mr-1.5"></i>Connexion GitHub
            </span>
            <span>
              <i className="fab fa-google mr-1.5"></i>Connexion Google
            </span>
            <span>
              <i className="fas fa-bolt mr-1.5 text-primary"></i>Flux temps réel
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-extrabold">
          Tout pour les développeurs
        </h2>
        <p className="mt-3 text-center text-gray-400">
          Programmation, cybersécurité, DevOps, data et bien plus.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:border-primary/50"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${f.color}`}
              >
                <i className={f.icon}></i>
              </div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 py-16 text-center">
        <h2 className="text-3xl font-extrabold">Prêt à construire avec nous ?</h2>
        <p className="mt-3 text-gray-400">
          Rejoignez une communauté de développeurs passionnés.
        </p>
        <Link
          to={user ? '/feed' : '/register'}
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-primary to-hub-cyan px-10 py-3 text-base font-bold shadow-lg shadow-primary/30 hover:opacity-90"
        >
          {user ? 'Accéder au flux' : 'Créer mon compte'}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} SyntaxHub — Code · Communauté · Sécurité
      </footer>
    </div>
  );
};

export default LandingPage;
