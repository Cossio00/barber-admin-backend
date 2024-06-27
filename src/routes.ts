import { Router } from 'express';
import getClient from './Controller/Client';
import getCategory from './Controller/Category';

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


export default router;