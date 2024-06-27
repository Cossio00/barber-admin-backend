import express, { json } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

const port = 3010;
const httpsPort = 3011;

app.use(json());
app.use(cors());
app.use(routes);

app.listen(port, () => {
    console.log(`API running on port: ${port}`)
})