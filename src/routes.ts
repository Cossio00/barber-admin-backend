import { Router } from 'express';
import getClient from './Controller/Client';
import { getCategory, createCategory, updateCategory, deleteCategory }from './Controller/Category';

const router = Router();


//      --------    CLIENT

router.get('/client', async function(req: any, res: any){
    try{
        res.json(await getClient(req, res));
    } catch(err: any){
        console.error('Error to get clients list: ', err.message);
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


export default router;