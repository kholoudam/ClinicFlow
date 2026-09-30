import * as service from '../services/authService.js';
export async function login(req,res)
{
    res.json(
        await service.login(req.body.email,req.body.password)
    );
}
export async function me(req,res)
{
    res.json(
        {user:await service.me(req.user.id)}
    );
}