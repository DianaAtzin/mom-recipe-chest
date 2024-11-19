// Recipes Integration
document.addEventListener("DOMContentLoaded", () => {
  const recipeList = document.getElementById("recipe-list");
  const addRecipeForm = document.getElementById("add-recipe-form");

  // Fetch and display recipes
  async function fetchRecipes() {
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
  }

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

    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecipe)
    });

    fetchRecipes(); // Refresh the list
    addRecipeForm.reset(); // Clear the form
  });

  fetchRecipes(); // Initial load
});
