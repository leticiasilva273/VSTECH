const ADMIN = {
    autenticado: sessionStorage.getItem('adminAutenticado') === 'true',
    imagensDisponiveis: [],
    produtoEditando: null,
    selecaoTemporaria: new Set(),
    filtros: {
        busca: '',
        categoria: '',
        ordenacao: 'default'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const senhaInput = document.getElementById('adminPassword');
    if (senhaInput) {
        senhaInput.addEventListener('keypress', event => {
            if (event.key === 'Enter') autenticarAdmin();
        });
    }

    configurarFiltrosAdmin();
    setTimeout(() => {
        inicializarAdmin();
    }, 1000);
});

async function inicializarAdmin() {
    if (!ADMIN.autenticado) {
        const notice = document.querySelector('.admin-notice');
        if (notice) notice.style.display = 'none';
        return;
    }

    const authSection = document.getElementById('authSection');
    const adminTools = document.getElementById('adminTools');
    if (authSection) authSection.style.display = 'none';
    if (adminTools) adminTools.style.display = 'grid';

    await carregarImagensDisponiveis();
    renderizarCategoriasAdmin();
    renderizarProdutosAdmin();
}

function autenticarAdmin() {
    const senhaInput = document.getElementById('adminPassword');

    if (senhaInput.value === '9933') {
        sessionStorage.setItem('adminAutenticado', 'true');
        location.reload();
    } else {
        alert('Senha incorreta');
        senhaInput.value = '';
        senhaInput.focus();
    }
}

function fazerLogoutAdmin() {
    const confirmacao = confirm('Deseja fazer logout?');
    if (confirmacao) {
        sessionStorage.removeItem('adminAutenticado');
        location.reload();
    }
}

function configurarFiltrosAdmin() {
    const searchInput = document.getElementById('adminSearchInput');
    const categoryFilter = document.getElementById('adminCategoryFilter');
    const sortFilter = document.getElementById('adminSortFilter');
    const modal = document.getElementById('adminImageModal');

    if (searchInput) {
        searchInput.addEventListener('input', event => {
            ADMIN.filtros.busca = event.target.value;
            renderizarProdutosAdmin();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', event => {
            ADMIN.filtros.categoria = event.target.value;
            renderizarProdutosAdmin();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', event => {
            ADMIN.filtros.ordenacao = event.target.value;
            renderizarProdutosAdmin();
        });
    }

    if (modal) {
        modal.addEventListener('click', event => {
            if (event.target === modal) fecharSeletorImagens();
        });
    }
}

async function carregarImagensDisponiveis() {
    try {
        const response = await fetch('./imagens/index.json', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error('Erro ao carregar lista de imagens');
        }

        const imagens = await response.json();
        ADMIN.imagensDisponiveis = Array.isArray(imagens) ? imagens : [];
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
        ADMIN.imagensDisponiveis = [];
    }
}

function renderizarCategoriasAdmin() {
    const categoryFilter = document.getElementById('adminCategoryFilter');
    if (!categoryFilter || !window.APP?.categoriasUnicas) return;

    categoryFilter.innerHTML = '<option value="">Todas</option>';

    const categoriasVisiveis = new Set(
        window.APP.produtos
            .filter(produto => !window.produtoEhPecaNotebook || window.produtoEhPecaNotebook(produto))
            .map(produto => produto.categoria)
            .filter(categoria => categoria && (!window.categoriaEhPermitidaNoFiltro || window.categoriaEhPermitidaNoFiltro(categoria)))
    );

    Array.from(categoriasVisiveis).sort().forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        categoryFilter.appendChild(option);
    });
}

function renderizarProdutosAdmin() {
    const grid = document.getElementById('adminProductsGrid');
    const loading = document.getElementById('adminLoading');
    const resultsCount = document.getElementById('adminResultsCount');

    if (!ADMIN.autenticado || !grid || !loading) return;

    loading.style.display = 'block';
    grid.style.display = 'none';

    if (!window.APP || !window.APP.produtos || window.APP.produtos.length === 0) {
        setTimeout(renderizarProdutosAdmin, 500);
        return;
    }

    const categoryFilter = document.getElementById('adminCategoryFilter');
    if (categoryFilter && categoryFilter.options.length <= 1) {
        renderizarCategoriasAdmin();
    }

    const produtos = filtrarProdutosAdmin();

    loading.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';

    produtos.forEach(produto => {
        grid.appendChild(criarCardProdutoAdmin(produto));
    });

    if (resultsCount) {
        resultsCount.textContent = `${produtos.length} de ${window.APP.produtos.length} produtos`;
    }
}

function filtrarProdutosAdmin() {
    const busca = normalizarTexto(ADMIN.filtros.busca);
    const categoria = ADMIN.filtros.categoria;

    const produtos = window.APP.produtos.filter(produto => {
        const textoProduto = normalizarTexto([
            produto.codigo,
            produto.nome,
            produto.categoria,
            produto.descricao
        ].join(' '));

        const correspondeBusca = !busca || textoProduto.includes(busca);
        const correspondeCategoria = !categoria || produto.categoria === categoria;

        return correspondeBusca && correspondeCategoria;
    });

    return ordenarProdutosAdmin(produtos);
}

function ordenarProdutosAdmin(produtos) {
    if (ADMIN.filtros.ordenacao === 'default') {
        return produtos;
    }

    return [...produtos].sort((a, b) => {
        const fotosA = window.obterImagensProduto(a.codigo).length;
        const fotosB = window.obterImagensProduto(b.codigo).length;

        if (ADMIN.filtros.ordenacao === 'without-images') {
            return fotosA - fotosB;
        }

        return fotosB - fotosA;
    });
}

function criarCardProdutoAdmin(produto) {
    const card = document.createElement('div');
    card.className = 'admin-product-card';
    card.setAttribute('data-codigo', produto.codigo);

    const imagens = window.obterImagensProduto(produto.codigo);

    card.innerHTML = `
        <div class="admin-card-header">
            <div>
                <div class="admin-product-code">${escapeHtml(produto.codigo)}</div>
                <h3 class="admin-product-name">${escapeHtml(produto.nome)}</h3>
            </div>
        </div>

        <div class="admin-product-info">
            <strong>Categoria:</strong> ${escapeHtml(produto.categoria)}
        </div>
        <div class="admin-product-info">
            <strong>Valor:</strong> ${escapeHtml(produto.valor)}
        </div>

        <div class="image-preview-section">
            <div class="image-preview" id="preview_${escapeAttr(produto.codigo)}">
                ${renderizarPreviewSelecionadas(produto.codigo)}
            </div>
        </div>

        <div class="image-selector">
            <span class="image-summary" id="summary_${escapeAttr(produto.codigo)}">${imagens.length} foto(s) selecionada(s)</span>
            <button type="button" class="btn-pick-images" onclick="abrirSeletorImagens('${escapeJs(produto.codigo)}')">
                Escolher fotos
            </button>
            ${ADMIN.imagensDisponiveis.length === 0 ? '<small style="color: var(--cor-alerta); display: block; margin-top: 8px;">Nenhuma imagem encontrada. Coloque imagens na pasta /imagens/ e rode atualizar-imagens.bat.</small>' : ''}
        </div>

        <div id="status_${escapeAttr(produto.codigo)}"></div>

        <div class="admin-card-actions" style="margin-top: 15px;">
            <button class="btn-remove" onclick="removerImagemProduto('${escapeJs(produto.codigo)}')">
                Remover fotos
            </button>
        </div>
    `;

    return card;
}

function renderizarPreviewSelecionadas(codigo) {
    const imagens = window.obterImagensProduto(codigo);

    if (imagens.length === 0) {
        return '<div class="image-placeholder">Sem foto</div>';
    }

    const miniaturas = imagens.slice(0, 8).map(imagem => `
        <div class="selected-image-thumb">
            <img src="${IMAGENS_PATH}${encodeURI(imagem)}" alt="">
        </div>
    `).join('');

    return `<div class="selected-images-grid">${miniaturas}</div>`;
}

function abrirSeletorImagens(codigo) {
    const produto = window.APP.produtos.find(item => item.codigo === codigo);
    const modal = document.getElementById('adminImageModal');
    const title = document.getElementById('adminImageModalTitle');

    ADMIN.produtoEditando = codigo;
    ADMIN.selecaoTemporaria = new Set(window.obterImagensProduto(codigo));

    if (title) {
        title.textContent = produto ? `Fotos de ${produto.codigo} - ${produto.nome}` : 'Selecionar fotos';
    }

    renderizarGaleriaImagens();
    if (modal) {
        modal.classList.remove('modal-closing');
        modal.style.display = 'flex';
    }
}

function fecharSeletorImagens() {
    const modal = document.getElementById('adminImageModal');
    if (!modal || modal.style.display === 'none') {
        ADMIN.produtoEditando = null;
        ADMIN.selecaoTemporaria.clear();
        return;
    }

    modal.classList.add('modal-closing');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('modal-closing');
        ADMIN.produtoEditando = null;
        ADMIN.selecaoTemporaria.clear();
    }, 180);
}

function renderizarGaleriaImagens() {
    const gallery = document.getElementById('adminImageGallery');
    if (!gallery) return;

    const imagensDisponiveisParaProduto = ADMIN.imagensDisponiveis.filter(imagem => {
        return ADMIN.selecaoTemporaria.has(imagem) || !imagemJaVinculadaEmOutroProduto(imagem);
    });

    if (imagensDisponiveisParaProduto.length === 0) {
        gallery.innerHTML = '<p>Nenhuma imagem livre encontrada. Coloque novas imagens na pasta imagens e rode atualizar-imagens.bat.</p>';
        atualizarContadorSelecao();
        return;
    }

    gallery.innerHTML = imagensDisponiveisParaProduto.map(imagem => {
        const selected = ADMIN.selecaoTemporaria.has(imagem) ? 'selected' : '';
        return `
            <button type="button" class="image-choice ${selected}" onclick="alternarImagemSelecionada('${escapeJs(imagem)}')" title="${escapeAttr(imagem)}">
                <img src="${IMAGENS_PATH}${encodeURI(imagem)}" alt="${escapeAttr(imagem)}">
                <span class="image-choice-check">✓</span>
            </button>
        `;
    }).join('');

    atualizarContadorSelecao();
}

function imagemJaVinculadaEmOutroProduto(imagem) {
    return Object.entries(window.APP.imagensPorProduto).some(([codigo, imagens]) => {
        if (codigo === ADMIN.produtoEditando) return false;
        const lista = Array.isArray(imagens) ? imagens : [imagens].filter(Boolean);
        return lista.includes(imagem);
    });
}

function alternarImagemSelecionada(imagem) {
    if (ADMIN.selecaoTemporaria.has(imagem)) {
        ADMIN.selecaoTemporaria.delete(imagem);
    } else {
        ADMIN.selecaoTemporaria.add(imagem);
    }

    renderizarGaleriaImagens();
}

function atualizarContadorSelecao() {
    const count = document.getElementById('adminImageSelectionCount');
    if (count) count.textContent = `${ADMIN.selecaoTemporaria.size} foto(s) selecionada(s)`;
}

function salvarSelecaoImagens() {
    const codigo = ADMIN.produtoEditando;
    if (!codigo) return;

    window.APP.imagensPorProduto[codigo] = Array.from(ADMIN.selecaoTemporaria);
    window.salvarImagensNoLocalStorage();

    atualizarCardProduto(codigo);
    mostrarStatus(codigo, 'Fotos salvas com sucesso!', 'status-saved');
    fecharSeletorImagens();
}

function removerImagemProduto(codigo) {
    const confirmacao = confirm('Tem certeza que deseja remover todas as fotos deste produto?');
    if (!confirmacao) return;

    window.APP.imagensPorProduto[codigo] = [];
    window.salvarImagensNoLocalStorage();

    atualizarCardProduto(codigo);
    mostrarStatus(codigo, 'Fotos removidas', 'status-empty');
}

function atualizarCardProduto(codigo) {
    const preview = document.getElementById(`preview_${codigo}`);
    const summary = document.getElementById(`summary_${codigo}`);
    const imagens = window.obterImagensProduto(codigo);

    if (preview) preview.innerHTML = renderizarPreviewSelecionadas(codigo);
    if (summary) summary.textContent = `${imagens.length} foto(s) selecionada(s)`;
}

function mostrarStatus(codigo, mensagem, classe) {
    const statusDiv = document.getElementById(`status_${codigo}`);
    if (!statusDiv) return;

    statusDiv.innerHTML = `<div class="status-message ${classe}">${escapeHtml(mensagem)}</div>`;
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 3000);
}

function exibirEstatisticas() {
    console.log('=== ESTATISTICAS ===');
    console.log(`Total de produtos: ${window.APP.produtos.length}`);
    console.log(`Produtos com imagem: ${Object.values(window.APP.imagensPorProduto).filter(lista => Array.isArray(lista) && lista.length > 0).length}`);
    console.log(`Categorias unicas: ${Array.from(window.APP.categoriasUnicas).length}`);
    console.log('Imagens por produto:', window.APP.imagensPorProduto);
}

function escapeHtml(valor) {
    return String(valor || '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function escapeAttr(valor) {
    return escapeHtml(valor);
}

function escapeJs(valor) {
    return String(valor || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

window.abrirSeletorImagens = abrirSeletorImagens;
window.fecharSeletorImagens = fecharSeletorImagens;
window.alternarImagemSelecionada = alternarImagemSelecionada;
window.salvarSelecaoImagens = salvarSelecaoImagens;
window.removerImagemProduto = removerImagemProduto;
window.fazerLogoutAdmin = fazerLogoutAdmin;
window.autenticarAdmin = autenticarAdmin;
window.exibirEstatisticas = exibirEstatisticas;
