document.addEventListener("DOMContentLoaded", () => {
  const inventoryList = document.getElementById("inventory-list");
  const addIngredientForm = document.getElementById("add-ingredient-form");
  const searchIngredientsInput = document.getElementById("search-ingredients");
  const generateShoppingListBtn = document.getElementById("generate-shopping-list");
  const shoppingListDiv = document.getElementById("shopping-list");

  let inventory = [];

  // Fetch and display inventory
  async function fetchInventory() {
    try {
      const response = await fetch("/api/inventory");
      inventory = await response.json();
      displayInventory(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }

  // Display inventory
  function displayInventory(items) {
    inventoryList.innerHTML = ""; // Clear the list

    if (items.length === 0) {
      inventoryList.innerHTML = `<p class="text-gray-500">No ingredients found.</p>`;
      return;
    }

    items.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded", "flex", "justify-between", "items-center");

      itemDiv.innerHTML = `
        <span>${item.ingredientName}: ${item.quantity}</span>
        <div class="flex gap-2">
          <button class="edit-ingredient bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" data-id="${item.id}">Edit</button>
          <button class="delete-ingredient bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" data-id="${item.id}">Delete</button>
        </div>
      `;

      inventoryList.appendChild(itemDiv);
    });
  }

  // Add a new ingredient
  addIngredientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newIngredient = {
      ingredientName: document.getElementById("ingredient-name").value.trim(),
      quantity: document.getElementById("ingredient-quantity").value.trim()
    };

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIngredient)
      });

      if (response.ok) {
        fetchInventory(); // Refresh the list
        addIngredientForm.reset(); // Clear the form
      } else {
        console.error("Error adding ingredient");
      }
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  });

  // Search ingredients
  searchIngredientsInput.addEventListener("input", () => {
    const query = searchIngredientsInput.value.trim().toLowerCase();

    const filteredItems = inventory.filter(item =>
      item.ingredientName.toLowerCase().includes(query)
    );

    displayInventory(filteredItems);
  });

  // Generate shopping list (placeholder logic)
  generateShoppingListBtn.addEventListener("click", () => {
    shoppingListDiv.innerHTML = `
      <p class="bg-yellow-200 p-4 rounded">Shopping list generation is under construction!</p>
    `;
  });

  // Initial fetch
  fetchInventory();
});