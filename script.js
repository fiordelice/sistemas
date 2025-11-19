// Banco de dados local
let stores = JSON.parse(localStorage.getItem('stores')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];

let currentStoreId = null;

// Inicialização
window.onload = function() {
    updateStoresList();
    updateStoreSelect();
    updateProductsTable();
    updateSalesTable();
    updateDashboard();
}

// Alternar seções
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Adicionar loja
function addStore() {
    const name = document.getElementById('store-name').value.trim();
    if(name === '') return alert('Nome da loja é obrigatório!');
    const store = { id: stores.length + 1, name };
    stores.push(store);
    localStorage.setItem('stores', JSON.stringify(stores));
    document.getElementById('store-name').value = '';
    updateStoresList();
    updateStoreSelect();
}

function updateStoresList() {
    const ul = document.getElementById('stores-list');
    ul.innerHTML = '';
    stores.forEach(store => {
        const li = document.createElement('li');
        li.textContent = store.name;
        ul.appendChild(li);
    });
}

// Adicionar produto
function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    if(!name || isNaN(price) || isNaN(stock)) return alert('Preencha todos os campos!');
    const product = { id: products.length + 1, name, price, stock };
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-stock').value = '';
    updateProductsTable();
    updateProductSelect();
}

function updateProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.name}</td><td>R$ ${p.price.toFixed(2)}</td><td>${p.stock}</td><td></td>`;
        tbody.appendChild(tr);
    });
    updateProductSelect();
}

// Atualizar selects
function updateStoreSelect() {
    const select = document.getElementById('sale-store');
    select.innerHTML = '';
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.id;
        option.textContent = store.name;
        select.appendChild(option);
    });
}

function updateProductSelect() {
    const select = document.getElementById('sale-product');
    select.innerHTML = '';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - R$ ${product.price.toFixed(2)} (Estoque: ${product.stock})`;
        select.appendChild(option);
    });
}

// Registrar venda
function registerSale() {
    const storeId = parseInt(document.getElementById('sale-store').value);
    const productId = parseInt(document.getElementById('sale-product').value);
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    const store = stores.find(s => s.id === storeId);
    const product = products.find(p => p.id === productId);
    if(!store || !product || isNaN(quantity) || quantity <= 0) return alert('Preencha todos os campos corretamente!');
    if(product.stock < quantity) return alert('Estoque insuficiente!');
    product.stock -= quantity;
    const sale = {
        storeId: store.id,
        storeName: store.name,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
        date: new Date().toISOString()
    };
    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('products', JSON.stringify(products));
    document.getElementById('sale-quantity').value = '';
    updateProductsTable();
    updateSalesTable();
    updateDashboard();
}

// Atualizar tabela de vendas
function updateSalesTable() {
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';
    sales.forEach(sale => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${sale.storeName}</td><td>${sale.productName}</td><td>R$ ${sale.price.toFixed(2)}</td><td>${sale.quantity}</td><td>R$ ${sale.total.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    });
}

// Dashboard com gráficos
function updateDashboard() {
    const totalSales = sales.reduce((acc, s) => acc + s.total, 0);
    const totalProfit = totalSales * 0.3; // lucro estimado 30%
    document.getElementById('totalSales').textContent = totalSales.toFixed(2);
    document.getElementById('totalProfit').textContent = totalProfit.toFixed(2);

    // ----------------- VENDAS POR DIA -----------------
    const dailySales = {};
    sales.forEach(sale => {
        const day = sale.date.split('T')[0];
        dailySales[day] = (dailySales[day] || 0) + sale.total;
    });
    fillTable('daily-table', dailySales);

    // ----------------- VENDAS POR SEMANA -----------------
// ----------------- VENDAS POR SEMANA -----------------
const weeklySales = {};
sales.forEach(sale => {
    const date = new Date(sale.date);
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const weekLabel = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    weeklySales[weekLabel] = (weeklySales[weekLabel] || 0) + sale.total;
});
fillTable('weekly-table', weeklySales);

// Funções auxiliares
function getStartOfWeek(d) {
    const day = d.getDay(); // 0=domingo, 1=segunda, ...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajusta pra segunda
    return new Date(d.setDate(diff));
}

function formatDate(d) {
    const day = d.getDate().toString().padStart(2,'0');
    const month = (d.getMonth()+1).toString().padStart(2,'0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}


    // ----------------- VENDAS POR MÊS -----------------
    const monthlySales = {};
    sales.forEach(sale => {
        const date = new Date(sale.date);
        const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}`;
        monthlySales[month] = (monthlySales[month] || 0) + sale.total;
    });
    fillTable('monthly-table', monthlySales);
}

// Função para preencher tabela
function fillTable(tableId, dataObj) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';
    for(const key in dataObj) {
        const tr = document.createElement('tr');
        const total = dataObj[key];
        const profit = total * 0.3;
        tr.innerHTML = `<td>${key}</td><td>R$ ${total.toFixed(2)}</td><td>R$ ${profit.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    }
}

// Função para calcular número da semana
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}
