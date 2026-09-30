import { useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../services/api';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState(
    'admin@clinicflow.local'
  );
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <Navigate
        to={loc.state?.from?.pathname || '/'}
        replace
      />
    );
  }

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError(
        'Email et mot de passe sont obligatoires.'
      );
    }

    setLoading(true);

    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand large">ClinicFlow</div>

        <p className="muted">
          Gestion simple des patients et rendez-vous.
        </p>

        {error && (
          <div className="alert error">{error}</div>
        )}

        <label>
          Email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            autoComplete="username"
          />
        </label>

        <label>
          Mot de passe
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </label>

        <button
          className="primary full"
          disabled={loading}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <small>
          Compte démo : admin@clinicflow.local / Admin123!
        </small>
      </form>
    </div>
  );
}