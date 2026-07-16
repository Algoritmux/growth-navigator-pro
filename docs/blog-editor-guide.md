# Guia do editor de blog

O editor do blog foi pensado para ser simples e previsivel. O conteudo deve ficar legivel no campo de texto e o visual final vem do CSS do site.

## Criar um post

1. Abra o admin do blog e clique em Novo Post.
2. Preencha o titulo com a promessa principal do artigo.
3. Deixe o slug em branco para gerar automaticamente, ou preencha com palavras curtas separadas por hifen.
4. Escreva um resumo de 140 a 250 caracteres.
5. Escolha categoria, tempo de leitura e imagem de capa.
6. Escreva o corpo no editor.
7. Escolha o status: Rascunho, Publicado ou Agendado.
8. Use Previa renderizada para revisar.
9. Salve como rascunho, reabra e confira se o texto continua igual.
10. Publique ou agende apenas quando o post estiver revisado.

## Publicar, salvar ou agendar

O blog usa o fuso `America/Sao_Paulo`.

Para salvar como rascunho:

1. Em Publicacao, selecione `Rascunho`.
2. Salve o post.
3. Ele aparece no admin, mas nao aparece no blog publico.

Para publicar imediatamente:

1. Em Data de publicacao, escolha hoje.
2. Em Horario de publicacao, escolha um horario atual ou passado.
3. Em Publicacao, selecione `Publicado`.
4. Salve e abra `/blog` para conferir.

Para agendar:

1. Escolha uma data futura.
2. Escolha o horario de publicacao.
3. Em Publicacao, selecione `Agendado`.
4. Salve o post.

Posts agendados aparecem no admin com status `Agendado`, mas nao aparecem na home, em `/blog` nem na URL publica do artigo antes do horario definido. Quando a data/hora chega, o post passa a aparecer publicamente sem precisar de cron.

Se voce selecionar `Publicado` com uma data/hora futura, o admin avisa que o post ficara agendado ate o horario escolhido.

## Titulo e subtitulos

Use apenas um titulo principal no campo Titulo do post. No corpo do artigo, use:

```markdown
## Secao principal

### Subsecao
```

Evite usar `#` no corpo, porque o titulo do post ja ocupa esse papel na pagina publica.

## Paragrafos

Escreva paragrafos curtos, separados por uma linha em branco:

```markdown
Este e um paragrafo.

Este e outro paragrafo.
```

## Listas

Lista simples:

```markdown
- Primeiro ponto
- Segundo ponto
- Terceiro ponto
```

Lista numerada:

```markdown
1. Diagnosticar o problema
2. Priorizar a hipotese
3. Executar o teste
```

## Imagem interna

Use o botao Imagem no editor. Ele insere um bloco assim:

```html
<figure>
  <img src="/lovable-uploads/exemplo.jpg" alt="Descricao da imagem">
  <figcaption>Legenda da imagem.</figcaption>
</figure>
```

Use imagens leves, com texto alternativo claro e legenda quando a imagem precisar de contexto.

## Imagem de capa

Use o campo Imagem de capa fora do corpo do artigo. Prefira proporcao horizontal, como 1920x1080. A capa nao precisa ser repetida dentro do texto.

## Destaques

Lead de abertura:

```html
<div class="blog-lead">
  Texto de abertura forte do artigo.
</div>
```

Callout:

```html
<div class="blog-callout">
  <strong>Ideia central:</strong> escreva aqui o destaque.
</div>
```

Nota complementar:

```html
<div class="blog-note">
  Observacao importante para apoiar a leitura.
</div>
```

## Estatisticas

```html
<div class="blog-stat-grid">
  <div class="blog-stat-card">
    <strong>70%</strong>
    <span>texto da estatistica</span>
  </div>
  <div class="blog-stat-card">
    <strong>79%</strong>
    <span>texto da estatistica</span>
  </div>
</div>
```

## CTA de material

```html
<div class="blog-material-card">
  <span>Material complementar</span>
  <strong>Framework de Growth Marketing para crescimento previsivel</strong>
  <p>Acesse gratuitamente a biblioteca de materiais.</p>
  <a href="/biblioteca">Ver biblioteca -></a>
</div>
```

## Card numerado

```html
<div class="blog-step-card">
  <span>01</span>
  <div>
    <strong>Diagnostico</strong>
    <p>Identifique onde o crescimento esta travando antes de criar novas campanhas.</p>
  </div>
</div>
```

## Tabelas

Use tabela Markdown:

```markdown
| Criterio | Estrategia | Execucao |
| --- | --- | --- |
| Foco | Longo prazo | Rotina semanal |
| Indicador | Receita | Conversao por etapa |
```

## O que nao fazer

- Nao cole scripts, iframes, embeds ou codigos de terceiros no corpo.
- Nao use `style="..."` para ajustar visual manualmente.
- Nao crie classes novas sem alinhar com o time tecnico.
- Nao use shortcodes em posts novos.
- Nao cole texto de editores externos sem revisar a previa.
- Nao transforme listas numeradas em numeros soltos.

## Exemplo completo

```markdown
<div class="blog-lead">
  Crescimento previsivel nasce quando estrategia, oferta e rotina comercial deixam de competir entre si.
</div>

## Por que bons produtos travam

Um bom produto pode fracassar quando a mensagem nao chega ao cliente certo, pelo canal certo, com uma proposta de valor clara.

<div class="blog-callout">
  <strong>Ideia central:</strong> antes de escalar campanhas, valide ICP, oferta e caminho de compra.
</div>

## Sinais de desalinhamento

- O time vende para qualquer perfil.
- A mensagem muda a cada campanha.
- O comercial nao sabe priorizar objecoes.

| Sintoma | Causa provavel | Ajuste |
| --- | --- | --- |
| Muitos leads ruins | ICP amplo demais | Refinar segmento |
| Baixa conversao | Oferta pouco clara | Reescrever promessa |

<div class="blog-stat-grid">
  <div class="blog-stat-card">
    <strong>70%</strong>
    <span>dos testes devem partir de uma hipotese clara.</span>
  </div>
  <div class="blog-stat-card">
    <strong>3x</strong>
    <span>mais aprendizado quando marketing e vendas revisam juntos.</span>
  </div>
</div>

## Como organizar o plano

<div class="blog-step-card">
  <span>01</span>
  <div>
    <strong>Diagnostico</strong>
    <p>Mapeie ICP, oferta, canais e gargalos do funil.</p>
  </div>
</div>

<div class="blog-step-card">
  <span>02</span>
  <div>
    <strong>Prioridade</strong>
    <p>Escolha os pontos com maior impacto sobre receita e aprendizado.</p>
  </div>
</div>

<figure>
  <img src="/lovable-uploads/exemplo.jpg" alt="Mapa de funil de crescimento">
  <figcaption>Exemplo de leitura visual do funil antes da priorizacao.</figcaption>
</figure>

<div class="blog-material-card">
  <span>Material complementar</span>
  <strong>Framework de Growth Marketing para crescimento previsivel</strong>
  <p>Acesse gratuitamente a biblioteca de materiais.</p>
  <a href="/biblioteca">Ver biblioteca -></a>
</div>

## Proximo passo

Revise o plano semanalmente e mantenha apenas os testes que geram aprendizado real para o negocio.
```

## Compatibilidade antiga

Shortcodes antigos continuam renderizando para proteger posts publicados. Para posts novos, use os botoes do editor e os templates HTML simples acima.
