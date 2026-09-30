import { useEffect, useState } from 'react';
import { api, apiError } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Appointments() {
  const [rows, setRows] = useState([]),
    [patients, setPatients] = useState([]),
    [date, setDate] = useState(''),
    [status, setStatus] = useState(''),
    [form, setForm] = useState({
      patientId: '',
      appointmentDate: '',
      status: 'pending',
      reason: '',
      notes: ''
    }),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);

    api
      .get('/appointments', {
        params: {
          date: date || undefined,
          status: status || undefined
        }
      })
      .then(r => setRows(r.data.appointments))
      .catch(e => setError(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();

    api
      .get('/patients', {
        params: {
          limit: 100,
          page: 1
        }
      })
      .then(r => setPatients(r.data.rows))
      .catch(e => setError(apiError(e)));
  }, [date, status]);

  const create = async e => {
    e.preventDefault();
    setError('');

    if (!form.patientId || !form.appointmentDate || !form.reason) {
      return setError(
        'Patient, date/heure et motif sont obligatoires.'
      );
    }

    try {
      await api.post('/appointments', {
        ...form,
        appointmentDate: new Date(
          form.appointmentDate
        ).toISOString()
      });

      setForm({
        ...form,
        appointmentDate: '',
        reason: '',
        notes: ''
      });

      load();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const changeStatus = async (id, next) => {
    try {
      await api.patch(`/appointments/${id}/status`, {
        status: next
      });

      load();
    } catch (e) {
      setError(apiError(e));
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Rendez-vous</h1>
          <p>Création, filtrage et changement de statut.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="appointment-layout">
        <form
          className="panel form-panel"
          onSubmit={create}
        >
          <h2>Nouveau rendez-vous</h2>

          <label>
            Patient
            <select
              value={form.patientId}
              onChange={e =>
                setForm({
                  ...form,
                  patientId: e.target.value
                })
              }
            >
              <option value="">Sélectionner…</option>

              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} — {p.cin}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date et heure
            <input
              type="datetime-local"
              value={form.appointmentDate}
              onChange={e =>
                setForm({
                  ...form,
                  appointmentDate: e.target.value
                })
              }
            />
          </label>

          <label>
            Statut
            <select
              value={form.status}
              onChange={e =>
                setForm({
                  ...form,
                  status: e.target.value
                })
              }
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>

          <label>
            Motif
            <input
              value={form.reason}
              onChange={e =>
                setForm({
                  ...form,
                  reason: e.target.value
                })
              }
            />
          </label>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={e =>
                setForm({
                  ...form,
                  notes: e.target.value
                })
              }
            />
          </label>

          <button className="primary full">Créer</button>
        </form>

        <div className="panel">
          <div className="filters">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />

            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Chargement…</div>
          ) : !rows.length ? (
            <div className="empty">Aucun rendez-vous.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map(a => (
                    <tr key={a.id}>
                      <td>
                        {new Date(
                          a.appointment_date
                        ).toLocaleString('fr-FR')}
                      </td>

                      <td>{a.patient_name}</td>
                      <td>{a.reason}</td>

                      <td>
                        <StatusBadge status={a.status} />
                      </td>

                      <td>
                        <select
                          value={a.status}
                          onChange={e =>
                            changeStatus(
                              a.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="pending">
                            pending
                          </option>
                          <option value="confirmed">
                            confirmed
                          </option>
                          <option value="cancelled">
                            cancelled
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}