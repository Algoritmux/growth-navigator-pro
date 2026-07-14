# Guia do editor de blog

Voce nao precisa saber programacao para criar um artigo. Use o formulario, escreva no editor visual e confira a previa antes de publicar.

## Criar um post

1. Abra o admin do blog e clique em Novo Post.
2. Preencha o titulo.
3. Preencha o slug ou deixe em branco para gerar automaticamente.
4. Escreva um resumo curto, idealmente entre 140 e 250 caracteres.
5. Escolha a categoria ou tema principal e informe o tempo de leitura.
6. Escreva o corpo do post no editor visual.
7. Salve como rascunho enquanto revisa.
8. Abra o post no frontend para conferir o resultado.
9. Publique quando estiver pronto.

## Escrever o corpo do artigo

Use texto normal e a barra do editor:

- Negrito para mensagens-chave.
- Italico com moderacao.
- H2 para secoes principais.
- H3 para subsecoes.
- Lista para topicos simples.
- Lista numerada para sequencias.
- Link para referencias e materiais.
- Citacao para destacar uma frase.
- Imagem para inserir midias no corpo.

Mantenha paragrafos curtos para melhorar a leitura no celular.

## Categoria ou tema

Use a secao Classificacao para escolher o tema principal do artigo, como Growth, IA, Vendas ou Marketing. Tags antigas continuam compatíveis internamente, mas nao sao necessarias para criar um novo post.

## Inserir imagem

Clique em Imagem na barra do editor e preencha:

- Envie uma imagem do computador para gerar a URL publica automaticamente.
- Ou informe uma URL/caminho publico da imagem.
- Texto alternativo.
- Legenda opcional.

Use uma pasta publica persistente do projeto, como:

```text
public/lovable-uploads/
```

No navegador, essa imagem fica acessivel por um caminho como:

```text
/lovable-uploads/nome-da-imagem.png
```

Evite caminhos como `/storage` se o servidor nao tiver storage publico configurado.

O upload real usa o endpoint protegido `/backend/api/blog/upload-image.php`, que retorna uma URL publica para o editor preencher automaticamente.

## Imagem de capa

Use o campo Imagem de capa no formulario do post. A capa fica separada das imagens internas do corpo.

- Clique em Enviar imagem do computador para fazer upload real.
- Ou informe uma URL/caminho publico, como `/lovable-uploads/nome-da-imagem.png`.
- Use imagem leve e com boa leitura em mobile.
- Prefira proporcao horizontal, como 1920x1080.
- As imagens internas continuam sendo inseridas pelo botao Imagem do editor.

## SEO

Enquanto nao ha campos dedicados no banco, o site usa:

- Titulo do post como titulo SEO.
- Resumo como descricao SEO.

Antes de publicar:

- Confira se o titulo esta claro.
- Confira se o resumo explica o artigo.
- Evite resumo generico.

## Checklist editorial

- Use H2 para secoes principais.
- Use H3 para subsecoes.
- Evite paragrafos longos.
- Use listas quando houver varios itens.
- Use lista numerada quando houver ordem.
- Insira imagens no ponto correto do texto.
- Revise a previa antes de publicar.
- Teste o post no frontend em celular e desktop.
- Mantenha como rascunho ate terminar a revisao.

## Compartilhamento

Na pagina do artigo, use os botoes de WhatsApp, LinkedIn, X, copiar link ou Compartilhar. O botao Compartilhar usa o menu nativo do navegador quando disponivel; se nao houver suporte, copia o link.

## Compatibilidade antiga

Posts antigos que usam blocos especiais continuam sendo renderizados para nao quebrar conteudo ja publicado. Para posts novos, prefira o editor visual e os botoes de formatacao.
