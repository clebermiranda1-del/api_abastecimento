import { query } from './db.js';

export async function validarToken(req, res, next) {
  const token = req.body?.token || req.headers['x-app-token'];

  if (!token) {
    return res.status(401).json({ erro: 'Token obrigatorio' });
  }

  const result = await query(
    'select ativo from public.dispositivos_api where token = $1',
    [token]
  );

  if (result.rowCount === 0 || result.rows[0].ativo !== true) {
    return res.status(403).json({ erro: 'Token invalido ou inativo' });
  }

  next();
}

export async function validarUsuarioAtivo(req, res, next) {
  const usuario = req.body?.usuario_login;

  if (!usuario) {
    return next();
  }

  const result = await query(
    'select ativo, revogado from public.app_usuarios where usuario_login = $1',
    [usuario]
  );

  if (result.rowCount === 0) {
    return res.status(403).json({ erro: 'Acesso bloqueado pelo administrador, entre em contato' });
  }

  const cadastro = result.rows[0];
  if (!cadastro.ativo || cadastro.revogado) {
    return res.status(403).json({ erro: 'Acesso bloqueado pelo administrador, entre em contato' });
  }

  next();
}
