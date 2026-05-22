const searchInput = document.getElementById("searchInput");
const groupFilter = document.getElementById("groupFilter");
const productTable = document.getElementById("productTable");
const statusText = document.getElementById("statusText");
const productCount = document.getElementById("productCount");

const PDF_FILE = "LISTA ITENS LOJA.pdf";
const WHATSAPP_NUMBER = "5592999999999";

let products = [];

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

searchInput.addEventListener("input", renderProducts);
groupFilter.addEventListener("change", renderProducts);
window.addEventListener("DOMContentLoaded", loadProductsFromPdf);

async function loadProductsFromPdf() {
  setStatus("Carregando lista de produtos...");

  try {
    const pdfUrl = `${encodeURI(PDF_FILE)}?v=${Date.now()}`;
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const rows = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      rows.push(...extractProductRowsFromPage(content.items));
    }

    products = rows.map(parseProductRow).filter(Boolean);
    fillGroupFilter(products);
    renderProducts();
    setStatus(`${products.length} produtos carregados.`);
  } catch (error) {
    console.error(error);
    products = [];
    fillGroupFilter(products);
    renderProducts();
    setStatus(`Não foi possível carregar o arquivo ${PDF_FILE}.`);
  }
}

function extractProductRowsFromPage(items) {
  const textLines = groupItemsByLine(items);
  const productRows = [];
  let activeRow = null;

  textLines.forEach((line) => {
    const lineText = joinParts(line.parts);

    if (!lineText || isIgnoredRow(lineText)) {
      return;
    }

    if (startsWithCode(lineText)) {
      if (activeRow) {
        productRows.push(activeRow);
      }

      activeRow = {
        parts: [...line.parts],
      };
      return;
    }

    if (activeRow) {
      activeRow.parts.push(...line.parts);
    }
  });

  if (activeRow) {
    productRows.push(activeRow);
  }

  return productRows;
}

function groupItemsByLine(items) {
  const lines = new Map();

  items.forEach((item) => {
    const text = item.str.trim();

    if (!text) {
      return;
    }

    const y = Math.round(item.transform[5]);
    const x = item.transform[4];

    if (!lines.has(y)) {
      lines.set(y, []);
    }

    lines.get(y).push({ x, text });
  });

  return [...lines.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) => ({
      parts: parts.sort((a, b) => a.x - b.x),
    }));
}

function parseProductRow(row) {
  const columns = splitRowIntoColumns(row.parts);

  if (!columns.code || !columns.name || !columns.value) {
    return null;
  }

  return {
    code: columns.code,
    name: columns.name,
    group: columns.group || "Geral",
    unit: columns.unit || "-",
    value: formatMoney(columns.value),
  };
}

function splitRowIntoColumns(parts) {
  const columns = {
    code: [],
    name: [],
    group: [],
    unit: [],
    prices: [],
  };

  parts
    .filter((part) => part.text && !isIgnoredRow(part.text))
    .sort((a, b) => a.x - b.x)
    .forEach((part) => {
      const text = normalizePdfText(part.text);

      if (!text) {
        return;
      }

      if (isMoney(text)) {
        columns.prices.push(text);
        return;
      }

      if (part.x < 105 && startsWithCode(text)) {
        columns.code.push(text.match(/^\d+/)[0]);
        const rest = text.replace(/^\d+\s*/, "").trim();

        if (rest) {
          columns.name.push(rest);
        }

        return;
      }

      if (part.x < 415) {
        columns.name.push(text);
        return;
      }

      if (part.x < 535) {
        columns.group.push(text);
        return;
      }

      if (part.x < 570) {
        columns.unit.push(text);
      }
    });

  const fallback = splitJoinedRow(joinParts(parts));

  return {
    code: cleanColumn(columns.code.join(" ")) || fallback.code,
    name: cleanColumn(columns.name.join(" ")) || fallback.name,
    group: normalizeGroup(cleanColumn(columns.group.join(" "))) || fallback.group,
    unit: cleanColumn(columns.unit.join(" ")) || fallback.unit,
    value: columns.prices[columns.prices.length - 1] || fallback.value,
  };
}

function splitJoinedRow(rowText) {
  const cleanRow = normalizePdfText(rowText);
  const moneyValues = cleanRow.match(/(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2}/g) || [];
  const value = moneyValues[moneyValues.length - 1] || "";
  const beforePrices = moneyValues[0] ? cleanRow.split(moneyValues[0])[0].trim() : cleanRow;
  const codeMatch = beforePrices.match(/^(\d+)\s+(.+)$/);

  if (!codeMatch) {
    return {
      code: "",
      name: "",
      group: "",
      unit: "",
      value,
    };
  }

  const code = codeMatch[1];
  const description = codeMatch[2].trim();
  const groupMatch = description.match(/^(.*?)(ADAPTADOR WIFI|Alto-falante|BATERIA\\CARREGADORES|BATERIAS\\CARREGADORES|BATERIAS NOTEBOOK|CABO ADAPTADOR|CARCAÇAS|DC JACK|FLAT|FONTES NB|FONTES|PÇ IMPRESSORA|PEÇAS REPOSIÇÃO|PERIFÉRICOS)$/i);

  return {
    code,
    name: groupMatch ? groupMatch[1].trim() : description,
    group: groupMatch ? normalizeGroup(groupMatch[2]) : "Geral",
    unit: "",
    value,
  };
}

function joinParts(parts) {
  return parts
    .sort((a, b) => a.x - b.x)
    .map((part) => part.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePdfText(value) {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/BATERIAS\\CARREGAD\s*RES/gi, "BATERIAS\\CARREGADORES")
    .replace(/BATERIA\\CARREGADO\s*ES/gi, "BATERIA\\CARREGADORES")
    .trim();
}

function normalizeGroup(value) {
  return cleanColumn(value)
    .replace(/BATERIAS\\CARREGAD\s*RES/gi, "BATERIAS\\CARREGADORES")
    .replace(/BATERIA\\CARREGADO\s*ES/gi, "BATERIA\\CARREGADORES");
}

function cleanColumn(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function startsWithCode(value) {
  return /^\d+\b/.test(value.trim());
}

function isMoney(value) {
  return /^(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2}$/.test(value.trim());
}

function isIgnoredRow(row) {
  return /listagem de itens|c[oó]digo|nome|grupo|custo|valor|p[aá]gina \d+ de \d+|usu[aá]rio/i.test(row);
}

function fillGroupFilter(productList) {
  const currentValue = groupFilter.value;
  const groups = [...new Set(productList.map((product) => product.group))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  groupFilter.innerHTML = '<option value="">Todos os grupos</option>';

  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupFilter.appendChild(option);
  });

  groupFilter.value = groups.includes(currentValue) ? currentValue : "";
}

function renderProducts() {
  const searchTerm = normalizeText(searchInput.value);
  const selectedGroup = groupFilter.value;

  const filteredProducts = products.filter((product) => {
    const matchesName = normalizeText(product.name).includes(searchTerm);
    const matchesGroup = !selectedGroup || product.group === selectedGroup;
    return matchesName && matchesGroup;
  });

  productTable.innerHTML = "";
  productCount.textContent = filteredProducts.length;

  if (filteredProducts.length === 0) {
    productTable.innerHTML = `
      <tr>
        <td class="empty-row" colspan="6">Nenhum produto encontrado.</td>
      </tr>
    `;
    return;
  }

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(product.code)}</td>
      <td>${escapeHtml(product.name)}</td>
      <td>${escapeHtml(product.group)}</td>
      <td>${escapeHtml(product.unit)}</td>
      <td class="price">${escapeHtml(product.value)}</td>
      <td>
        <button class="interest-button" type="button">Tenho interesse</button>
      </td>
    `;

    row.querySelector("button").addEventListener("click", () => {
      openWhatsApp(product);
    });

    productTable.appendChild(row);
  });
}

function openWhatsApp(product) {
  const message = `Olá, tenho interesse neste item: ${product.name} - Valor: ${product.value}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function formatMoney(value) {
  const cleanedValue = value.replace("R$", "").trim();
  return `R$ ${cleanedValue}`;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setStatus(message) {
  statusText.textContent = message;
}

renderProducts();
