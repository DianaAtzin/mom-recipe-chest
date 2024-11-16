const express = require('express');
const app = express();
const PORT = 3000;

// Middleware for parsing request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'client' directory
app.use(express.static('public'));

// Initial data for recipes
let recipes = [
    {
        recipeID: 1,
        name: "Tacos al Pastor",
        description: "A traditional Mexican dish with marinated pork.",
        ingredients: [
            { ingredientName: "Pork", quantity: "500g" },
            { ingredientName: "Pineapple", quantity: "100g" },
            { ingredientName: "Onions", quantity: "1 whole" },
            { ingredientName: "Cilantro", quantity: "1/4 cup" },
        ],
        instructions: "Marinate pork in the special sauce, grill, and serve with tortillas.",
        category: "Main Course",
    },
    {
        recipeID: 2,
        name: "Instant Pot Creamy Fiesta Chicken",
        description: "A creamy, flavorful chicken dish perfect for an easy dinner.",
        ingredients: [
            { ingredientName: "Boneless chicken breasts", quantity: "2 pounds" },
            { ingredientName: "Ranch dressing mix", quantity: "1 packet" },
            { ingredientName: "Chicken broth", quantity: "1 cup" },
            { ingredientName: "Corn", quantity: "1 cup, frozen or canned" },
            { ingredientName: "Black beans", quantity: "1 can, drained and rinsed" },
            { ingredientName: "Diced tomatoes with green chiles", quantity: "1 can (10 oz)" },
            { ingredientName: "Cream cheese", quantity: "8 oz, cubed" },
            { ingredientName: "Chopped cilantro", quantity: "2 tablespoons, optional for garnish" },
        ],
        instructions: "Cook chicken in the Instant Pot and mix with ingredients.",
        category: "Main Course",
    },
];

// Initial data for inventory
let ingredientInventory = [
    { ingredientName: "Pork", quantity: "11 pounds" },
    { ingredientName: "Pineapple", quantity: "2 pounds" },
    { ingredientName: "Onions", quantity: "10 whole" },
    { ingredientName: "Cilantro", quantity: "2 cups" },
    { ingredientName: "Boneless chicken breasts", quantity: "10 pounds" },
    { ingredientName: "Ranch dressing mix", quantity: "10 packets" },
    { ingredientName: "Chicken broth", quantity: "15 cups" },
    { ingredientName: "Corn", quantity: "10 cups" },
    { ingredientName: "Black beans", quantity: "15 cans" },
    { ingredientName: "Diced tomatoes with green chiles", quantity: "15 cans (10 oz each)" },
    { ingredientName: "Cream cheese", quantity: "40 oz" },
    { ingredientName: "Chopped cilantro", quantity: "1 cup" },
];

// Root route
// Serves as a welcome route for the app
app.get('/', (req, res) => {
    res.send('Welcome to Diana\'s Recipe Chest App testing end points');
});

// ----- Recipes Routes ----- //

// GET all recipes
// Fetches the list of all recipes
app.get('/api/recipes', (req, res) => {
    res.json(recipes);
});

// POST a new recipe
// Adds a new recipe to the recipes list
app.post('/api/recipes', (req, res) => {
    const newRecipe = {
        recipeID: recipes.length + 1,
        name: req.body.name,
        description: req.body.description,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        category: req.body.category,
    };
    recipes.push(newRecipe);
    res.status(201).json(newRecipe);
});

// PUT (update) an existing recipe
// Updates a recipe by its ID
app.put('/api/recipes/:id', (req, res) => {
    const recipeID = parseInt(req.params.id);
    const recipe = recipes.find((r) => r.recipeID === recipeID);

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    recipe.name = req.body.name || recipe.name;
    recipe.description = req.body.description || recipe.description;
    recipe.ingredients = req.body.ingredients || recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    recipe.category = req.body.category || recipe.category;

    res.json(recipe);
});

// DELETE a recipe
// Removes a recipe from the recipes list by its ID
app.delete('/api/recipes/:id', (req, res) => {
    const recipeID = parseInt(req.params.id);
    const recipeIndex = recipes.findIndex((r) => r.recipeID === recipeID);

    if (recipeIndex === -1) return res.status(404).json({ error: 'Recipe not found' });

    recipes.splice(recipeIndex, 1);
    res.status(204).send();
});

// ----- Inventory Routes ----- //

// GET all inventory items
// Fetches the list of all ingredients in the inventory
app.get('/api/inventory', (req, res) => {
    res.json(ingredientInventory);
});

// POST a new inventory item
// Adds a new ingredient to the inventory
app.post('/api/inventory', (req, res) => {
    const newItem = {
        ingredientName: req.body.ingredientName,
        quantity: req.body.quantity,
    };
    ingredientInventory.push(newItem);
    res.status(201).json(newItem);
});

// PUT (update) an inventory item
// Updates an ingredient in the inventory by its name
app.put('/api/inventory/:name', (req, res) => {
    const item = ingredientInventory.find((i) => i.ingredientName === req.params.name);

    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    item.quantity = req.body.quantity || item.quantity;

    res.json(item);
});

// DELETE an inventory item
// Removes an ingredient from the inventory by its name
app.delete('/api/inventory/:name', (req, res) => {
    const itemIndex = ingredientInventory.findIndex((i) => i.ingredientName === req.params.name);

    if (itemIndex === -1) return res.status(404).json({ error: 'Inventory item not found' });

    ingredientInventory.splice(itemIndex, 1);
    res.status(204).send();
});

// Start the server
// Listens for incoming requests on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
