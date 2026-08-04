import dotenv from 'dotenv';

dotenv.config();

import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

const port = process.env.PORT || 3010;

app.use(json());
app.use(cors());
app.use(routes);

app.listen(port, () => {
    console.log(`API running on port: ${port}`)
})