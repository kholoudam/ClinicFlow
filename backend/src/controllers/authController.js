import * as service from "../services/authService.js";

export async function login(req, res) {
  const { email, password } = req.validated.body;

  const result = await service.login(email, password);

  res.json(result);
}

export async function me(req, res) {
  const user = await service.me(req.user.id);

  res.json({ user });
}