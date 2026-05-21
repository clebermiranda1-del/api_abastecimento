import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import abastecimentosRouter from './routes/abastecimentos.js';
import authRouter from './routes/auth.js';
import logsRouter from './routes/logs.js';
import adminRouter from './routes/admin.js';
import configuracoesRouter from './routes/configuracoes.js';
import { agendarLimpezaDadosAntigos } from './retencao.js';
import { query } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/db', async (req, res, next) => {
  try {
    await query('select 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/abastecimentos', abastecimentosRouter);
app.use('/auth', authRouter);
app.use('/logs', logsRouter);
app.use('/admin', adminRouter);
app.use('/configuracoes', configuracoesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno da API' });
});

app.listen(port, () => {
  console.log(`API Controle Abastecimento rodando na porta ${port}`);
  agendarLimpezaDadosAntigos();
});
