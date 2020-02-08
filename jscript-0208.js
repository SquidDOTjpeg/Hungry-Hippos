const searchBtn = $("#")
const clearIngredientsBtn = $("#")
const addIngredientBtn = $("#add-ingredient")
const ingredientList = $("#ingredient-list")
const newIngredientInput = document.querySelector("#new-ingredient-input")

var ingredientTextInput = $("<input>").attr("type", "text")
var submitNewIngredientBtn = $("<button>").text("Add New Ingredient")
// Adding on click listeners to buttons

// Search button listener

// $(searchBtn).on("click", function(){
// 	preventDefault()
// 	apiSearch()
// })

// Clear all checked ingredients button
$(clearIngredientsBtn).on("click",function(){
	preventDefault()
	clearCheckedIngredients()
})

// Add ingredient button
$(addIngredientBtn).on("click", function(e){
	e.preventDefault()
	addNewIngredient()
})

// Add button to submit a new ingredient
$(submitNewIngredientBtn).on("click", function(){
	appendNewIngredient()
	storeNewIngredient()
})

// On submit of a form
// $("#target-form").submit(function(e){
// 	console.log("g")
// })

// Adding Functions

// Clears all checked ingredients
function clearCheckedIngredients(){
	
}

// Appends a text input and adds a new ingredient from that search
function addNewIngredient(){
	$(newIngredientInput).empty()

	$(ingredientTextInput).appendTo(newIngredientInput)

	$(submitNewIngredientBtn).appendTo(newIngredientInput)
}


function appendNewIngredient(){
	var ingredient = $("<li>").text(ingredientTextInput.val())

	$(ingredient).appendTo(ingredientList)
}

function storeNewIngredient(){
	var ingredient = ingredientTextInput.val()

	console.log(ingredient)
}