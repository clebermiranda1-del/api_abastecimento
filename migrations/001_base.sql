create table if not exists public.organizacoes (
    id bigserial primary key,
    nome text not null unique,
    ativo boolean default true,
    created_at timestamp without time zone default now()
);

create table if not exists public.dispositivos_api (
    id bigserial primary key,
    token text not null unique,
    ativo boolean default true,
    descricao text,
    criado_em timestamp without time zone default now()
);

create table if not exists public.abastecedores (
    id bigserial primary key,
    codigo text not null,
    nome text not null,
    created_at timestamp without time zone default now(),
    saldo_litros numeric default 0,
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text,
    unique (codigo, organizacao_nome)
);

create table if not exists public.equipamentos (
    id bigserial primary key,
    codigo text not null,
    descricao text not null,
    tipo_medidor text not null,
    ativo boolean default true,
    created_at timestamp without time zone default now(),
    tipo_combustivel text,
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text,
    unique (codigo, organizacao_nome)
);

create table if not exists public.abastecimentos (
    id bigserial primary key,
    organizacao_nome text not null,
    data_abastecimento timestamp without time zone not null default now(),
    abastecedor_codigo text not null,
    equipamento_codigo text not null,
    leitura numeric not null,
    litros numeric not null,
    tipo_combustivel text not null,
    tipo_medidor text not null,
    criado_em timestamp without time zone default now(),
    usuario_login text,
    app_versao text,
    origem text default 'app',
    sincronizado_em timestamp without time zone default now(),
    tipo_log text,
    criado_em_millis bigint
);

create table if not exists public.tanque_combustivel (
    id bigserial primary key,
    descricao text,
    saldo_litros numeric default 0,
    created_at timestamp without time zone default now(),
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text
);

create table if not exists public.abastecimento_tanque (
    id bigserial primary key,
    data_abastecimento date not null,
    quantidade_litros numeric not null,
    created_at timestamp without time zone default now(),
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text
);

create table if not exists public.transbordos (
    id bigserial primary key,
    abastecedor_codigo text not null,
    litros numeric not null,
    data_transbordo timestamp without time zone default now(),
    created_at timestamp without time zone default now(),
    tanque_id bigint references public.tanque_combustivel(id),
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text
);

create table if not exists public.revisoes (
    id bigserial primary key,
    equipamento_codigo text not null,
    tipo text not null,
    intervalo_horas numeric not null,
    ultima_revisao numeric,
    proxima_revisao numeric,
    created_at timestamp without time zone default now(),
    organizacao_id bigint references public.organizacoes(id),
    organizacao_nome text
);

insert into public.dispositivos_api (token, ativo, descricao)
values ('TOKEN_APP_001', true, 'Token padrao app Android')
on conflict (token) do nothing;
