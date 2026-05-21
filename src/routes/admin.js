import { Router } from 'express';
import { query, withTransaction } from '../db.js';
import { validarToken } from '../middleware.js';

const router = Router();

router.post('/revogar-acesso', validarToken, async (req, res, next) => {
  try {
    const { usuario_login, motivo, revogado_por } = req.body;

    if (!usuario_login) {
      return res.status(400).json({ erro: 'usuario_login obrigatorio' });
    }

    const result = await withTransaction(async (client) => {
      const user = await client.query(
        `update public.app_usuarios
         set revogado = true,
             ativo = false,
             motivo_revogacao = $2,
             atualizado_em = now()
         where usuario_login = $1
         returning usuario_login, organizacao_nome, ativo, revogado`,
        [usuario_login, motivo || 'Acesso revogado']
      );

      if (user.rowCount === 0) {
        return null;
      }

      await client.query(
        `insert into public.app_acessos_revogados (usuario_login, organizacao_nome, motivo, revogado_por)
         values ($1, $2, $3, $4)`,
        [usuario_login, user.rows[0].organizacao_nome, motivo || 'Acesso revogado', revogado_por || null]
      );

      return user.rows[0];
    });

    if (!result) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/liberar-acesso', validarToken, async (req, res, next) => {
  try {
    const { usuario_login } = req.body;

    if (!usuario_login) {
      return res.status(400).json({ erro: 'usuario_login obrigatorio' });
    }

    const result = await withTransaction(async (client) => {
      const user = await client.query(
        `update public.app_usuarios
         set revogado = false,
             ativo = true,
             motivo_revogacao = null,
             atualizado_em = now()
         where usuario_login = $1
         returning usuario_login, organizacao_nome, ativo, revogado`,
        [usuario_login]
      );

      if (user.rowCount === 0) {
        return null;
      }

      await client.query(
        `update public.app_acessos_revogados
         set liberado_em = now()
         where usuario_login = $1 and liberado_em is null`,
        [usuario_login]
      );

      return user.rows[0];
    });

    if (!result) {
      return res.status(404).json({ erro: 'Usuario nao encontrado' });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
