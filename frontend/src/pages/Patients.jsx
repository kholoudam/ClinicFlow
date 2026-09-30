import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

const initial = {
  fullName: '',
  cin: '',
  phone: '',
  birthDate: '',
  address: ''
};

export default function Patients() {
  const { user } = useAuth();

  const [data, setData] = useState(null),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(1),
    [form, setForm] = useState(initial),
    [editing, setEditing] = useState(null),
    [show, setShow] = useState(false),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);

    api
      .get('/patients', {
        params: {
          search,
          page,
          limit: 10
        }
      })
      .then(r => setData(r.data))
      .catch(e => setError(apiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, page]);

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (
      !form.fullName ||
      !form.cin ||
      !form.phone ||
      !form.birthDate
    ) {
      return setError(
        'Nom, CIN, téléphone et date de naissance sont obligatoires.'
      );
    }

    try {
      if (editing) {
        await api.put(`/patients/${editing}`, form);
      } else {
        await api.post('/patients', form);
      }

      setShow(false);
      setEditing(null);
      setForm(initial);
      load();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const remove = async id => {
    if (!confirm('Supprimer ce patient ?')) return;

    try {
      await api.delete(`/patients/${id}`);
      load();
    } catch (e) {
      setError(apiError(e));
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <p>
            Recherche et gestion des patients actifs.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => {
            setForm(initial);
            setEditing(null);
            setShow(true);
          }}
        >
          Ajouter un patient
        </button>
      </div>

      {error && (
        <div className="alert error">{error}</div>
      )}

      <div className="toolbar">
        <input
          placeholder="Rechercher par nom ou CIN…"
          value={search}
          onChange={e => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {loading ? (
        <div className="loading">Chargement…</div>
      ) : !data?.rows.length ? (
        <div className="empty">
          Aucun patient trouvé.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>CIN</th>
                <th>Téléphone</th>
                <th>Date naissance</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map(p => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/patients/${p.id}`}>
                      {p.full_name}
                    </Link>
                  </td>

                  <td>{p.cin}</td>
                  <td>{p.phone}</td>
                  <td>
                    {p.birth_date?.slice(0, 10)}
                  </td>

                  <td>
                    <button
                      className="link-btn"
                      onClick={() => {
                        setEditing(p.id);
                        setForm({
                          fullName: p.full_name,
                          cin: p.cin,
                          phone: p.phone,
                          birthDate:
                            p.birth_date?.slice(0, 10),
                          address: p.address || ''
                        });
                        setShow(true);
                      }}
                    >
                      Modifier
                    </button>

                    {user.role === 'admin' && (
                      <button
                        className="danger-link"
                        onClick={() => remove(p.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>

        <span>
          Page {data?.page || page} /{' '}
          {data?.totalPages || 1}
        </span>

        <button
          disabled={!data || page >= data.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>

      {show && (
        <div className="modal">
          <form
            className="modal-card"
            onSubmit={submit}
          >
            <div className="page-head">
              <h2>
                {editing ? 'Modifier' : 'Nouveau'} patient
              </h2>

              <button
                type="button"
                className="icon-btn"
                onClick={() => setShow(false)}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="alert error">{error}</div>
            )}

            <div className="grid-2">
              <label>
                Nom complet
                <input
                  value={form.fullName}
                  onChange={e =>
                    setForm({
                      ...form,
                      fullName: e.target.value
                    })
                  }
                />
              </label>

              <label>
                CIN
                <input
                  value={form.cin}
                  onChange={e =>
                    setForm({
                      ...form,
                      cin: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Téléphone
                <input
                  value={form.phone}
                  onChange={e =>
                    setForm({
                      ...form,
                      phone: e.target.value
                    })
                  }
                />
              </label>

              <label>
                Date de naissance
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e =>
                    setForm({
                      ...form,
                      birthDate: e.target.value
                    })
                  }
                />
              </label>
            </div>

            <label>
              Adresse
              <textarea
                value={form.address}
                onChange={e =>
                  setForm({
                    ...form,
                    address: e.target.value
                  })
                }
              />
            </label>

            <button className="primary full">
              Enregistrer
            </button>
          </form>
        </div>
      )}
    </>
  );
}