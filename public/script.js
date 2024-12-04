document.addEventListener("DOMContentLoaded", () => {
  const recipeList = document.getElementById("recipe-list");
  const allButton = document.querySelector(".all-button");
  const searchInput = document.getElementById("search-recipes");
  const recipeForm = document.getElementById("add-recipe-form");
  const formTitle = document.getElementById("form-title");
  const formSubmitButton = document.getElementById("form-submit-button");
  const showFavoritesButton = document.getElementById("show-favorites");

  let allRecipes = []; // Store all recipes
  let editingRecipeId = null; // Track the recipe being edited

  // Hide recipes by default
  recipeList.style.display = "none";

  // Fetch recipes from the server
  async function fetchRecipes() {
    try {
      const response = await fetch("/api/recipes");
      allRecipes = await response.json();
      console.log("Recipes fetched:", allRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  // Display recipes in the list
  function displayRecipes(recipes) {
    recipeList.innerHTML = "";

    if (recipes.length === 0) {
      const noResultsMessage = document.createElement("div");
      noResultsMessage.classList.add("bg-yellow-100", "text-yellow-800", "p-4", "rounded", "shadow");
      noResultsMessage.textContent = "No recipes match your search.";
      recipeList.appendChild(noResultsMessage);
    } else {
      recipes.forEach((recipe) => {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded");

        recipeDiv.innerHTML = `
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold">${recipe.name} (${recipe.category})</h3>
            <button class="favorite-button text-2xl ${
              recipe.favorite ? "text-yellow-400" : "text-gray-400"
            }" data-id="${recipe.id || recipe.recipeID}">
              ★
            </button>
          </div>
          <p>${recipe.description}</p>
          <ul class="list-disc list-inside">
            ${recipe.ingredients.map((ing) => `<li>${ing.quantity} ${ing.ingredientName}</li>`).join("")}
          </ul>
          <p class="mb-4"><strong>Instructions:</strong> ${recipe.instructions}</p>
          <div class="flex gap-4 mt-4">
            <button class="edit-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" data-id="${
              recipe.id || recipe.recipeID
            }">
              Edit
            </button>
            <button class="delete-button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" data-id="${
              recipe.id || recipe.recipeID
            }">
              Delete
            </button>
          </div>
        `;
        recipeList.appendChild(recipeDiv);
      });
    }

    recipeList.style.display = "block";
  }

  // Open edit mode for a recipe
  function openEditMode(recipe) {
    console.log("Opening edit mode for recipe:", recipe);
    editingRecipeId = recipe.id || recipe.recipeID;

    // Populate form with recipe data
    document.getElementById("recipe-name").value = recipe.name;
    document.getElementById("recipe-description").value = recipe.description;
    document.getElementById("recipe-ingredients").value = recipe.ingredients
      .map((ing) => `${ing.quantity} ${ing.ingredientName}`)
      .join(", ");
    document.getElementById("recipe-instructions").value = recipe.instructions;
    document.getElementById("recipe-category").value = recipe.category;

    formTitle.textContent = "Edit Recipe";
    formSubmitButton.textContent = "Save Changes";
  }

  // Close edit mode and reset form
  function closeEditMode() {
    console.log("Closing edit mode");
    editingRecipeId = null;
    formTitle.textContent = "Add a New Recipe";
    formSubmitButton.textContent = "Add Recipe";
    recipeForm.reset();
  }

  // Submit form (Add or Edit)
  recipeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const recipeData = {
      name: document.getElementById("recipe-name").value,
      description: document.getElementById("recipe-description").value,
      ingredients: document.getElementById("recipe-ingredients").value.split(",").map((ing) => {
        const [quantity, ...name] = ing.trim().split(" ");
        return { ingredientName: name.join(" "), quantity };
      }),
      instructions: document.getElementById("recipe-instructions").value,
      category: document.getElementById("recipe-category").value,
    };

    try {
      if (editingRecipeId) {
        console.log(`Saving edits for recipe ID: ${editingRecipeId}`);
        const response = await fetch(`/api/recipes/${editingRecipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipeData),
        });

        if (response.ok) {
          const updatedRecipe = await response.json();
          const index = allRecipes.findIndex((r) => r.id === editingRecipeId || r.recipeID === editingRecipeId);
          allRecipes[index] = updatedRecipe;

          displayRecipes(allRecipes); // Refresh the recipe list
          closeEditMode();
        } else {
          console.error("Failed to update recipe:", await response.text());
        }
      } else {
        console.log("Adding new recipe");
        const response = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipeData),
        });

        if (response.ok) {
          const newRecipe = await response.json();
          allRecipes.push(newRecipe);
          displayRecipes(allRecipes); // Refresh list
          recipeForm.reset();
        } else {
          console.error("Failed to add recipe:", await response.text());
        }
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  });

  // Delete recipe
  recipeList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-button")) {
      const recipeId = parseInt(e.target.getAttribute("data-id"), 10);

      try {
        const response = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });

        if (response.ok) {
          allRecipes = allRecipes.filter((r) => r.id !== recipeId && r.recipeID !== recipeId);
          displayRecipes(allRecipes); // Refresh list
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  });

  // Mark recipe as favorite
  recipeList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("favorite-button")) {
      const recipeId = parseInt(e.target.getAttribute("data-id"), 10);

      const recipe = allRecipes.find((r) => r.id === recipeId || r.recipeID === recipeId);
      if (recipe) {
        recipe.favorite = !recipe.favorite; // Toggle favorite
        displayRecipes(allRecipes);

        try {
          await fetch(`/api/recipes/${recipeId}/favorite`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorite: recipe.favorite }),
          });
        } catch (error) {
          console.error("Error updating favorite:", error);
        }
      }
    }
  });

  // Show Favorites
  showFavoritesButton.addEventListener("click", () => {
    const favorites = allRecipes.filter((recipe) => recipe.favorite);
    displayRecipes(favorites);
  });

  // Search recipes
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filteredRecipes = allRecipes.filter((recipe) => {
      const matchesName = recipe.name.toLowerCase().includes(query);
      const matchesCategory = recipe.category.toLowerCase().includes(query);
      const matchesIngredient = recipe.ingredients.some((ing) =>
        ing.ingredientName.toLowerCase().includes(query)
      );
      return matchesName || matchesCategory || matchesIngredient;
    });

    displayRecipes(filteredRecipes);
  });

  // Show all recipes
  allButton.addEventListener("click", () => {
    displayRecipes(allRecipes);
  });

  // Fetch recipes on page load
  fetchRecipes();
});
