#!/usr/bin/env node

/**
 * Helper Script - Gerar Lista de Imagens
 * 
 * Este script lê todos os arquivos de imagem da pasta /imagens/
 * e gera automaticamente o arquivo index.json
 * 
 * Como usar:
 * 1. Coloque este arquivo no diretório raiz do projeto
 * 2. Execute: node gerar-lista.js
 * 3. O arquivo /imagens/index.json será atualizado automaticamente
 */

const fs = require('fs');
const path = require('path');

// Extensões de imagem suportadas
const extensoesSuportadas = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

// Caminho da pasta de imagens
const pastaImagens = path.join(__dirname, 'imagens');
const caminhoIndex = path.join(pastaImagens, 'index.json');

try {
    // Criar pasta se não existir
    if (!fs.existsSync(pastaImagens)) {
        fs.mkdirSync(pastaImagens, { recursive: true });
        console.log('✅ Pasta /imagens/ criada');
    }

    // Ler arquivos da pasta
    const arquivos = fs.readdirSync(pastaImagens);

    // Filtrar apenas imagens
    const imagens = arquivos
        .filter(arquivo => {
            const ext = path.extname(arquivo).toLowerCase();
            return extensoesSuportadas.includes(ext);
        })
        .sort();

    // Salvar em JSON
    fs.writeFileSync(caminhoIndex, JSON.stringify(imagens, null, 2));

    console.log('✅ Lista atualizada com sucesso!');
    console.log(`📁 ${imagens.length} imagem(ns) encontrada(s):`);
    imagens.forEach(img => console.log(`   - ${img}`));
    console.log(`💾 Arquivo salvo em: imagens/index.json`);

} catch (error) {
    console.error('❌ Erro ao gerar lista:', error.message);
    process.exit(1);
}
