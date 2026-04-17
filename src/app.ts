import 'dotenv/config';
import express from 'express';
import routes from './routes';
import { exceptionFilter } from './middlewares/exception-filter.middleware';
import { NotFoundError } from './errors/NotFoundError';

const app = express();

app.use(express.json());
app.use('/api', routes);
app.use((_req, _res, next) => next(new NotFoundError('route')));
app.use(exceptionFilter);

export default app;
