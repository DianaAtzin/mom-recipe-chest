document.addEventListener("DOMContentLoaded", () => {
  const inventoryList = document.getElementById("inventory-list");
  const addIngredientForm = document.getElementById("add-ingredient-form");
  const addIngredientContainer = document.getElementById("add-ingredient-container");
  const showAddFormButton = document.getElementById("show-add-form");
  const cancelAddButton = document.getElementById("cancel-add");
  const allButton = document.querySelector(".all-button");
  const hideListButton = document.getElementById("hide-list-button");
  const searchInput = document.getElementById("search-ingredients");
  const inventorySection = document.querySelector("#inventory-section");

  let allIngredients = [];
  let editingIngredientName = null;

  inventorySection.classList.add("hidden");
  addIngredientContainer.classList.add("hidden");

  async function fetchInventory() {
    try {
      const response = await fetch("/api/inventory");
      allIngredients = await response.json();
      console.log("Fetched inventory:", allIngredients);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }

  function displayIngredients(ingredients) {
    inventoryList.innerHTML = "";

    if (ingredients.length === 0) {
      const noResultsMessage = document.createElement("div");
      noResultsMessage.classList.add("bg-yellow-100", "text-yellow-800", "p-4", "rounded", "shadow");
      noResultsMessage.textContent = "No ingredients match your search.";
      inventoryList.appendChild(noResultsMessage);
    } else {
      ingredients.forEach((item) => appendIngredientToList(item));
    }
  }

  function appendIngredientToList(item) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded", "flex", "justify-between", "items-center");

    itemDiv.innerHTML = `
      <span>${item.ingredientName}: ${item.quantity}</span>
      <div class="flex gap-2">
        <button class="edit-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" data-name="${item.ingredientName}">
          Edit
        </button>
        <button class="delete-button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" data-name="${item.ingredientName}">
          Delete
        </button>
      </div>
    `;
    inventoryList.appendChild(itemDiv);
  }

  addIngredientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ingredientName = document.getElementById("ingredient-name").value.trim();
    const quantity = document.getElementById("ingredient-quantity").value.trim();

    if (!ingredientName || !quantity) {
      alert("Both ingredient name and quantity are required.");
      return;
    }

    if (editingIngredientName) {
      try {
        const response = await fetch(`/api/inventory/${editingIngredientName}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });

        if (response.ok) {
          const updatedIngredient = await response.json();
          const index = allIngredients.findIndex((i) => i.ingredientName === editingIngredientName);
          allIngredients[index] = updatedIngredient;
          displayIngredients(allIngredients);
          editingIngredientName = null;
          addIngredientForm.reset();
          addIngredientContainer.classList.add("hidden");
        }
      } catch (error) {
        console.error("Error updating ingredient:", error);
      }
      return;
    }

    const existingIngredient = allIngredients.find(
      (item) => item.ingredientName.toLowerCase() === ingredientName.toLowerCase()
    );

    if (existingIngredient) {
      alert(
        `The ingredient "${ingredientName}" is already in the inventory. Please edit it to update the quantity.`
      );
      document.getElementById("ingredient-name").value = existingIngredient.ingredientName;
      document.getElementById("ingredient-quantity").value = existingIngredient.quantity;
      editingIngredientName = existingIngredient.ingredientName;
      return;
    }

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientName, quantity }),
      });

      if (response.ok) {
        const newIngredient = await response.json();
        allIngredients.push(newIngredient);
        appendIngredientToList(newIngredient);
        inventorySection.classList.remove("hidden");
        addIngredientForm.reset();
        addIngredientContainer.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error saving ingredient:", error);
    }
  });

  inventoryList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-button")) {
      const ingredientName = e.target.getAttribute("data-name");
      const ingredient = allIngredients.find((item) => item.ingredientName === ingredientName);

      if (ingredient) {
        editingIngredientName = ingredient.ingredientName;
        document.getElementById("ingredient-name").value = ingredient.ingredientName;
        document.getElementById("ingredient-quantity").value = ingredient.quantity;
        addIngredientContainer.classList.remove("hidden");
      }
    }

    if (e.target.classList.contains("delete-button")) {
      const ingredientName = e.target.getAttribute("data-name");

      fetch(`/api/inventory/${ingredientName}`, { method: "DELETE" })
        .then((response) => {
          if (response.ok) {
            allIngredients = allIngredients.filter((i) => i.ingredientName !== ingredientName);
            displayIngredients(allIngredients);
          }
        })
        .catch((error) => console.error("Error deleting ingredient:", error));
    }
  });

  allButton.addEventListener("click", () => {
    inventorySection.classList.remove("hidden");
    displayIngredients(allIngredients);
  });

  hideListButton.addEventListener("click", () => {
    inventorySection.classList.add("hidden");
    inventoryList.innerHTML = "";
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    inventorySection.classList.remove("hidden");
    const filteredIngredients = allIngredients.filter((item) =>
      item.ingredientName.toLowerCase().includes(query)
    );
    displayIngredients(filteredIngredients);
  });

  showAddFormButton.addEventListener("click", () => {
    addIngredientContainer.classList.remove("hidden");
    addIngredientForm.reset();
    editingIngredientName = null;
  });

  cancelAddButton.addEventListener("click", () => {
    addIngredientContainer.classList.add("hidden");
    addIngredientForm.reset();
  });

  fetchInventory();
});




