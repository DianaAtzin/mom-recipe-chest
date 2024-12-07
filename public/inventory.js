document.addEventListener("DOMContentLoaded", () => {
  const inventoryList = document.getElementById("inventory-list");
  const addIngredientForm = document.getElementById("add-ingredient-form");
  const addFormContainer = document.getElementById("add-ingredient-form-container");
  const showAddFormButton = document.getElementById("show-add-form");
  const cancelAddFormButton = document.getElementById("cancel-add-form");
  const generateShoppingListBtn = document.getElementById("generate-shopping-list");
  const shoppingListDiv = document.getElementById("shopping-list");
  const shoppingListSection = document.getElementById("shopping-list-section");
  const cancelShoppingListButton = document.getElementById("cancel-shopping-list");
  const allButton = document.querySelector(".all-button");
  const hideListButton = document.getElementById("hide-list-button");
  const searchInput = document.getElementById("search-ingredients");
  const inventorySection = document.querySelector("#inventory-section");
  const alertMessage = document.getElementById("alert-message");
  const formSubmitButton = addIngredientForm.querySelector("button[type='submit']");

  let allIngredients = [];
  let editingIngredientName = null;
  let allRecipes = []; // Store fetched recipes for shopping list generation

  // Hide inventory and shopping list sections by default
  inventorySection.classList.add("hidden");
  shoppingListSection.classList.add("hidden");

  // Fetch inventory from the server
  async function fetchInventory() {
    try {
      const response = await fetch("/api/inventory");
      allIngredients = await response.json();
      console.log("Fetched inventory:", allIngredients);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }

  // Fetch recipes from the server
  async function fetchRecipes() {
    try {
      const response = await fetch("/api/recipes"); // Adjust the API endpoint if necessary
      allRecipes = await response.json();
      console.log("Fetched recipes:", allRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  function showDuplicateAlert(ingredientName) {
    alertMessage.textContent = `The ingredient "${ingredientName}" is already in the inventory. Please edit it to update the quantity.`;
    alertMessage.className = "bg-yellow-200 text-yellow-800 p-4 rounded shadow mb-4";
    alertMessage.classList.remove("hidden");

    setTimeout(() => {
      alertMessage.classList.add("hidden");
    }, 5000);
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

  // Add or Edit Ingredient
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
          formSubmitButton.textContent = "Add Ingredient"; // Reset button text
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
      showDuplicateAlert(ingredientName);
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
      }
    } catch (error) {
      console.error("Error saving ingredient:", error);
    }
  });

  // Edit Button
  inventoryList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-button")) {
      const ingredientName = e.target.getAttribute("data-name");
      const ingredient = allIngredients.find((item) => item.ingredientName === ingredientName);

      if (ingredient) {
        editingIngredientName = ingredient.ingredientName;
        document.getElementById("ingredient-name").value = ingredient.ingredientName;
        document.getElementById("ingredient-quantity").value = ingredient.quantity;

        addFormContainer.classList.remove("hidden");
        formSubmitButton.textContent = "Save Changes";

        // Smooth scroll to form
        addFormContainer.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  // Delete Button
  inventoryList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-button")) {
      const ingredientName = e.target.getAttribute("data-name");

      try {
        const response = await fetch(`/api/inventory/${ingredientName}`, {
          method: "DELETE",
        });

        if (response.ok) {
          allIngredients = allIngredients.filter((i) => i.ingredientName !== ingredientName);
          displayIngredients(allIngredients);
        }
      } catch (error) {
        console.error("Error deleting ingredient:", error);
      }
    }
  });

  // Merge Ingredients from Selected Recipes 
  function mergeIngredientsFromRecipes(selectedRecipes) {
    const mergedIngredients = {};
  
    selectedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const name = ingredient.ingredientName.toLowerCase(); // Normalize by lowercase
        const quantity = parseFloat(ingredient.quantity) || 0; // Convert quantity to a number if possible
  
        if (!mergedIngredients[name]) {
          mergedIngredients[name] = { ingredientName: ingredient.ingredientName, quantity };
        } else {
          mergedIngredients[name].quantity += quantity; // Add quantities if the ingredient already exists
        }
      });
    });
  
    return Object.values(mergedIngredients); // Return as an array
  }


// Generate Shopping List Section
function populateShoppingListSection() {
  // Clear any existing shopping list content
  shoppingListDiv.innerHTML = "";

  // Add instructions
  const instructions = document.createElement("p");
  instructions.classList.add("mb-4");
  instructions.textContent = "Select the recipes you want to include in your shopping list:";
  shoppingListDiv.appendChild(instructions);

  // Add recipe checkboxes
  const recipeList = document.createElement("ul");
  recipeList.classList.add("list-inside");

  allRecipes.forEach((recipe) => {
    const listItem = document.createElement("li");
    listItem.classList.add("mb-2");
    listItem.innerHTML = `
      <label class="flex items-center gap-2">
        <input type="checkbox" class="recipe-checkbox" value="${recipe.name}">
        <span>${recipe.name}</span>
      </label>
    `;
    recipeList.appendChild(listItem);
  });

  shoppingListDiv.appendChild(recipeList);

  // Create a container for the buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "flex gap-4 mt-4";

  // Generate Shopping List Button
  const generateButton = document.createElement("button");
  generateButton.id = "create-shopping-list";
  generateButton.className = "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600";
  generateButton.textContent = "Create";

  // Attach generate logic
  generateButton.addEventListener("click", generateShoppingList);

  // Cancel Button
  const cancelButton = document.createElement("button");
  cancelButton.id = "cancel-shopping-list";
  cancelButton.className = "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600";
  cancelButton.textContent = "Cancel";

  // Attach cancel logic
  cancelButton.addEventListener("click", () => {
    shoppingListSection.classList.add("hidden");
    shoppingListDiv.innerHTML = ""; // Clear the shopping list
  });

  // Append buttons to the container
  buttonContainer.appendChild(generateButton);
  buttonContainer.appendChild(cancelButton);

  // Append the container to the shopping list div
  shoppingListDiv.appendChild(buttonContainer);

  // Ensure the shopping list section is visible
  shoppingListSection.classList.remove("hidden");
}





// Generate Shopping List
function generateShoppingList() {
  const selectedRecipes = Array.from(
    document.querySelectorAll(".recipe-checkbox:checked")
  ).map((checkbox) => {
    const recipeName = checkbox.value;
    return allRecipes.find((recipe) => recipe.name === recipeName);
  });

  if (selectedRecipes.length === 0) {
    shoppingListDiv.innerHTML = `<p class="text-red-500">Please select at least one recipe to generate the shopping list.</p>`;
    return;
  }

  // Merge ingredients from selected recipes
  const mergedIngredients = mergeIngredientsFromRecipes(selectedRecipes);

  // Clear the shopping list but keep the cancel button
  shoppingListDiv.innerHTML = ""; // Clear the shopping list content

  // Add the merged ingredients to the shopping list
  mergedIngredients.forEach((ingredient) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded");
    itemDiv.textContent = `${ingredient.ingredientName}: ${ingredient.quantity}`;
    shoppingListDiv.appendChild(itemDiv);
  });

  // Add Cancel Button
  const cancelButton = document.createElement("button");
  cancelButton.id = "cancel-shopping-list";
  cancelButton.className = "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4";
  cancelButton.textContent = "Cancel";

  // Attach cancel logic
  cancelButton.addEventListener("click", () => {
    shoppingListSection.classList.add("hidden");
    shoppingListDiv.innerHTML = ""; // Clear the shopping list
  });

  shoppingListDiv.appendChild(cancelButton);

  shoppingListSection.classList.remove("hidden");
}


  // Generate Shopping List Button
  generateShoppingListBtn.addEventListener("click", () => {
    shoppingListSection.classList.remove("hidden");
    populateShoppingListSection(); // Ensure recipe checkboxes are populated
    shoppingListSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  

  

  // Cancel Button for Add Form
  cancelAddFormButton.addEventListener("click", () => {
    addFormContainer.classList.add("hidden");
    addIngredientForm.reset();
    editingIngredientName = null;
    formSubmitButton.textContent = "Add Ingredient";
  });

  // Show All Ingredients
  allButton.addEventListener("click", () => {
    inventorySection.classList.remove("hidden");
    displayIngredients(allIngredients); // Display all ingredients
  });

  // Hide Inventory List
  hideListButton.addEventListener("click", () => {
    inventorySection.classList.add("hidden");
    inventoryList.innerHTML = "";
  });

  // Search Ingredients
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    inventorySection.classList.remove("hidden");

    const filteredIngredients = allIngredients.filter((item) =>
      item.ingredientName.toLowerCase().includes(query)
    );
    displayIngredients(filteredIngredients);
  });

  // Show Add Form
  showAddFormButton.addEventListener("click", () => {
    addFormContainer.classList.remove("hidden");
    addIngredientForm.reset();
    editingIngredientName = null;
    formSubmitButton.textContent = "Add Ingredient"; // Reset button text
  });

  fetchInventory();
  fetchRecipes(); // Fetch recipes for shopping list generation
});




