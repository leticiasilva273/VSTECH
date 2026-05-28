# 🚀 TechParts Store - Catálogo de Produtos Online

**100% HTML, CSS e JavaScript Puro - Sem Dependências!**

## Como Usar o Projeto

### 1️⃣ **Abrir Localmente**

Opção A - Usar Live Server (VS Code):
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

Opção B - Servidor simples:
1. Abra o terminal na pasta do projeto
2. Execute um servidor local de sua preferência
3. Acesse o endereço local no navegador

### 2️⃣ **Acessar as Páginas**

- **Catálogo**: `index.html`
- **Administração**: `admin.html`
  - Senha: `9933`

### 3️⃣ **Adicionar Imagens**

1. **Salve suas imagens** na pasta `/imagens/`
   - Formatos: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.svg`

2. **Opção A - Atualizar automaticamente**:
   Dê dois cliques em:
   ```text
   atualizar-imagens.bat
   ```
   Isso lê a pasta `/imagens/` e atualiza `index.json` automaticamente, sem precisar editar o arquivo na mão.

3. **Opção B - Pelo terminal (com Node.js)**:
   ```bash
   node gerar-lista.js
   ```
   Isso lê a pasta `/imagens/` e gera `index.json` automaticamente.

4. **Opção C - Editar manualmente**:
   Edite `/imagens/index.json`:
   ```json
   [
     "foto1.jpg",
     "tela-notebook.png",
     "processador.webp",
     "memoria-ram.jpg"
   ]
   ```

5. **Acesse admin.html** e as imagens aparecerão como miniaturas para selecionar

No admin, você pode filtrar os produtos por nome, código ou categoria. Cada produto pode ter mais de uma foto selecionada.

### 4️⃣ **Adicionar Produtos**

1. Salve sua planilha como `dados/produtos.xls`
2. Substitua o arquivo antigo por esse novo arquivo
3. Recarregue o navegador
4. Os novos produtos aparecerão no catálogo

O site procura primeiro por `dados/produtos.xls`. O arquivo `dados/produtos.csv` fica apenas como reserva.

### 5️⃣ **Subir no GitHub**

```bash
# No terminal da pasta do projeto
git init
git add .
git commit -m "Catálogo de produtos online - TechParts Store"
git branch -M main
git remote add origin https://github.com/seu-usuario/techparts-store.git
git push -u origin main
```

Depois acesse:
```
https://seu-usuario.github.io/techparts-store/
```

## 📁 Estrutura do Projeto

```
techparts-store/
├── index.html              (Página principal)
├── admin.html              (Administração)
├── style.css               (Estilos)
├── script.js               (Lógica catálogo)
├── admin.js                (Lógica admin)
├── gerar-lista.js          (Script helper)
├── .gitignore              (Git ignore)
├── README.md               (Este arquivo)
├── dados/
│   ├── produtos.xls        (Produtos principais)
│   └── produtos.csv        (Reserva)
└── imagens/
    ├── index.json          (Lista de imagens)
    ├── foto1.jpg
    ├── tela.png
    └── (suas imagens aqui)
```

## ⚙️ Configurações

### Mudar o Número do WhatsApp

Edite `script.js` linha 10:
```javascript
const WHATSAPP_NUMBER = '5511999999999'; // Seu número aqui
```

### Mudar a Senha do Admin

Edite `admin.js` procurando por:
```javascript
if (senhaInput.value === '9933') { // Mude para sua senha
```

### Mudar Título e Informações

Edite `index.html` linha 6:
```html
<title>Catálogo de Produtos</title>
```

Edite a logo em `index.html` linha 13:
```html
<h1>🛒 TechParts Store</h1>
```

## 🔒 Segurança

- A senha é armazenada em `sessionStorage` (válida apenas durante a sessão)
- Ao fechar a aba, precisa digitar novamente
- As imagens são listadas no `index.json`

## 📱 Responsividade

Site totalmente responsivo:
- ✅ Mobile
- ✅ Tablet
- ✅ Desktop

## 💡 Dicas de Uso

1. **Barra de Pesquisa**: Procure por nome, código ou descrição
2. **Filtro de Categoria**: Veja apenas produtos de uma categoria
3. **Modal de Detalhes**: Clique no card do produto para ver mais informações e navegar pelo carrossel de fotos
4. **WhatsApp Automático**: Clique em "Tenho Interesse" para contatar via WhatsApp
5. **localStorage**: As associações de imagens são salvas automaticamente

## 🐛 Solução de Problemas

### "Nenhuma imagem encontrada"

- Certifique-se de que `/imagens/index.json` existe
- Verifique que os nomes no JSON correspondem aos arquivos das imagens
- Recarregue a página (Ctrl+F5 para cache limpo)

### Imagens não aparecem no catálogo

- Acesse `admin.html`
- Digite a senha: `9933`
- Selecione a imagem para cada produto no dropdown
- Clique em "Salvar Imagem"

### Arquivo index.json não encontrado

- Crie manualmente em `/imagens/index.json`
- Ou execute: `node gerar-lista.js`

### Imagens não carregam no GitHub Pages

- Verifique que os nomes no `index.json` são idênticos aos arquivos
- Use lowercase para nomes de arquivos
- Espere alguns minutos para o cache atualizar

## 🚀 Deploy

Você pode fazer deploy em:

### GitHub Pages
```bash
git push origin main
```
Depois acesse Settings > Pages > Deploy from branch: main

### Vercel
1. Acesse vercel.com
2. Clique "New Project"
3. Conecte seu repositório GitHub
4. Deploy automático!

### Netlify
1. Acesse netlify.com
2. Drag and drop a pasta do projeto
3. Pronto!

### Seu próprio servidor
- Basta copiar os arquivos para um servidor estático
- Nenhuma dependência necessária!

## 📞 Contato

**Telefone**: 55 (69) 992903194  
**Empresa**: VSTECH Informática

---

**Versão**: 2.0 - GitHub Ready  
**Última Atualização**: 26/05/2026  
**Licença**: MIT
