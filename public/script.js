// Main Page Recipes Integration
document.addEventListener("DOMContentLoaded", () => {
  const recipeList = document.getElementById("recipe-list");
  const allButton = document.querySelector(".all-button"); // "All" button
  const searchInput = document.getElementById("search-recipes");
  const addRecipeForm = document.getElementById("add-recipe-form");

  let allRecipes = []; // Store all recipes for search functionality

  // Hide recipes by default
  recipeList.style.display = "none";

  // Fetch recipes without displaying them
  async function fetchRecipes() {
    try {
      const response = await fetch("/api/recipes");
      allRecipes = await response.json(); // Store recipes for searching
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  // Display multiple recipes (filtered or all)
  function displayRecipes(recipes) {
    recipeList.innerHTML = ""; // Clear the list

    if (recipes.length === 0) {
      // Display a no-results message if no recipes are found
      const noResultsMessage = document.createElement("div");
      noResultsMessage.classList.add("bg-yellow-100", "text-yellow-800", "p-4", "rounded", "shadow");
      noResultsMessage.textContent = "No recipes match your search.Try using a different keyword or check out all recipes by clicking 'All' Button.";
      recipeList.appendChild(noResultsMessage);
    } else {
      recipes.forEach(recipe => {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded");

        recipeDiv.innerHTML = `
          <h3 class="text-lg font-bold">${recipe.name} (${recipe.category})</h3>
          <p>${recipe.description}</p>
          <ul class="list-disc list-inside">
            ${recipe.ingredients.map(ing => `<li>${ing.quantity} ${ing.ingredientName}</li>`).join("")}
          </ul>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        `;

        recipeList.appendChild(recipeDiv);
      });
    }

    // Show or hide the recipe list based on content
    recipeList.style.display = "block"; // Always show the container for feedback
  }

  // Display a single recipe (e.g., newly added)
  function displaySingleRecipe(recipe) {
    const recipeDiv = document.createElement("div");
    recipeDiv.classList.add("bg-gray-200", "p-4", "mb-2", "rounded");

    recipeDiv.innerHTML = `
      <h3 class="text-lg font-bold">${recipe.name} (${recipe.category})</h3>
      <p>${recipe.description}</p>
      <ul class="list-disc list-inside">
        ${recipe.ingredients.map(ing => `<li>${ing.quantity} ${ing.ingredientName}</li>`).join("")}
      </ul>
      <p><strong>Instructions:</strong> ${recipe.instructions}</p>
    `;

    recipeList.appendChild(recipeDiv);
    recipeList.style.display = "block"; // Show the recipe list
  }

  // Search recipes based on input
  function searchRecipes(query) {
    const filteredRecipes = allRecipes.filter(recipe => {
      const lowerQuery = query.toLowerCase();

      // Match by name, category, or ingredient
      const matchesName = recipe.name.toLowerCase().includes(lowerQuery);
      const matchesCategory = recipe.category.toLowerCase().includes(lowerQuery);
      const matchesIngredient = recipe.ingredients.some(ing =>
        ing.ingredientName.toLowerCase().includes(lowerQuery)
      );

      return matchesName || matchesCategory || matchesIngredient;
    });

    displayRecipes(filteredRecipes); // Update the displayed recipes
  }

  // Show all recipes when "All" button is clicked
  allButton.addEventListener("click", () => {
    displayRecipes(allRecipes); // Show all recipes
  });

  // Search recipes as user types
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    if (query === "") {
      recipeList.style.display = "none"; // Hide recipes if query is empty
    } else {
      searchRecipes(query); // Search recipes with the query
    }
  });

  // Add a new recipe
  addRecipeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newRecipe = {
      name: document.getElementById("recipe-name").value,
      description: document.getElementById("recipe-description").value,
      ingredients: document.getElementById("recipe-ingredients").value.split(",").map(ing => {
        const [quantity, ...name] = ing.trim().split(" ");
        return { ingredientName: name.join(" "), quantity };
      }),
      instructions: document.getElementById("recipe-instructions").value,
      category: document.getElementById("recipe-category").value
    };

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe)
      });

      if (response.ok) {
        const addedRecipe = await response.json();

        // Add the new recipe to the local array
        allRecipes.push(addedRecipe);

        // Clear the list and display only the new recipe
        recipeList.innerHTML = ""; // Clear the list
        displaySingleRecipe(addedRecipe);

        // Reset the form
        addRecipeForm.reset();
      } else {
        console.error("Error adding recipe:", await response.text());
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  });

  fetchRecipes(); // Load recipes into the array without displaying them
});

