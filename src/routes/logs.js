import { Router } from 'express';
import { query } from '../db.js';
import { validarToken } from '../middleware.js';

const router = Router();

router.post('/', validarToken, async (req, res, next) => {
  try {
    const body = req.body;

    if (!body.tipo_log) {
      return res.status(400).json({ erro: 'tipo_log obrigatorio' });
    }

    const result = await query(
      `insert into public.logs_app (
        tipo_log,
        usuario_login,
        organizacao_nome,
        abastecedor_codigo,
        equipamento_codigo,
        app_versao,
        payload,
        criado_em_millis
      ) values ($1, $2, $3, $4, $5, $6, $7, $8)
      returning id`,
      [
        body.tipo_log,
        body.usuario_login || null,
        body.organizacao_nome || null,
        body.abastecedor_codigo || null,
        body.equipamento_codigo || null,
        body.app_versao || null,
        body,
        body.criado_em_millis || null,
      ]
    );

    res.status(201).json({ id: result.rows[0].id, status: 'salvo' });
  } catch (error) {
    next(error);
  }
});

export default router;
