document.addEventListener("DOMContentLoaded", () => {
    const inventoryList = document.getElementById("inventory-list");
    const addIngredientForm = document.getElementById("add-ingredient-form");
    const generateShoppingListBtn = document.getElementById("generate-shopping-list");
    const shoppingListDiv = document.getElementById("shopping-list");
  
    // Fetch and display inventory
    async function fetchInventory() {
      const response = await fetch("/api/inventory");
      const inventory = await response.json();
  
      inventoryList.innerHTML = ""; // Clear the list
      inventory.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded");
        itemDiv.textContent = `${item.ingredientName}: ${item.quantity}`;
        inventoryList.appendChild(itemDiv);
      });
    }
  
    // Add a new ingredient
    addIngredientForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newIngredient = {
        ingredientName: document.getElementById("ingredient-name").value,
        quantity: document.getElementById("ingredient-quantity").value
      };
  
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIngredient)
      });
  
      fetchInventory(); // Refresh the list
      addIngredientForm.reset(); // Clear the form
    });
  
    // Generate shopping list (placeholder)
    generateShoppingListBtn.addEventListener("click", () => {
      shoppingListDiv.innerHTML = `
        <p class="bg-yellow-200 p-4 rounded">Shopping list generation coming soon!</p>
      `;
    });
  
    fetchInventory(); // Initial load
  });
  