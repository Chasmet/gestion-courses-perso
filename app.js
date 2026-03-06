const STORAGE_KEY = "mes_courses_app_v1";
const THEME_KEY = "mes_courses_theme_v1";

let products = [];

const bulkInput = document.getElementById("bulkInput");
const addProductsBtn = document.getElementById("addProductsBtn");
const shoppingList = document.getElementById("shoppingList");
const emptyState = document.getElementById("emptyState");
const totalItems = document.getElementById("totalItems");
const remainingItems = document.getElementById("remainingItems");
const validatedTotal = document.getElementById("validatedTotal");
const calcInput = document.getElementById("calcInput");
const calcBtn = document.getElementById("calcBtn");
const clearCalcBtn = document.getElementById("clearCalcBtn");
const calcResult = document.getElementById("calcResult");
const clearCheckedBtn = document.getElementById("clearCheckedBtn");
const resetAllBtn = document.getElementById("resetAllBtn");
const themeToggle = document.getElementById("themeToggle");

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    products = JSON.parse(saved);
  }
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙";
  }
}

function formatPrice(value) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function updateStats() {
  const total = products.length;
  const remaining = products.filter((p) => !p.checked).length;
  const totalValidated = products
    .filter((p) => p.priceValidated)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  totalItems.textContent = total;
  remainingItems.textContent = remaining;
  validatedTotal.textContent = formatPrice(totalValidated);
}

function renderProducts() {
  shoppingList.innerHTML = "";

  if (products.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  products.forEach((product) => {
    const item = document.createElement("div");
    item.className = "item";

    const checkedClass = product.checked ? "checked-name" : "";

    item.innerHTML = `
      <div class="item-top">
        <div class="item-name ${checkedClass}">${product.name}</div>
        <div class="item-actions">
          <label>
            <input type="checkbox" ${product.checked ? "checked" : ""} data-id="${product.id}" class="check-product" />
            Pris
          </label>
          <button class="small-btn delete-btn" data-id="${product.id}">Supprimer</button>
        </div>
      </div>

      <div class="item-bottom">
        <input 
          type="number" 
          step="0.01" 
          min="0" 
          placeholder="Prix réel" 
          value="${product.price !== null ? product.price : ""}" 
          data-id="${product.id}" 
          class="price-input"
        />
        <button class="small-btn validate-price-btn" data-id="${product.id}">
          Valider prix
        </button>
        <button class="small-btn reset-price-btn" data-id="${product.id}">
          Reset prix
        </button>
      </div>

      <div class="price-valid">
        ${product.priceValidated ? `Prix validé : ${formatPrice(product.price || 0)}` : "Prix non validé"}
      </div>
    `;

    shoppingList.appendChild(item);
  });

  bindDynamicEvents();
  updateStats();
}

function bindDynamicEvents() {
  document.querySelectorAll(".check-product").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const id = Number(e.target.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      product.checked = e.target.checked;
      saveProducts();
      renderProducts();
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      products = products.filter((p) => p.id !== id);
      saveProducts();
      renderProducts();
    });
  });

  document.querySelectorAll(".price-input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const id = Number(e.target.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      const value = parseFloat(e.target.value);
      product.price = Number.isNaN(value) ? null : value;
      saveProducts();
      updateStats();
    });
  });

  document.querySelectorAll(".validate-price-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      if (product.price === null || Number.isNaN(product.price)) {
        alert("Entre d'abord un prix.");
        return;
      }

      product.priceValidated = true;
      saveProducts();
      renderProducts();
    });
  });

  document.querySelectorAll(".reset-price-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      product.price = null;
      product.priceValidated = false;
      saveProducts();
      renderProducts();
    });
  });
}

function addProductsFromText(text) {
  const names = text
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (names.length === 0) {
    alert("Ajoute au moins un produit.");
    return;
  }

  const newProducts = names.map((name) => ({
    id: Date.now() + Math.floor(Math.random() * 100000),
    name,
    checked: false,
    price: null,
    priceValidated: false
  }));

  products = [...products, ...newProducts];
  saveProducts();
  renderProducts();
  bulkInput.value = "";
}

function calculateExpression() {
  const expression = calcInput.value.trim();

  if (!expression) {
    calcResult.textContent = "Résultat : 0";
    return;
  }

  const safeExpression = expression.replace(",", ".");

  if (!/^[0-9+\-*/().\s]+$/.test(safeExpression)) {
    calcResult.textContent = "Résultat : expression invalide";
    return;
  }

  try {
    const result = Function(`"use strict"; return (${safeExpression})`)();
    calcResult.textContent = `Résultat : ${result}`;
  } catch {
    calcResult.textContent = "Résultat : erreur";
  }
}

addProductsBtn.addEventListener("click", () => {
  addProductsFromText(bulkInput.value);
});

calcBtn.addEventListener("click", calculateExpression);

clearCalcBtn.addEventListener("click", () => {
  calcInput.value = "";
  calcResult.textContent = "Résultat : 0";
});

clearCheckedBtn.addEventListener("click", () => {
  products = products.filter((p) => !p.priceValidated);
  saveProducts();
  renderProducts();
});

resetAllBtn.addEventListener("click", () => {
  const confirmed = confirm("Tu veux vraiment tout supprimer ?");
  if (!confirmed) return;

  products = [];
  saveProducts();
  renderProducts();
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  saveTheme(isDark ? "dark" : "light");
});

loadProducts();
loadTheme();
renderProducts();
