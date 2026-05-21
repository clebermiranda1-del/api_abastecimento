import { Router } from 'express';
import { query } from '../db.js';
import { validarToken, validarUsuarioAtivo } from '../middleware.js';

const router = Router();

router.post('/', validarToken, validarUsuarioAtivo, async (req, res, next) => {
  try {
    const body = req.body;

    const required = [
      'organizacao_nome',
      'abastecedor_codigo',
      'equipamento_codigo',
      'leitura',
      'litros',
      'tipo_combustivel',
      'tipo_medidor',
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return res.status(400).json({ erro: `Campo obrigatorio: ${field}` });
      }
    }

    const result = await query(
      `insert into public.abastecimentos (
        organizacao_nome,
        abastecedor_codigo,
        equipamento_codigo,
        leitura,
        litros,
        tipo_combustivel,
        tipo_medidor,
        usuario_login,
        app_versao,
        origem,
        tipo_log,
        criado_em_millis
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning id`,
      [
        body.organizacao_nome,
        body.abastecedor_codigo,
        body.equipamento_codigo,
        Number(body.leitura),
        Number(body.litros),
        body.tipo_combustivel,
        body.tipo_medidor,
        body.usuario_login || null,
        body.app_versao || null,
        body.origem || 'app',
        body.tipo_log || null,
        body.criado_em_millis || null,
      ]
    );

    res.status(201).json({ id: result.rows[0].id, status: 'salvo' });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `select * from public.abastecimentos order by id desc limit 200`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
