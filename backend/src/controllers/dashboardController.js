import { getStats } from '../services/dashboardService.js';
export async function stats(req,res)
{
    res.json(
        await getStats()
    );
}