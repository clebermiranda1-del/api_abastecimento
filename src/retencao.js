import { query } from './db.js';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export async function executarLimpezaDadosAntigos() {
  try {
    const ultimaExecucao = await query(
      `select executado_em
       from public.retencao_execucoes
       order by executado_em desc
       limit 1`
    );

    if (ultimaExecucao.rowCount > 0) {
      const ultima = new Date(ultimaExecucao.rows[0].executado_em).getTime();
      if (Date.now() - ultima < UM_DIA_MS) {
        return;
      }
    }

    const result = await query('select * from public.limpar_dados_antigos(interval \'1 year\')');
    console.log('Limpeza de retencao executada:', result.rows[0]);
  } catch (error) {
    console.error('Falha ao executar limpeza de retencao:', error.message);
  }
}

export function agendarLimpezaDadosAntigos() {
  executarLimpezaDadosAntigos();
  setInterval(executarLimpezaDadosAntigos, UM_DIA_MS);
}
