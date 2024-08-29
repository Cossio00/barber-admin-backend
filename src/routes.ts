import { Router } from 'express';
import { getClient, createClient, updateClient, deleteClient } from './Controller/Client';
import { getCategory, createCategory, updateCategory, deleteCategory }from './Controller/Category';
import { getServices,  createService } from './Controller/Service';
import { error } from 'console';

const router = Router();


//      --------    CLIENT

router.get('/client', async function(req: any, res: any){
    try{
        res.json(await getClient(req, res));
    } catch(err: any){
        console.error('Error to get clients list: ', err.message);
    }
})

router.post('/client', async function(req: any, res: any){
    try{
        res.json(await createClient(req, res));
    } catch(err: any){
        console.error('Error to create client: ', err.message);
    }
})

router.put('/client/:id', async function (req: any, res: any) {
    try{
        res.json(await updateClient(req, res));
    } catch(err: any){
        console.error('Error to update client: ', err.message);
    }
})

router.delete('/client/:id', async function (req: any, res: any) {
    try{
        res.json(await deleteClient(req, res));
    } catch(err: any){
        console.error('Error to delete client: ', err.message);
    }
})

//      --------    CATEGORY

router.get('/category', async function (req: any, res: any) {
    try{
        res.json(await getCategory(req, res));
    } catch(err: any){
        console.error('Error to get categories list: ', err.message);
    }
})

router.post('/category', async function (req: any, res: any) {
    try{
        res.json(await createCategory(req, res));
    } catch(err: any){
        console.error('Error to create category: ', err.message);
    }
})

router.put('/category/:id', async function (req: any, res: any) {
    try{
        res.json(await updateCategory(req, res));
    } catch(err: any){
        console.error('Error to update category: ', err.message);
    }
})

router.delete('/category/:id', async function (req: any, res: any) {
    try{
        res.json(await deleteCategory(req, res));
    } catch(err: any){
        console.error('Error to delete category: ', err.message);
    }
})

//      --------    SERVICE

router.get('/service', async function (req: any, res: any){
    try{
        res.json(await getServices(req, res));
    } catch(err: any){
        console.error('Error to get services list: ', err.message);
    }
})

router.post('/service', async function (req: any, res: any){
    try{
        res.json(await createService(req, res));
    } catch(err: any){
        console.error('Error to create service: ', err.message);
    }
})


export default router;