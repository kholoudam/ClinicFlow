import { useEffect, useState } from 'react';
import { api, apiError } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null),
    [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(e => setError(apiError(e)));
  }, []);

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  if (!stats) {
    return <div className="loading">Chargement…</div>;
  }

  const cards = [
    ['Patients actifs', stats.total_patients],
    ['Rendez-vous aujourd’hui', stats.appointments_today],
    ['En attente', stats.pending],
    ['Confirmés', stats.confirmed]
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Vue d’ensemble de l’activité.</p>
        </div>
      </div>

      <div className="stats">
        {cards.map(([l, v]) => (
          <div className="stat" key={l}>
            <span>{l}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>ClinicFlow</h2>
        <p>
          Utilisez la navigation pour rechercher des patients,
          consulter leurs rendez-vous et gérer les statuts.
        </p>
      </div>
    </>
  );
}