# Guia operacional: materiais com download

Este guia explica como cadastrar materiais gratuitos ou pagos na biblioteca e configurar downloads protegidos por formulario.

## Antes do deploy

Antes de publicar essa funcionalidade em producao, aplique a migration SQL no banco:

```text
docs/materials-download-migration.sql
```

Ela adiciona as colunas `access_type`, `has_download`, `download_url` e `download_button_label` na tabela `materials`. O endpoint de salvamento apenas le e grava esses campos; ele nao executa `ALTER TABLE` automaticamente.

## Onde colocar o arquivo

Coloque PDFs e outros arquivos publicos em:

```text
public/materials/
```

Exemplo:

```text
public/materials/playbook-gtm.pdf
```

No cadastro do material, use:

```text
/materials/playbook-gtm.pdf
```

## Como nomear arquivos

Use nomes curtos, em minusculas, sem espacos e sem acentos.

Boas opcoes:

```text
playbook-gtm.pdf
canvas-maturidade-comercial.pdf
matriz-csd-growth.pdf
```

Evite:

```text
Playbook GTM versão final.pdf
Diagnóstico Comercial Avançado.pdf
```

## Como cadastrar no admin

1. Acesse o painel admin da Biblioteca.
2. Clique em `Novo Material` ou edite um material existente.
3. Preencha tipo, titulo, descricao, imagem, tags, link e slug.
4. Em `Tipo de acesso`, escolha `Gratuito` ou `Pago`.
5. Para material gratuito com arquivo, marque `Possui download?`.
6. Em `URL/caminho do arquivo de download`, preencha algo como `/materials/playbook-gtm.pdf`.
7. Em `Texto do botao de download`, mantenha `Download` ou use outro texto curto.
8. Marque `Publicado` quando o material puder aparecer no site.
9. Salve.

## Como cadastrar no codigo

Se estiver usando dados estaticos, o formato esperado e:

```ts
{
  slug: "playbook-gtm",
  title: "Playbook Avancado de Go-To-Market",
  access: "free",
  hasDownload: true,
  downloadUrl: "/materials/playbook-gtm.pdf",
}
```

Material pago:

```ts
{
  slug: "diagnostico-comercial-avancado",
  title: "Diagnostico Comercial Avancado",
  access: "paid",
  hasDownload: false,
  downloadUrl: null,
}
```

## Como testar

1. Abra `/biblioteca` e confirme se o card mostra a etiqueta `Gratuito` ou `Pago`.
2. Acesse o detalhe do material.
3. Para gratuito com download, confirme se aparece o botao `Download`.
4. Clique no botao e confira se o formulario abre.
5. Tente enviar sem preencher todos os campos: nome, e-mail, numero de telefone e cargo devem ser obrigatorios.
6. Preencha os dados e envie.
7. Confirme a mensagem `Obrigado! Seu download foi liberado.`
8. Clique em `Baixar agora` se o navegador nao iniciar o download automaticamente.
9. No admin de leads, valide se o lead entrou com source `material-download`.
10. Para material pago, confirme que aparece `Tenho interesse` e que nao ha download direto.
11. Envie o formulario do pago e valide o source `paid-material-interest`.

## Cuidados

- Nao suba arquivos muito grandes.
- Evite espacos e acentos no nome do arquivo.
- Prefira PDF para materiais finais.
- Nao coloque material sensivel em `public/`.
- Revise se o material pode ser distribuido antes de publicar.
- Lembre que arquivos em `public/` podem ser acessados por URL direta.
- Esta primeira versao usa protecao no front-end. Para protecao real, o backend precisa servir o arquivo somente depois de registrar e validar o lead.
