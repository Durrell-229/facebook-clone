import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage: React.FC = () => {
  const { signUpWithEmail, signInWithGitHub, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await signUpWithEmail(email, password, fullName);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate('/feed');
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
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-hub-surface">
        <div className="mb-4 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-hub-cyan text-2xl text-white">
            <i className="fas fa-code"></i>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">SyntaxHub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rejoignez la communauté des développeurs
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="my-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nom complet"
              required
              className="h-12 w-full rounded-md border border-gray-300 px-2 outline-none focus:border-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
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
              placeholder="Mot de passe (8 caractères min.)"
              required
              minLength={8}
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
            className="mt-2 h-11 w-full rounded-md bg-greenLight text-xl font-bold text-white shadow-md transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Création…' : "S'inscrire"}
          </button>
        </form>

        <div className="my-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300 dark:bg-neutral-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-300 dark:bg-neutral-700" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGitHub}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gray-900 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 dark:bg-neutral-800"
          >
            <i className="fab fa-github text-lg"></i>
            S’inscrire avec GitHub
          </button>
          <button
            type="button"
            onClick={handleGoogle}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-md transition-opacity hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700"
          >
            <i className="fab fa-google text-lg text-red-500"></i>
            S’inscrire avec Google
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Déjà membre ?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
