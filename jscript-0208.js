const searchBtn = $("#")
const clearIngredientsBtn = $("#")
const addIngredientBtn = $("#")
const ingredientList = $("#")

// Adding on click listeners to buttons

// Search button listener
$(searchBtn).on("click", function(){
	preventDefault()
	apiSearch()
})

// Clear all checked ingredients button
$(clearIngredientsBtn).on("click",function(){
	preventDefault()
	clearCheckedIngredients()
})

// Add ingredient button
$(addIngredientBtn).on("click", function(){
	e.preventDefault()
})

// Adding Functions

// Clears all checked ingredients
function clearCheckedIngredients(){

}

// Appends a text input and adds a new ingredient from that search
function addNewIngredient(){

}