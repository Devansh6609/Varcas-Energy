import { Hono } from 'hono';
import * as publicController from '../controllers/public.controller.js';

const publicApi = new Hono();

publicApi.get('/locations/states', publicController.getStates);
publicApi.get('/locations/districts/:state', publicController.getDistricts);
publicApi.post('/leads', publicController.createPublicLead);
publicApi.post('/leads/:id/send-otp', publicController.sendOtp);
publicApi.post('/verify-otp', publicController.verifyLeadOtp);
publicApi.get('/forms/:formType', publicController.getFormSchema);

export default publicApi;
