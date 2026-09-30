import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
export function authenticate(req,res,next)
{
 const header=req.headers.authorization; 
    if(!header?.startsWith('Bearer ')) 
        return next(new AppError(401,'UNAUTHORIZED','Authentication required'));
    try{
        req.user=verifyToken(header.slice(7));
        return next()
    }
    catch{
        return next(new AppError(401,'UNAUTHORIZED','Invalid or expired token'))
    }
}
export const requireRole=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():next(new AppError(403,'FORBIDDEN','Insufficient permissions'));