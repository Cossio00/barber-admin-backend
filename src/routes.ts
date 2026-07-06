import { Router } from 'express';
import { getClient, createClient, updateClient, deleteClient } from './Controller/Client';
import { getCategory, createCategory, updateCategory, deleteCategory }from './Controller/Category';
import { createService, deleteService, updateService, updateServiceStatus,getServicesAgenda, getServices, getService } from './Controller/Service';
import { getClosures, getClosureDetails, getClosureOverview, createClosure } from './Controller/Closure';
import { register, login } from './Controller/Auth';
import { authenticateToken } from './Middleware/auth';
import { error } from 'console';

const router = Router();


//      --------    CLIENT

router.get('/client', authenticateToken, async function(req: any, res: any){
    try{
        await getClient(req, res);
    } catch(err: any){
        console.error('Error to get clients list: ', err.message);
    }
})

router.post('/client', authenticateToken, async function(req: any, res: any){
    try{
        await createClient(req, res);
    } catch(err: any){
        console.error('Error to create client: ', err.message);
    }
})

router.put('/client/:id', authenticateToken, async function (req: any, res: any) {
    try{
        await updateClient(req, res);
    } catch(err: any){
        console.error('Error to update client: ', err.message);
    }
})

router.delete('/client/:id', authenticateToken, async function (req: any, res: any) {
    try{
        await deleteClient(req, res);
    } catch(err: any){
        console.error('Error to delete client: ', err.message);
    }
})

//      --------    CATEGORY

router.get('/category', authenticateToken, async function (req: any, res: any) {
    try{
        await getCategory(req, res);
    } catch(err: any){
        console.error('Error to get categories list: ', err.message);
    }
})

router.post('/category', authenticateToken, async function (req: any, res: any) {
    try{
        await createCategory(req, res);
    } catch(err: any){
        console.error('Error to create category: ', err.message);
    }
})

router.put('/category/:id', authenticateToken, async function (req: any, res: any) {
    try{
        await updateCategory(req, res);
    } catch(err: any){
        console.error('Error to update category: ', err.message);
    }
})

router.delete('/category/:id', authenticateToken, async function (req: any, res: any) {
    try{
        await deleteCategory(req, res);
    } catch(err: any){
        console.error('Error to delete category: ', err.message);
    }
})

//      --------    SERVICE

router.get('/service-agenda/:id', authenticateToken, async function (req: any, res: any){

    try{
        await getService(req, res);
    } catch(err: any){
        console.error('Error to get service: ', err.message);
    }
})

router.get('/service-agenda', authenticateToken, async function (req: any, res: any){
    try{
        await getServices(req, res);
    } catch(err: any){
        console.error('Error to get services: ', err.message);
    }
})

router.post('/service-agenda', authenticateToken, async function (req: any, res: any){
    try{
        await getServicesAgenda(req, res);
    } catch(err: any){
        console.error('Error to get services list: ', err.message);
    }
})

router.post('/service', authenticateToken, async function (req: any, res: any){
    try{
        await createService(req, res);
    } catch(err: any){
        console.error('Error to create service: ', err.message);
    }
})

router.put('/service/:id', authenticateToken, async function (req: any, res: any){
    try{
        await updateService(req, res);
    }catch(err: any){{
        console.error('Error to update service: ', err.message);
    }}
})

router.put('/service-status/:id', authenticateToken, async function (req: any, res: any){
    try{
        await updateServiceStatus(req, res);
    }catch(err: any){{
        console.error('Error to update service: ', err.message);
    }}
})

router.delete('/service/:id', authenticateToken, async function (req: any, res: any){
    try{
        await deleteService(req, res);
    }catch(err: any){{
        console.error('Error to update service: ', err.message);
    }}
})

//      --------    Closure

router.get('/closure', authenticateToken, async function (req: any, res: any){
    try{
        await getClosures(req, res);
    } catch(err: any){
        console.error('Error to get closures list: ', err.message);
    }
})

router.get('/closure-details/:id', authenticateToken, async function (req: any, res: any){
    try{
        await getClosureDetails(req, res);
    } catch(err: any){
        console.error('Error to get closures list: ', err.message);
    }
})

router.get('/closure-overview/:id', authenticateToken, async function (req: any, res: any){
    try{
        await getClosureOverview(req, res);
    } catch(err: any){
        console.error('Error to get closures list: ', err.message);
    }
})

router.post('/closure', authenticateToken, async function (req: any, res: any){
    try{
        await createClosure(req, res);
    } catch(err: any){
        console.error('Error to create closure: ', err.message);
    }
})


//      --------    Auth

router.post('/register', async (req: any, res: any) => {
    try {
        await register(req, res);
    } catch (err: any) {
        console.error('Error in register route:', err.message);
    }
});

router.post('/login', async (req: any, res: any) => {
    try {
        await login(req, res);
    } catch (err: any) {
        console.error('Error in login route:', err.message);
    }
});

export default router;