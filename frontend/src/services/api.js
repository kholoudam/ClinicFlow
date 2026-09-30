import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:4000/api'});
let logoutHandler=()=>{};
export const setLogoutHandler=(fn)=>{logoutHandler=fn};
api.interceptors.request.use(config=>{const token=localStorage.getItem('clinicflow_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){localStorage.removeItem('clinicflow_token');logoutHandler()};return Promise.reject(e)});
export const apiError=(e)=>e.response?.data?.error?.message||'Une erreur est survenue.';
