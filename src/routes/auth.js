import { Router } from 'express';
import { query, withTransaction } from '../db.js';
import { validarToken } from '../middleware.js';

const router = Router();

router.post('/primeiro-acesso', validarToken, async (req, res, next) => {
  try {
    const { usuario_login, senha_hash, organizacao_nome } = req.body;

    if (!usuario_login || !senha_hash || !organizacao_nome) {
      return res.status(400).json({ erro: 'usuario_login, senha_hash e organizacao_nome sao obrigatorios' });
    }

    const result = await withTransaction(async (client) => {
      const org = await client.query(
        `insert into public.organizacoes (nome)
         values ($1)
         on conflict (nome) do update set nome = excluded.nome
         returning id, nome`,
        [organizacao_nome]
      );

      const user = await client.query(
        `insert into public.app_usuarios (usuario_login, senha_hash, organizacao_id, organizacao_nome)
         values ($1, $2, $3, $4)
         returning id, usuario_login, organizacao_nome, ativo, revogado`,
        [usuario_login, senha_hash, org.rows[0].id, organizacao_nome]
      );

      await client.query(
        `insert into public.logs_app (tipo_log, usuario_login, organizacao_nome, payload, criado_em_millis)
         values ($1, $2, $3, $4, $5)`,
        ['cadastro_usuario', usuario_login, organizacao_nome, req.body, req.body.criado_em_millis || Date.now()]
      );

      return user.rows[0];
    });

    res.status(201).json(result);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Usuario ja cadastrado' });
    }
    next(error);
  }
});

router.post('/status', validarToken, async (req, res, next) => {
  try {
    const { usuario_login } = req.body;

    if (!usuario_login) {
      return res.status(400).json({ erro: 'usuario_login obrigatorio' });
    }

    const result = await query(
      `select usuario_login, organizacao_nome, ativo, revogado, motivo_revogacao
       from public.app_usuarios
       where usuario_login = $1`,
      [usuario_login]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
