const XLS_URL = './dados/produtos.xls';
const CSV_URL = './dados/produtos.csv';
const IMAGENS_PATH = './imagens/';
const WHATSAPP_NUMBER = '556993419933';
const STORAGE_KEY = 'vstech_imagens_produtos';
const NOTEBOOK_INCLUDE_TERMS = [
    'notebook',
    'laptop',
    'ultrabook',
    'netbook',
    'tela',
    'display',
    'lcd',
    'led',
    'touch',
    'touchscreen',
    'carcaca',
    'carcacas',
    'base',
    'tampa',
    'dobradica',
    'dobradicas',
    'flat',
    'flats',
    'cabo flat',
    'bateria',
    'carregador',
    'fonte notebook',
    'fonte para notebook',
    'teclado notebook',
    'dc jack',
    'jack',
    'conector dc',
    'power jack',
    'cooler notebook',
    'fan notebook',
    'alto falante',
    'speaker',
    'webcam',
    'touchpad',
    'palmrest',
    'moldura',
    'bezel',
    'placa mae notebook',
    'placa-mae notebook',
    'placa notebook',
    'inspiron',
    'latitude',
    'vostro',
    'ideapad',
    'thinkpad',
    'vivobook',
    'zenbook',
    'aspire',
    'nitro',
    'pavilion',
    'probook',
    'elitebook',
    'macbook',
    'chromebook',
    'compaq',
    'positivo',
    'samsung book',
    'lenovo',
    'dell',
    'acer',
    'asus',
    'hp'
];
const NOTEBOOK_EXCLUDE_TERMS = [
    'mouse',
    'teclado gamer',
    'teclado mecanico',
    'adaptador wifi',
    'adaptador wireless',
    'adaptador usb',
    'adaptador vga',
    'adaptador hdmi',
    'adaptador tipo c',
    'adapt conversor',
    'caixa de som',
    'fone',
    'headset',
    'microfone',
    'webcam usb',
    'pendrive',
    'pen drive',
    'cabo hdmi',
    'cabo vga',
    'cabo usb',
    'cabo de rede',
    'roteador',
    'switch',
    'monitor',
    'desktop',
    'pc gamer',
    'gabinete',
    'case atx',
    'placa mae h',
    'placa-mae h',
    'placa mae desktop',
    'processador',
    'fonte atx',
    'fonte 500w',
    'fonte real',
    'cooler cpu',
    'memoria ram',
    'ssd',
    'hd sata',
    'impressora',
    'pç impressora',
    'peca impressora',
    'toner',
    'cartucho',
    'papel',
    'bandeja saida',
    'rolete',
    'fusor',
    'laserjet',
    'deskjet',
    'officejet',
    'epson',
    'canon',
    'brother',
    'lexmark',
    'ricoh',
    'xerox',
    'hp m',
    'hp p',
    'hp desk'
];
const CATEGORY_FILTER_EXCLUDE_TERMS = [
    'periferico',
    'perifericos',
    'desktop',
    'impressora',
    'pç impressora',
    'peca impressora',
    'processador',
    'monitores',
    'monitor'
];

const APP = {
    produtos: [],
    categoriasUnicas: new Set(),
    imagensPorProduto: {},
    carousel: {
        imagens: [],
        indice: 0
    },
    filtros: {
        busca: '',
        categoria: ''
    }
};

window.APP = APP;
window.IMAGENS_PATH = IMAGENS_PATH;

document.addEventListener('DOMContentLoaded', () => {
    carregarImagensDoLocalStorage();
    configurarEventos();
    carregarProdutos();
});

async function carregarProdutos() {
    const loadingMsg = document.getElementById('loadingMessage');
    const errorMsg = document.getElementById('errorMessage');

    try {
        APP.produtos = await carregarProdutosDaPlanilha();
        APP.categoriasUnicas = new Set(APP.produtos.map(produto => produto.categoria).filter(Boolean));

        if (loadingMsg) loadingMsg.style.display = 'none';
        if (errorMsg) errorMsg.style.display = 'none';

        renderizarCategorias();
        renderizarProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        if (loadingMsg) loadingMsg.style.display = 'none';
        if (errorMsg) {
            errorMsg.textContent = `Erro ao carregar produtos: ${error.message}. Confira se dados/produtos.xls foi enviado junto com o site.`;
            errorMsg.style.display = 'block';
        }
    }
}

async function carregarProdutosDaPlanilha() {
    if (typeof XLSX !== 'undefined') {
        try {
            const response = await fetch(XLS_URL, { cache: 'no-store' });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, {
                    type: 'array',
                    cellDates: true
                });

                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                if (!worksheet) {
                    throw new Error('nenhuma aba encontrada na planilha');
                }

                const linhas = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: '',
                    raw: false
                });

                return converterLinhasEmProdutos(linhas);
            }
        } catch (error) {
            console.warn('Nao foi possivel carregar XLS, tentando CSV:', error);
        }
    }

    return carregarProdutosDoCsv();
}

async function carregarProdutosDoCsv() {
    const response = await fetch(CSV_URL, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`nao foi possivel carregar ${CSV_URL}. Status: ${response.status}`);
    }

    const csv = await response.text();
    return converterCsvEmProdutos(csv);
}

function converterLinhasEmProdutos(linhas) {
    const indiceCabecalho = encontrarIndiceCabecalho(linhas);

    if (indiceCabecalho === -1) {
        throw new Error('cabecalho da planilha nao encontrado');
    }

    const cabecalhos = linhas[indiceCabecalho].map(normalizarTexto);

    return linhas.slice(indiceCabecalho + 1)
        .map((linha, index) => criarProdutoDaLinha(linha, cabecalhos, index))
        .filter(Boolean);
}

function encontrarIndiceCabecalho(linhas) {
    return linhas.findIndex(linha => {
        const colunas = linha.map(normalizarTexto);
        const temCodigo = colunas.some(valor => valor === 'codigo' || valor === 'cod' || valor === 'cod.');
        const temDescricao = colunas.some(valor => valor.includes('descricao') || valor === 'nome' || valor.includes('produto'));
        const temValor = colunas.some(valor => valor.includes('venda') || valor.includes('valor') || valor.includes('preco'));

        return temCodigo && (temDescricao || temValor);
    });
}

function criarProdutoDaLinha(linha, cabecalhos, index) {
    const codigo = obterCampo(linha, cabecalhos, ['codigo', 'cod', 'cod.']);
    const nome = obterCampo(linha, cabecalhos, ['descricao', 'nome', 'produto']);
    const categoria = obterCampo(linha, cabecalhos, ['grupo', 'categoria', 'secao']) || 'Sem categoria';
    const quantidade = Number(String(obterCampo(linha, cabecalhos, ['disponivel', 'estoque', 'quantidade', 'qtd']) || '0').replace(',', '.')) || 0;
    const valorBruto = obterCampo(linha, cabecalhos, ['venda', 'valor', 'preco', 'preco venda']);
    const codigoFinal = String(codigo || `ITEM-${index + 1}`).trim();

    if (!codigo && !nome) return null;

    return {
        codigo: codigoFinal,
        nome: String(nome || 'Produto sem nome').trim(),
        categoria: String(categoria || 'Sem categoria').trim(),
        descricao: String(nome || 'Sem descricao').trim(),
        valor: formatarValor(valorBruto),
        estoque: quantidade > 0 ? `Disponível: ${quantidade}` : 'Indisponível',
        quantidade,
        localizacao: obterCampo(linha, cabecalhos, ['localizacao', 'local']),
        gaveta: obterCampo(linha, cabecalhos, ['gaveta']),
        imagens: obterImagensProduto(codigoFinal)
    };
}

function obterCampo(linha, cabecalhos, nomes) {
    const nomesNormalizados = nomes.map(normalizarTexto);
    let index = cabecalhos.findIndex(cabecalho => nomesNormalizados.includes(cabecalho));

    if (index === -1) {
        index = cabecalhos.findIndex(cabecalho => nomesNormalizados.some(nome => cabecalho.includes(nome)));
    }

    return index >= 0 ? linha[index] : '';
}

function converterCsvEmProdutos(csv) {
    const linhas = csv
        .split(/\r?\n/)
        .map(linha => linha.trim())
        .filter(Boolean);

    return linhas.slice(1).map((linha, index) => {
        const colunas = parseCsvLine(linha);
        const codigo = String(colunas[0] || '').trim();
        const nome = String(colunas[1] || '').trim();
        const categoria = String(colunas[2] || 'Sem categoria').trim();
        const descricao = String(colunas[3] || nome || 'Sem descricao').trim();
        const estoque = String(colunas[colunas.length - 1] || 'Indisponivel').trim();
        const valor = colunas.slice(4, -1).join(',').trim();

        return {
            codigo: codigo || `ITEM-${index + 1}`,
            nome: nome || 'Produto sem nome',
            categoria,
            descricao,
            valor: valor || 'Consulte',
            estoque,
            quantidade: obterQuantidadeEstoque(estoque),
            imagens: obterImagensProduto(codigo)
        };
    }).filter(produto => produto.nome !== 'Produto sem nome');
}

function parseCsvLine(linha) {
    const valores = [];
    let atual = '';
    let dentroDeAspas = false;

    for (let i = 0; i < linha.length; i += 1) {
        const char = linha[i];
        const proximo = linha[i + 1];

        if (char === '"' && proximo === '"') {
            atual += '"';
            i += 1;
        } else if (char === '"') {
            dentroDeAspas = !dentroDeAspas;
        } else if (char === ',' && !dentroDeAspas) {
            valores.push(atual);
            atual = '';
        } else {
            atual += char;
        }
    }

    valores.push(atual);
    return valores;
}

function obterQuantidadeEstoque(estoque) {
    const numero = String(estoque).match(/\d+/);
    if (numero) return Number(numero[0]);
    return normalizarTexto(estoque).includes('indisponivel') ? 0 : 1;
}

function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === '') return 'Consulte';

    if (typeof valor === 'number') {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    const texto = String(valor).trim();
    if (texto.includes('R$')) return texto;

    const numero = Number(texto.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(numero)) {
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    return texto || 'Consulte';
}

function configurarEventos() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const clearFilters = document.getElementById('clearFilters');
    const modal = document.getElementById('productModal');
    const modalClose = document.querySelector('.modal-close');

    if (searchInput) {
        searchInput.addEventListener('input', event => {
            APP.filtros.busca = event.target.value;
            renderizarProdutos();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', event => {
            APP.filtros.categoria = event.target.value;
            renderizarProdutos();
        });
    }

    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            APP.filtros.busca = '';
            APP.filtros.categoria = '';
            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            renderizarProdutos();
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', fecharModal);
    }

    if (modal) {
        modal.addEventListener('click', event => {
            if (event.target === modal) fecharModal();
        });
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') fecharModal();
    });
}

function renderizarCategorias() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';

    const categoriasVisiveis = new Set(
        APP.produtos
            .filter(produto => produto.quantidade > 0 && produtoEhPecaNotebook(produto))
            .map(produto => produto.categoria)
            .filter(categoria => categoria && categoriaEhPermitidaNoFiltro(categoria))
    );

    Array.from(categoriasVisiveis).sort().forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        categoryFilter.appendChild(option);
    });
}

function renderizarProdutos() {
    const grid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    if (!grid) return;

    const produtosFiltrados = filtrarProdutos();
    grid.innerHTML = '';

    produtosFiltrados.forEach(produto => {
        grid.appendChild(criarCardProduto(produto));
    });

    if (noResults) {
        noResults.style.display = produtosFiltrados.length === 0 ? 'block' : 'none';
    }
}

function filtrarProdutos() {
    const busca = normalizarTexto(APP.filtros.busca);
    const categoria = APP.filtros.categoria;

    return APP.produtos.filter(produto => {
        const textoProduto = normalizarTexto([
            produto.codigo,
            produto.nome,
            produto.categoria,
            produto.descricao
        ].join(' '));

        const correspondeBusca = !busca || textoProduto.includes(busca);
        const correspondeCategoria = !categoria || produto.categoria === categoria;

        return produto.quantidade > 0 && produtoEhPecaNotebook(produto) && correspondeBusca && correspondeCategoria;
    });
}

function produtoEhPecaNotebook(produto) {
    const texto = normalizarTexto([
        produto.codigo,
        produto.nome,
        produto.categoria,
        produto.descricao
    ].join(' '));

    const possuiTermoNotebook = NOTEBOOK_INCLUDE_TERMS.some(termo => texto.includes(termo));
    const possuiTermoExcluido = NOTEBOOK_EXCLUDE_TERMS.some(termo => texto.includes(termo));

    return possuiTermoNotebook && !possuiTermoExcluido;
}

function categoriaEhPermitidaNoFiltro(categoria) {
    const texto = normalizarTexto(categoria);
    return !CATEGORY_FILTER_EXCLUDE_TERMS.some(termo => texto.includes(termo));
}

function criarCardProduto(produto) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Ver detalhes de ${produto.nome}`);

    const statusClasse = obterClasseEstoque(produto.estoque);

    card.innerHTML = `
        <div class="product-image-container">
            ${criarImagemProduto(produto)}
            ${criarContadorImagens(produto)}
            <span class="product-category-badge">${escapeHtml(produto.categoria)}</span>
        </div>
        <div class="product-content">
            <div class="product-code">${escapeHtml(produto.codigo)}</div>
            <h2 class="product-name">${escapeHtml(produto.nome)}</h2>
            <p class="product-description">${escapeHtml(produto.descricao)}</p>
            <div class="product-price">${escapeHtml(produto.valor)}</div>
            <div class="product-stock ${statusClasse}">${escapeHtml(produto.estoque)}</div>
            <button type="button" class="btn-interest">Tenho Interesse</button>
        </div>
    `;

    card.addEventListener('click', () => abrirModal(produto));
    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            abrirModal(produto);
        }
    });

    const interestBtn = card.querySelector('.btn-interest');
    interestBtn.addEventListener('click', event => {
        event.stopPropagation();
        abrirWhatsApp(produto);
    });

    return card;
}

function criarImagemProduto(produto) {
    const primeiraImagem = obterImagensProduto(produto.codigo)[0];

    if (!primeiraImagem) {
        return '<div class="product-placeholder" aria-hidden="true">Sem foto</div>';
    }

    return `<img class="product-image" src="${IMAGENS_PATH}${encodeURI(primeiraImagem)}" alt="${escapeHtml(produto.nome)}" onerror="this.outerHTML='<div class=&quot;product-placeholder&quot; aria-hidden=&quot;true&quot;>Sem foto</div>'">`;
}

function criarContadorImagens(produto) {
    const total = obterImagensProduto(produto.codigo).length;
    if (total <= 1) return '';
    return `<span class="product-image-count">${total} fotos</span>`;
}

function abrirModal(produto) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    modal.classList.remove('modal-closing');
    APP.carousel.imagens = obterImagensProduto(produto.codigo);
    APP.carousel.indice = 0;

    document.getElementById('modalName').textContent = produto.nome;
    document.getElementById('modalCode').textContent = produto.codigo;
    document.getElementById('modalCategory').textContent = produto.categoria;
    document.getElementById('modalDescription').textContent = produto.descricao;
    document.getElementById('modalPrice').textContent = produto.valor;
    document.getElementById('modalStock').textContent = produto.estoque;

    atualizarCarouselModal(produto.nome);

    const modalInterestBtn = document.getElementById('modalInterestBtn');
    modalInterestBtn.onclick = () => abrirWhatsApp(produto);

    modal.style.display = 'block';
}

function atualizarCarouselModal(nomeProduto) {
    const modalImage = document.getElementById('modalImage');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const counter = document.getElementById('carouselCounter');
    const emptyState = document.getElementById('carouselEmpty');
    const imagens = APP.carousel.imagens;
    const temImagens = imagens.length > 0;

    if (modalImage) {
        if (temImagens) {
            const imagemAtual = imagens[APP.carousel.indice];
            modalImage.src = `${IMAGENS_PATH}${encodeURI(imagemAtual)}`;
            modalImage.alt = nomeProduto;
            modalImage.style.display = 'block';
        } else {
            modalImage.removeAttribute('src');
            modalImage.alt = '';
            modalImage.style.display = 'none';
        }
    }

    if (emptyState) emptyState.style.display = temImagens ? 'none' : 'flex';
    if (counter) counter.textContent = temImagens ? `${APP.carousel.indice + 1} / ${imagens.length}` : '';

    const mostrarControles = imagens.length > 1;
    if (prevBtn) prevBtn.style.display = mostrarControles ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = mostrarControles ? 'flex' : 'none';
}

function trocarImagemModal(direcao) {
    const imagens = APP.carousel.imagens;
    if (imagens.length <= 1) return;

    APP.carousel.indice = (APP.carousel.indice + direcao + imagens.length) % imagens.length;
    const nomeProduto = document.getElementById('modalName')?.textContent || 'Produto';
    atualizarCarouselModal(nomeProduto);
}

function fecharModal() {
    const modal = document.getElementById('productModal');
    if (!modal || modal.style.display === 'none') return;

    modal.classList.add('modal-closing');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('modal-closing');
    }, 180);
}
function abrirWhatsApp(produto) {

    const mensagem = 
`Olá! 

Tenho interesse neste produto:

 Produto: ${produto.nome}
 Código: ${produto.codigo}
 Valor: ${produto.valor}

Poderia me passar mais informações?`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank', 'noopener');
}

function carregarImagensDoLocalStorage() {
    try {
        APP.imagensPorProduto = normalizarMapaImagens(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
    } catch (error) {
        console.warn('Nao foi possivel ler imagens salvas:', error);
        APP.imagensPorProduto = {};
    }
}

function salvarImagensNoLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(APP.imagensPorProduto));
}

function normalizarMapaImagens(mapa) {
    return Object.fromEntries(Object.entries(mapa).map(([codigo, valor]) => {
        if (Array.isArray(valor)) {
            return [codigo, valor.filter(Boolean)];
        }

        return [codigo, valor ? [valor] : []];
    }));
}

function obterImagensProduto(codigo) {
    const imagens = APP.imagensPorProduto[codigo];
    if (Array.isArray(imagens)) return imagens.filter(Boolean);
    if (imagens) return [imagens];
    return [];
}

function obterClasseEstoque(estoque) {
    const texto = normalizarTexto(estoque);
    if (texto.includes('indisponivel')) return 'indisponivel';
    if (texto.includes('limitado')) return 'limitado';
    return 'disponivel';
}

function normalizarTexto(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
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

window.salvarImagensNoLocalStorage = salvarImagensNoLocalStorage;
window.renderizarProdutos = renderizarProdutos;
window.obterImagensProduto = obterImagensProduto;
window.trocarImagemModal = trocarImagemModal;
window.produtoEhPecaNotebook = produtoEhPecaNotebook;
window.categoriaEhPermitidaNoFiltro = categoriaEhPermitidaNoFiltro;
