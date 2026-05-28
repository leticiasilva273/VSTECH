# 📤 Deploy no GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `techparts-store`
3. Descrição: `Catálogo de produtos online - TechParts Store`
4. Escolha "Public" (para funcionar no GitHub Pages)
5. Clique "Create repository"

## Passo 2: Configurar Git Localmente

Abra o terminal na pasta do projeto e execute:

```bash
# Inicializar repositório local
git init

# Adicionar todos os arquivos
git add .

# Criar commit inicial
git commit -m "Catálogo de produtos online - TechParts Store"

# Renomear branch para main
git branch -M main

# Adicionar repositório remoto
git remote add origin https://github.com/SEU-USUARIO/techparts-store.git

# Enviar para GitHub
git push -u origin main
```

**Substitua `SEU-USUARIO` pelo seu usuário do GitHub!**

## Passo 3: Ativar GitHub Pages

1. Acesse seu repositório no GitHub
2. Clique em **Settings** (Configurações)
3. Na barra lateral, clique em **Pages**
4. Em "Build and deployment", selecione:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **(root)**
5. Clique "Save"

## Passo 4: Acessar o Site

Espere 2-3 minutos e acesse:

```
https://seu-usuario.github.io/techparts-store/
```

Exemplo:
```
https://joao123.github.io/techparts-store/
```

## 📝 Atualizar o Site

Sempre que quiser atualizar:

```bash
# Substitua dados/produtos.xls pela planilha nova, se mudou os produtos

# Depois:
git add .
git commit -m "Descrição das mudanças"
git push
```

O site atualizará automaticamente em alguns minutos!

## ⚙️ Atualizar Lista de Imagens

Opção 1 - Automático:
1. Coloque as imagens na pasta `/imagens/`
2. Dê dois cliques em `atualizar-imagens.bat`
3. Execute `git add . && git commit -m "Atualizar imagens" && git push`

Opção 2 - Editar manualmente:
1. Edite `/imagens/index.json`
2. Execute `git add . && git commit -m "..." && git push`

Opção 3 - Usar o script pelo terminal:
```bash
node gerar-lista.js
git add imagens/index.json
git commit -m "Atualizar lista de imagens"
git push
```

## 🐛 Troubleshooting

### "404 Not Found" no GitHub Pages
- Espere 5 minutos
- Verifique se o repositório é público
- Limpe o cache: Ctrl+Shift+Delete

### Imagens não carregam
- Verifique se `index.json` tem os nomes corretos
- Use lowercase em nomes de arquivos
- Exemplo: `foto-1.jpg` não `Foto-1.jpg`

### Mudanças não aparecem
- Limpe cache do navegador (Ctrl+Shift+Delete)
- Espere alguns minutos
- Force refresh (Ctrl+F5)

## 📚 Recursos

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Git Tutorial](https://git-scm.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Dúvidas?** Consulte o README.md principal
