create table if not exists public.app_usuarios (
    id bigserial primary key,
    usuario_login text not null unique,
    senha_hash text not null,
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text not null,
    ativo boolean not null default true,
    revogado boolean not null default false,
    motivo_revogacao text,
    criado_em timestamp without time zone default now(),
    atualizado_em timestamp without time zone default now()
);

create table if not exists public.app_administradores (
    id bigserial primary key,
    usuario_login text not null unique,
    senha_hash text not null,
    nome text,
    ativo boolean not null default true,
    criado_em timestamp without time zone default now()
);

create table if not exists public.app_acessos_revogados (
    id bigserial primary key,
    usuario_login text not null,
    organizacao_nome text,
    motivo text,
    revogado_por text,
    revogado_em timestamp without time zone default now(),
    liberado_em timestamp without time zone
);

create table if not exists public.logs_app (
    id bigserial primary key,
    tipo_log text not null,
    usuario_login text,
    organizacao_nome text,
    abastecedor_codigo text,
    equipamento_codigo text,
    app_versao text,
    payload jsonb,
    criado_em timestamp without time zone default now(),
    criado_em_millis bigint
);

create table if not exists public.configuracoes_app (
    id bigserial primary key,
    chave text not null unique,
    valor text not null,
    descricao text,
    atualizado_em timestamp without time zone default now()
);

insert into public.configuracoes_app (chave, valor, descricao)
values
    ('versao_minima', '1.0', 'Versao minima permitida do aplicativo'),
    ('versao_atual', '1.0', 'Versao atual publicada'),
    ('bloquear_app', 'false', 'Bloqueia uso do app remotamente'),
    ('mensagem_app', '', 'Mensagem remota exibida no app')
on conflict (chave) do nothing;

create index if not exists idx_abastecimentos_usuario_login on public.abastecimentos (usuario_login);
create index if not exists idx_abastecimentos_organizacao_nome on public.abastecimentos (organizacao_nome);
create index if not exists idx_abastecimentos_tipo_log on public.abastecimentos (tipo_log);
create index if not exists idx_app_usuarios_login on public.app_usuarios (usuario_login);
create index if not exists idx_app_usuarios_organizacao on public.app_usuarios (organizacao_nome);
create index if not exists idx_logs_app_tipo_log on public.logs_app (tipo_log);
create index if not exists idx_logs_app_usuario on public.logs_app (usuario_login);
