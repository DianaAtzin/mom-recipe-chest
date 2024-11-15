// Sample data for initial display
let recipes = [
    {
      recipeID: 1,
      name: "Tacos al Pastor",
      category: "Main Course",
      description: "A traditional Mexican dish with marinated pork.",
      ingredients: ["Pork", "Pineapple", "Onions", "Cilantro"],
      instructions: "Marinate pork, grill, and serve with tortillas."
    },
    {
      recipeID: 2,
      name: "Instant Pot Creamy Fiesta Chicken",
      category: "Main Course",
      description: "A creamy, flavorful chicken dish perfect for an easy dinner.",
      ingredients: ["Boneless chicken breasts", "Ranch dressing mix", "Chicken broth", "Corn", "Black beans", "Diced tomatoes with green chiles", "Cream cheese", "Cilantro"],
      instructions: "Add ingredients to Instant Pot, cook, and serve."
    }
  ];
  
  // Function to display recipes in the UI
  function displayRecipes(filteredRecipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = ''; // Clear current recipes
  
    if (filteredRecipes.length === 0) {
      recipeList.innerHTML = '<p>No recipes found.</p>';
      return;
    }
  
    filteredRecipes.forEach(recipe => {
      const recipeDiv = document.createElement('div');
      recipeDiv.classList.add('p-4', 'border', 'border-gray-300', 'rounded', 'mb-4', 'bg-white');
      recipeDiv.innerHTML = `
        <h3 class="text-lg font-semibold">${recipe.name}</h3>
        <p><strong>Category:</strong> ${recipe.category}</p>
        <p><strong>Description:</strong> ${recipe.description}</p>
        <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
      `;
      recipeList.appendChild(recipeDiv);
    });
  }
  
  // Function to search recipes by name, category, or ingredient
  function searchRecipes() {
    const query = document.getElementById('search-recipes').value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
      return (
        recipe.name.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
      );
    });
    displayRecipes(filteredRecipes);
  }
  
  // Event listener for the "Search" button
  document.querySelector('.bg-blue-500').addEventListener('click', searchRecipes);
  
  // Event listener for the "All" button to reset search
  document.querySelector('.bg-gray-300').addEventListener('click', () => {
    document.getElementById('search-recipes').value = ''; // Clear the search input
    displayRecipes(recipes); // Display all recipes
  });
  
  // Optionally, add an event listener for real-time search as the user types
  document.getElementById('search-recipes').addEventListener('input', searchRecipes);
  
  // Function to handle form submission for adding a new recipe
  document.getElementById('add-recipe-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    // Get form values
    const name = document.getElementById('recipe-name').value;
    const description = document.getElementById('recipe-description').value;
    const ingredients = document.getElementById('recipe-ingredients').value.split(',').map(ing => ing.trim());
    const instructions = document.getElementById('recipe-instructions').value;
    const category = document.getElementById('recipe-category').value;
  
    // Create a new recipe object
    const newRecipe = {
      recipeID: recipes.length + 1,
      name: name,
      category: category,
      description: description,
      ingredients: ingredients,
      instructions: instructions
    };
  
    // Add the new recipe to the array
    recipes.push(newRecipe);
  
    // Display the updated list of recipes
    displayRecipes(recipes);
  
    // Clear the form fields
    e.target.reset();
  });
  
  // Initial display of all recipes when the page loads
  displayRecipes(recipes);
  