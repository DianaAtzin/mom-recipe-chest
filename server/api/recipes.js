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
        { ingredientName: "Cilantro", quantity: "1/4 cup" }
      ],
      instructions: "Marinate pork in the special sauce, grill, and serve with tortillas.",
      category: "Main Course"
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
        { ingredientName: "Chopped cilantro", quantity: "2 tablespoons, optional for garnish" }
      ],
      instructions: `1. Add chicken breasts to the Instant Pot and sprinkle with the ranch dressing mix.
      2. Pour the chicken broth over the chicken.
      3. Add the corn, black beans, and diced tomatoes with green chiles on top.
      4. Close the lid and set the valve to sealing. Select manual or pressure cook and set the timer for 15 minutes.
      5. When the timer beeps, do a quick release.
      6. Remove the lid and add the cream cheese. Stir until melted and creamy.
      7. Serve over rice or in tortillas, garnished with cilantro if desired.`,
      category: "Main Course"
    }
  ];
  
  // Exporting the data model
  module.exports = {
    recipes
  };
  