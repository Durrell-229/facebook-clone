import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGitHub, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirect] = useSearchParams();
  const navigate = useNavigate();

  const go = () => {
    const target = redirect.get('redirect');
    navigate(target ?? '/feed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    go();
  };

  const handleGitHub = async () => {
    setError(null);
    await signInWithGitHub();
  };

  const handleGoogle = async () => {
    setError(null);
    await signInWithGoogle();
  };

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center bg-[#eef2f7] px-4 dark:bg-[#0b1220]">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:justify-between">
        {/* Branding */}
        <div className="max-w-md text-center lg:text-left">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-hub-cyan text-2xl text-white">
              <i className="fas fa-code"></i>
            </span>
            <h1 className="bg-gradient-to-r from-primary to-hub-cyan bg-clip-text text-4xl font-extrabold text-transparent">
              SyntaxHub
            </h1>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Le réseau social des développeurs. Partagez votre code, vos projets et vos idées avec la communauté.
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg dark:bg-hub-surface">
          <form onSubmit={handleSubmit}>
            <div className="my-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse e-mail"
                required
                className="h-12 w-full rounded-md border border-gray-300 px-2 outline-none focus:border-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="my-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                className="h-12 w-full rounded-md border border-gray-300 px-2 outline-none focus:border-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-11 w-full rounded-md bg-primary text-xl font-bold text-white shadow-md transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? 'Connexion…' : 'Connexion'}
            </button>

            <div className="mt-2 border-b border-gray-300 pb-3 text-center dark:border-neutral-700">
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-primary underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          {/* Social login */}
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={handleGitHub}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gray-900 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 dark:bg-neutral-800"
            >
              <i className="fab fa-github text-lg"></i>
              Continuer avec GitHub
            </button>
            <button
              type="button"
              onClick={handleGoogle}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-md transition-opacity hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
            >
              <i className="fab fa-google text-lg text-red-500"></i>
              Continuer avec Google
            </button>
          </div>

          <div className="mt-5 text-center">
            <Link to="/register">
              <button className="h-11 w-full rounded-md bg-greenLight text-xl font-bold text-white shadow-md transition-colors hover:opacity-90">
                Créer un nouveau compte
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
