// Main Page Recipes Integration
document.addEventListener("DOMContentLoaded", () => {
  const recipeList = document.getElementById("recipe-list");
  const allButton = document.querySelector(".all-button"); // "All" button
  const searchInput = document.getElementById("search-recipes");
  const addRecipeForm = document.getElementById("add-recipe-form");

  // Hide recipes by default
  recipeList.style.display = "none";

  // Fetch and display recipes
  async function fetchRecipes() {
    try {
      const response = await fetch("/api/recipes");
      const recipes = await response.json();

      recipeList.innerHTML = ""; // Clear the list
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
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  // Show all recipes when "All" button is clicked
  allButton.addEventListener("click", () => {
    recipeList.style.display = "block"; // Show recipes
    fetchRecipes(); // Fetch and display recipes
  });

  // Optional: Hide recipes when search bar is cleared
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() === "") {
      recipeList.style.display = "none"; // Hide recipes
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
      await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe)
      });

      fetchRecipes(); // Refresh the list
      addRecipeForm.reset(); // Clear the form
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  });
});
