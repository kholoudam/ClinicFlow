import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
export function errorHandler(err,req,res,_next){
    if(err instanceof ZodError) 
        return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Validation failed',details:err.issues}});
    if(err instanceof AppError) 
        return res.status(err.status).json({error:{code:err.code,message:err.message,details:err.details}});
    if(err?.code==='23505') 
        return res.status(409).json({error:{code:'CONFLICT',message:'A unique value already exists',details:err.detail}});
    if(err?.code==='23503')
        return res.status(409).json({error:{code:'REFERENCE_CONFLICT',message:'The resource is referenced by another record'}});
    console.error(err);
    return res.status(500).json({error:{code:'INTERNAL_ERROR',message:'An unexpected server error occurred'}});
}
