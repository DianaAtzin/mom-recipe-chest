document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements for Instructions
  const toggleInstructionsButton = document.getElementById("toggle-instructions");
  const instructionsList = document.getElementById("instructions-list");
   // DOM Elements for Recipes
  const recipeList = document.getElementById("recipe-list");
  const allButton = document.querySelector(".all-button");
  const searchInput = document.getElementById("search-recipes");
  const showFavoritesButton = document.getElementById("show-favorites");
  const showAddFormButton = document.getElementById("show-add-form");
  const recipeFormContainer = document.getElementById("recipe-form-container");
  const recipeForm = document.getElementById("add-recipe-form");
  const formTitle = document.getElementById("form-title");
  const formSubmitButton = document.getElementById("form-submit-button");
  const cancelFormButton = document.getElementById("cancel-form");
  const categoryDropdown = document.getElementById("category-dropdown");

  let allRecipes = []; // Store all recipes
  let editingRecipeId = null; // Track the recipe being edited

  // Section: Instructions Toggle
   toggleInstructionsButton.addEventListener("click", () => {
    instructionsList.classList.toggle("hidden"); // Show or hide the instructions
  });

  // Hide the recipe list and form by default
  recipeList.style.display = "none";
  recipeFormContainer.classList.add("hidden");

  // Function to toggle the form visibility
  function toggleForm(show, isEdit = false) {
    if (show) {
      recipeFormContainer.classList.remove("hidden");
      if (isEdit) {
        formTitle.textContent = "Edit Recipe";
        formSubmitButton.textContent = "Save Changes";
      } else {
        formTitle.textContent = "Add a New Recipe";
        formSubmitButton.textContent = "Add Recipe";
        recipeForm.reset(); // Clear the form for new input
      }
    } else {
      recipeFormContainer.classList.add("hidden");
      editingRecipeId = null; // Reset editing state
    }
  }

  // Fetch recipes from the server
  async function fetchRecipes() {
    try {
      const response = await fetch("/api/recipes");
      allRecipes = await response.json();
      console.log("Recipes fetched:", allRecipes);
      updateCategoryDropdown(); // Update dropdown with categories
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
          <h3 class="text-lg font-bold flex justify-between items-center">
            ${recipe.name} (${recipe.category})
            <span class="favorite-star cursor-pointer ${
              recipe.favorite ? "text-yellow-500" : "text-gray-400"
            }" data-id="${recipe.id || recipe.recipeID}">
              ★
            </span>
          </h3>
          <p>${recipe.description}</p>
          <ul class="list-disc list-inside">
            ${recipe.ingredients.map((ing) => `<li>${ing.quantity} ${ing.ingredientName}</li>`).join("")}
          </ul>
          <p class="mb-4"><strong>Instructions:</strong> ${recipe.instructions}</p>
          <div class="flex gap-4 mt-4">
            <button class="edit-button bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" data-id="${recipe.id || recipe.recipeID}">
              Edit
            </button>
            <button class="delete-button bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" data-id="${recipe.id || recipe.recipeID}">
              Delete
            </button>
          </div>
        `;
        recipeList.appendChild(recipeDiv);
      });
    }

    recipeList.style.display = "block";
  }

  // Update the category dropdown options
  function updateCategoryDropdown() {
    const uniqueCategories = [...new Set(allRecipes.map((recipe) => recipe.category))];
    categoryDropdown.innerHTML = `<option value="">All Categories</option>`;
    uniqueCategories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryDropdown.appendChild(option);
    });
  }

  // Add/Edit Recipe
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
      favorite: editingRecipeId
        ? allRecipes.find((r) => r.id === editingRecipeId || r.recipeID === editingRecipeId)?.favorite || false
        : false, // Preserve favorite state during edit
    };

    try {
      if (editingRecipeId) {
        // Edit recipe
        const response = await fetch(`/api/recipes/${editingRecipeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipeData),
        });

        if (response.ok) {
          const updatedRecipe = await response.json();
          console.log("Recipe updated:", updatedRecipe);

          allRecipes = allRecipes.map((r) =>
            r.id === editingRecipeId || r.recipeID === editingRecipeId ? updatedRecipe : r
          );
          displayRecipes(allRecipes); // Refresh all recipes
          toggleForm(false);
        }
      } else {
        // Add new recipe
        const response = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipeData),
        });

        if (response.ok) {
          const newRecipe = await response.json();
          console.log("New recipe added:", newRecipe);

          allRecipes.push(newRecipe);
          displayRecipes(allRecipes); // Refresh all recipes
          updateCategoryDropdown(); // Update dropdown with new category
          toggleForm(false);
        }
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  });

  // Handle Edit Button
recipeList.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-button")) {
    const recipeId = parseInt(e.target.getAttribute("data-id"), 10);
    const recipe = allRecipes.find((r) => r.id === recipeId || r.recipeID === recipeId);

    if (recipe) {
      editingRecipeId = recipeId;

      // Populate form fields with the recipe details
      document.getElementById("recipe-name").value = recipe.name;
      document.getElementById("recipe-description").value = recipe.description;
      document.getElementById("recipe-ingredients").value = recipe.ingredients
        .map((ing) => `${ing.quantity} ${ing.ingredientName}`)
        .join(", ");
      document.getElementById("recipe-instructions").value = recipe.instructions;
      document.getElementById("recipe-category").value = recipe.category;

      // Show the form in edit mode
      toggleForm(true, true);

      // Scroll to the form
      recipeFormContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});


  // Show Add Form Button
  showAddFormButton.addEventListener("click", () => {
    toggleForm(true); // Open the add form
  });

  // Cancel Form Button
  cancelFormButton.addEventListener("click", () => {
    toggleForm(false); // Hide the form
  });

  // Handle Delete Button
  recipeList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-button")) {
      const recipeId = parseInt(e.target.getAttribute("data-id"), 10);

      try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log(`Recipe with ID ${recipeId} deleted`);
          allRecipes = allRecipes.filter((r) => r.id !== recipeId && r.recipeID !== recipeId);
          displayRecipes(allRecipes);
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  });

  // Toggle Favorite
  recipeList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("favorite-star")) {
      const recipeId = parseInt(e.target.getAttribute("data-id"), 10);
      const recipe = allRecipes.find((r) => r.id === recipeId || r.recipeID === recipeId);

      if (recipe) {
        recipe.favorite = !recipe.favorite;

        try {
          const response = await fetch(`/api/recipes/${recipeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recipe),
          });

          if (response.ok) {
            console.log(`Favorite status updated for recipe ID ${recipeId}`);
            displayRecipes(allRecipes);
          }
        } catch (error) {
          console.error("Error updating favorite status:", error);
        }
      }
    }
  });

  // Show Favorite Recipes
  showFavoritesButton.addEventListener("click", () => {
    const favoriteRecipes = allRecipes.filter((recipe) => recipe.favorite);
    displayRecipes(favoriteRecipes);
  });

  // Show All Recipes
  allButton.addEventListener("click", () => {
    displayRecipes(allRecipes);
  });

  // Filter Recipes by Category
  categoryDropdown.addEventListener("change", () => {
    const selectedCategory = categoryDropdown.value;
    if (selectedCategory === "") {
      displayRecipes(allRecipes);
    } else {
      const filteredRecipes = allRecipes.filter((recipe) => recipe.category === selectedCategory);
      displayRecipes(filteredRecipes);
    }
  });

  // Search Recipes
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (query === "") {
      recipeList.style.display = "none"; // Hide recipes if query is empty
    } else {
      const filteredRecipes = allRecipes.filter((recipe) => {
        const matchesName = recipe.name.toLowerCase().includes(query);
        const matchesCategory = recipe.category.toLowerCase().includes(query);
        const matchesIngredient = recipe.ingredients.some((ing) =>
          ing.ingredientName.toLowerCase().includes(query)
        );
        return matchesName || matchesCategory || matchesIngredient;
      });

      displayRecipes(filteredRecipes); // Display filtered results
    }
  });

  // Fetch recipes on page load
  fetchRecipes();
});

