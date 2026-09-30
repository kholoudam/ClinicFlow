export class AppError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message); this.status = status; this.code = code; this.details = details;
  }
}
export const notFound = (message='Resource not found') => new AppError(404,'NOT_FOUND',message);
export const conflict = (message, details) => new AppError(409,'CONFLICT',message,details);
