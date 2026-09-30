import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/db.js';

const dbAvailable = await pool.query('SELECT 1').then(()=>true).catch(()=>false);
const describeIfDb = dbAvailable ? describe : describe.skip;

describeIfDb('ClinicFlow API',()=>{
 let adminToken,staffToken,patientId,appointmentId;
 beforeAll(async()=>{
  const admin=await request(app).post('/api/auth/login').send({email:'admin@clinicflow.local',password:'Admin123!'}); adminToken=admin.body.token;
  const staff=await request(app).post('/api/auth/login').send({email:'staff1@clinicflow.local',password:'Staff123!'}); staffToken=staff.body.token;
  const list=await request(app).get('/api/patients?search=&page=1&limit=10').set('Authorization',`Bearer ${staffToken}`);patientId=list.body.rows[0].id;
 });
 afterAll(async()=>pool.end());
 test('login and me',async()=>{expect(adminToken).toBeTruthy();const r=await request(app).get('/api/auth/me').set('Authorization',`Bearer ${adminToken}`);expect(r.status).toBe(200);expect(r.body.user.role).toBe('admin');});
 test('role control blocks staff delete',async()=>{const r=await request(app).delete(`/api/patients/${patientId}`).set('Authorization',`Bearer ${staffToken}`);expect(r.status).toBe(403);});
 test('pagination returns metadata',async()=>{const r=await request(app).get('/api/patients?page=1&limit=2').set('Authorization',`Bearer ${staffToken}`);expect(r.status).toBe(200);expect(r.body.page).toBe(1);expect(r.body.limit).toBe(2);expect(r.body.totalPages).toBeGreaterThanOrEqual(1);});
 test('30-minute conflict, exact boundary and update',async()=>{
  const base=new Date(Date.now()+48*3600000);base.setSeconds(0,0);
  const a=await request(app).post('/api/appointments').set('Authorization',`Bearer ${staffToken}`).send({patientId,appointmentDate:base.toISOString(),status:'confirmed',reason:'Rule test A'});expect(a.status).toBe(201);appointmentId=a.body.appointment.id;
  const conflict=await request(app).post('/api/appointments').set('Authorization',`Bearer ${staffToken}`).send({patientId,appointmentDate:new Date(base.getTime()+29*60000).toISOString(),status:'confirmed',reason:'Rule test conflict'});expect(conflict.status).toBe(409);
  const exact=await request(app).post('/api/appointments').set('Authorization',`Bearer ${staffToken}`).send({patientId,appointmentDate:new Date(base.getTime()+30*60000).toISOString(),status:'confirmed',reason:'Rule test exact'});expect(exact.status).toBe(409);
  const pending=await request(app).post('/api/appointments').set('Authorization',`Bearer ${staffToken}`).send({patientId,appointmentDate:new Date(base.getTime()+60*60000).toISOString(),status:'pending',reason:'Rule test update'});expect(pending.status).toBe(201);
  const upd=await request(app).patch(`/api/appointments/${pending.body.appointment.id}/status`).set('Authorization',`Bearer ${staffToken}`).send({status:'confirmed'});expect(upd.status).toBe(200);
 });
});
