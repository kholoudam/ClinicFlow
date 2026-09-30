import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, apiError } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null),
    [appointments, setAppointments] = useState([]),
    [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}`),
      api.get(`/patients/${id}/appointments`)
    ])
      .then(([p, a]) => {
        setPatient(p.data.patient);
        setAppointments(a.data.appointments);
      })
      .catch(e => setError(apiError(e)));
  }, [id]);

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  if (!patient) {
    return <div className="loading">Chargement…</div>;
  }

  return (
    <>
      <Link to="/patients" className="back">
        ← Patients
      </Link>

      <div className="page-head">
        <div>
          <h1>{patient.full_name}</h1>
          <p>CIN {patient.cin}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2>Informations</h2>

          <p>
            <b>Téléphone</b>
            {patient.phone}
          </p>

          <p>
            <b>Date de naissance</b>
            {patient.birth_date?.slice(0, 10)}
          </p>

          <p>
            <b>Adresse</b>
            {patient.address || '—'}
          </p>
        </div>

        <div className="panel">
          <h2>Rendez-vous</h2>

          {!appointments.length ? (
            <div className="empty">
              Aucun rendez-vous.
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map(a => (
                <div
                  className="appointment"
                  key={a.id}
                >
                  <div>
                    <strong>
                      {new Date(
                        a.appointment_date
                      ).toLocaleString('fr-FR')}
                    </strong>

                    <span>{a.reason}</span>
                  </div>

                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}