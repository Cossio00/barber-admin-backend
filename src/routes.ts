import { Router } from 'express';
import { getClient, createClient, updateClient, deleteClient } from './Controller/Client';
import { getCategory, createCategory, updateCategory, deleteCategory } from './Controller/Category';
import { getService, getServices, getServicesAgenda, createService, updateService, updateServiceStatus, deleteService } from './Controller/Service';
import { getClosures, getClosureDetails, getClosureOverview, createClosure } from './Controller/Closure';
import { register, login } from './Controller/Auth';
import { authenticateToken } from './Middleware/auth';
import { tenantMiddleware } from './Middleware/tenant';

const router = Router();

// ====================== AUTH (públicas) ======================
router.post('/register', async (req, res) => await register(req, res));
router.post('/login', async (req, res) => await login(req, res));

// ====================== CLIENT ======================
router.get('/client', authenticateToken, tenantMiddleware, async (req, res) => await getClient(req, res));
router.post('/client', authenticateToken, tenantMiddleware, async (req, res) => await createClient(req, res));
router.put('/client/:id', authenticateToken, tenantMiddleware, async (req, res) => await updateClient(req, res));
router.delete('/client/:id', authenticateToken, tenantMiddleware, async (req, res) => await deleteClient(req, res));

// ====================== CATEGORY ======================
router.get('/category', authenticateToken, tenantMiddleware, async (req, res) => await getCategory(req, res));
router.post('/category', authenticateToken, tenantMiddleware, async (req, res) => await createCategory(req, res));
router.put('/category/:id', authenticateToken, tenantMiddleware, async (req, res) => await updateCategory(req, res));
router.delete('/category/:id', authenticateToken, tenantMiddleware, async (req, res) => await deleteCategory(req, res));

// ====================== SERVICE ======================
router.get('/service-agenda/:id', authenticateToken, tenantMiddleware, async (req, res) => await getService(req, res));
router.get('/service-agenda', authenticateToken, tenantMiddleware, async (req, res) => await getServices(req, res));
router.post('/service-agenda', authenticateToken, tenantMiddleware, async (req, res) => await getServicesAgenda(req, res));
router.post('/service', authenticateToken, tenantMiddleware, async (req, res) => await createService(req, res));
router.put('/service/:id', authenticateToken, tenantMiddleware, async (req, res) => await updateService(req, res));
router.put('/service-status/:id', authenticateToken, tenantMiddleware, async (req, res) => await updateServiceStatus(req, res));
router.delete('/service/:id', authenticateToken, tenantMiddleware, async (req, res) => await deleteService(req, res));

// ====================== CLOSURE ======================
router.get('/closure', authenticateToken, tenantMiddleware, async (req, res) => await getClosures(req, res));
router.get('/closure-details/:id', authenticateToken, tenantMiddleware, async (req, res) => await getClosureDetails(req, res));
router.get('/closure-overview/:id', authenticateToken, tenantMiddleware, async (req, res) => await getClosureOverview(req, res));
router.post('/closure', authenticateToken, tenantMiddleware, async (req, res) => await createClosure(req, res));

export default router;