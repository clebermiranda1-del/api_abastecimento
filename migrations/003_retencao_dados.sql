create table if not exists public.retencao_execucoes (
    id bigserial primary key,
    executado_em timestamp without time zone default now(),
    abastecimentos_removidos integer not null default 0,
    logs_removidos integer not null default 0,
    acessos_revogados_removidos integer not null default 0,
    revisoes_removidas integer not null default 0,
    transbordos_removidos integer not null default 0,
    abastecimentos_tanque_removidos integer not null default 0
);

create or replace function public.limpar_dados_antigos(retencao interval default interval '1 year')
returns table (
    abastecimentos_removidos integer,
    logs_removidos integer,
    acessos_revogados_removidos integer,
    revisoes_removidas integer,
    transbordos_removidos integer,
    abastecimentos_tanque_removidos integer
)
language plpgsql
as $$
declare
    v_abastecimentos integer := 0;
    v_logs integer := 0;
    v_acessos integer := 0;
    v_revisoes integer := 0;
    v_transbordos integer := 0;
    v_tanque integer := 0;
begin
    delete from public.abastecimentos
    where coalesce(criado_em, data_abastecimento) < now() - retencao;
    get diagnostics v_abastecimentos = row_count;

    delete from public.logs_app
    where criado_em < now() - retencao;
    get diagnostics v_logs = row_count;

    delete from public.app_acessos_revogados
    where coalesce(liberado_em, revogado_em) < now() - retencao;
    get diagnostics v_acessos = row_count;

    delete from public.revisoes
    where created_at < now() - retencao;
    get diagnostics v_revisoes = row_count;

    delete from public.transbordos
    where coalesce(created_at, data_transbordo) < now() - retencao;
    get diagnostics v_transbordos = row_count;

    delete from public.abastecimento_tanque
    where coalesce(created_at, data_abastecimento::timestamp) < now() - retencao;
    get diagnostics v_tanque = row_count;

    insert into public.retencao_execucoes (
        abastecimentos_removidos,
        logs_removidos,
        acessos_revogados_removidos,
        revisoes_removidas,
        transbordos_removidos,
        abastecimentos_tanque_removidos
    ) values (
        v_abastecimentos,
        v_logs,
        v_acessos,
        v_revisoes,
        v_transbordos,
        v_tanque
    );

    return query select
        v_abastecimentos,
        v_logs,
        v_acessos,
        v_revisoes,
        v_transbordos,
        v_tanque;
end;
$$;

create index if not exists idx_abastecimentos_criado_em on public.abastecimentos (criado_em);
create index if not exists idx_logs_app_criado_em on public.logs_app (criado_em);
create index if not exists idx_app_acessos_revogados_revogado_em on public.app_acessos_revogados (revogado_em);
create index if not exists idx_retencao_execucoes_executado_em on public.retencao_execucoes (executado_em);
