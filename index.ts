import express from 'express';
import platformRoutes from './routes/platform.routes';
import cors from "cors";
import { ensureDatabaseSchema } from './config/db';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
   res.json({
      message: 'Polyglot Space API',
      endpoints: [
         '/api/members',
         '/api/courses',
         '/api/trainings',
         '/api/fees',
         '/api/enrollments',
         '/api/dashboard',
      ],
   });
});

app.use('/api', platformRoutes);

async function startServer(): Promise<void> {
   try {
      await ensureDatabaseSchema();
      app.listen(PORT, () => {
         console.log(`Server running on port ${PORT}`);
      });
   } catch (error) {
      console.error('Could not start server because the database schema is not ready.', error);
      process.exit(1);
   }
}

startServer();
