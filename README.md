# Currículo Pro

Aplicação estática para criar, editar, salvar e exportar currículos em PDF.

## Funcionamento

- Não exige cadastro, login ou senha.
- Os currículos são salvos no `localStorage` do navegador.
- Os dados não são enviados para banco de dados ou servidor.
- Cada navegador e dispositivo mantém seus próprios currículos.
- Limpar os dados do navegador pode apagar os currículos salvos.

## Desenvolvimento local

Requer Node.js 20.19 ou superior.

```bash
npm install
npm run dev
```

## Verificação

```bash
npm run check
```

## Publicação no GitHub Pages

O projeto não depende de servidor nem de processo de build para funcionar no
GitHub Pages. Mantenha a publicação configurada para a branch `main`, pasta
`/(root)`, e envie as alterações:

```bash
git add -A
git commit -m "Adapta projeto para GitHub Pages"
git push origin main
```

O site será publicado em:

```text
https://tallysonaraujoadm-lgtm.github.io/curriculo-pro/
```

## Versão com backend

A versão anterior, com autenticação, banco PostgreSQL e envio de e-mail, está
preservada localmente em:

```text
/home/rhangel/Projetos/meu projeto2
```
