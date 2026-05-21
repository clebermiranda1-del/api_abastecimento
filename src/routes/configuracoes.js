import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/app', async (req, res, next) => {
  try {
    const result = await query(
      'select chave, valor from public.configuracoes_app order by chave'
    );

    const configuracoes = Object.fromEntries(
      result.rows.map((row) => [row.chave, row.valor])
    );

    res.json(configuracoes);
  } catch (error) {
    next(error);
  }
});

router.put('/app/:chave', async (req, res, next) => {
  try {
    const { chave } = req.params;
    const { valor, descricao } = req.body;

    if (valor === undefined || valor === null) {
      return res.status(400).json({ erro: 'valor obrigatorio' });
    }

    const result = await query(
      `insert into public.configuracoes_app (chave, valor, descricao, atualizado_em)
       values ($1, $2, $3, now())
       on conflict (chave) do update set
         valor = excluded.valor,
         descricao = coalesce(excluded.descricao, public.configuracoes_app.descricao),
         atualizado_em = now()
       returning *`,
      [chave, String(valor), descricao || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
