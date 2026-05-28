# 🎯 Teste Rápido do Projeto

## 1. Teste Local

### Opção A - Live Server (Recomendado)

```bash
# No VS Code:
1. Instale a extensão "Live Server"
2. Clique com botão direito em index.html
3. Selecione "Open with Live Server"
```

### Opção B - Servidor Python

```bash
# Python 3.x
python -m http.server 8000

# Depois acesse: http://localhost:8000
```

### Opção C - Node.js

```bash
# Instale http-server globalmente
npm install -g http-server

# Execute
http-server

# Depois acesse: http://localhost:8080
```

## 2. Testar Funcionalidades

### ✅ Catálogo
- [ ] Abra `index.html`
- [ ] Veja a lista de produtos
- [ ] Teste a busca digitando "Tela"
- [ ] Teste o filtro por categoria
- [ ] Clique em um produto para ver o modal

### ✅ Admin
- [ ] Acesse `admin.html`
- [ ] Digite a senha: `9933`
- [ ] Veja o dropdown com as imagens que você cadastrou em `imagens/index.json`
- [ ] Selecione uma imagem para um produto
- [ ] Clique "Salvar Imagem"
- [ ] Volte para o catálogo e veja se a imagem apareceu

### ✅ WhatsApp
- [ ] No catálogo, clique "Tenho Interesse"
- [ ] Deve abrir WhatsApp com mensagem pré-preenchida
- [ ] Verifique o número no `script.js` se necessário

## 3. Preparar para GitHub

### Adicionar suas imagens

```bash
# 1. Coloque as imagens na pasta /imagens/
#    (exemplo: produto1.jpg, tela.png)

# 2. Execute o script gerador
node gerar-lista.js

# 3. Verifique se index.json foi atualizado
```

### Editar produtos

```bash
# 1. Substitua dados/produtos.xls pela planilha atualizada
# 2. Mantenha exatamente esse nome de arquivo
# 3. Recarregue a página para testar
```

### Configurações finais

```javascript
// Em script.js (linha ~10):
const WHATSAPP_NUMBER = '5511999999999'; // Seu número

// Em admin.js:
if (senhaInput.value === '9933') { // Sua senha
```

## 4. Enviar para GitHub

```bash
git init
git add .
git commit -m "Catálogo de produtos - TechParts Store"
git branch -M main
git remote add origin https://github.com/seu-usuario/techparts-store.git
git push -u origin main

# Depois ative GitHub Pages nas configurações do repositório
```

## 5. Acessar no GitHub Pages

```
https://seu-usuario.github.io/techparts-store/
```

---

**Pronto!** Seu site está no GitHub! 🚀

Para atualizar:
```bash
# Edite os arquivos
git add .
git commit -m "Descrição das mudanças"
git push
```

As mudanças aparecerão em 2-3 minutos.
