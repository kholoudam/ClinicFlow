import * as service from "../services/patientService.js";

export async function create(req, res) {
  const patient = await service.create(
    req.validated.body,
    req.user.id,
  );

  res.status(201).json({ patient });
}

export async function list(req, res) {
  const patients = await service.list(req.validated.query);

  res.json(patients);
}

export async function get(req, res) {
  const { id } = req.validated.params;

  const patient = await service.get(id);

  res.json({ patient });
}

export async function update(req, res) {
  const { id } = req.validated.params;

  const patient = await service.update(
    id,
    req.validated.body,
    req.user.id,
  );

  res.json({ patient });
}

export async function remove(req, res) {
  const { id } = req.validated.params;

  await service.remove(id, req.user.id);

  res.status(204).send();
}