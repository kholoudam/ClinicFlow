import * as service from "../services/appointmentService.js";

export async function create(req, res) {
  const appointment = await service.create(
    req.validated.body,
    req.user.id,
  );

  res.status(201).json({ appointment });
}

export async function list(req, res) {
  const appointments = await service.list(req.validated.query);

  res.json({ appointments });
}

export async function updateStatus(req, res) {
  const { id } = req.validated.params;
  const { status } = req.validated.body;

  const appointment = await service.updateStatus(
    id,
    status,
    req.user.id,
  );

  res.json({ appointment });
}

export async function byPatient(req, res) {
  const { id } = req.validated.params;

  const appointments = await service.listByPatient(id);

  res.json({ appointments });
}