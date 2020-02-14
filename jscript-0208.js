const searchBtn = $("#")
const clearIngredientsBtn = $("#clear-ingredients-button")
const addIngredientBtn = $("#add-ingredient")
const ingredientList = $("#ingredient-list")
const newIngredientInput = document.querySelector("#new-ingredient-input")
const searchBar = $("#search-bar")
var activeUserIngredientArray = []


var ingredientTextInput = $("#ingredient-text-input")
var submitNewIngredientBtn = $("#submit-new-button")
// Adding on click listeners to buttons

// Search button listener

// $(searchBtn).on("click", function(){
// 	preventDefault()
// 	apiSearch()
// })
addNewIngredient()

// Search bar enter function
$(searchBar).keydown(function (event) {
	if (event.which === 13) {
		event.preventDefault()
		apiSearch()
	}
})

// Add ingredient text bar
$(ingredientTextInput).keydown(function (event) {
	if (event.which === 13) {
		event.preventDefault()
		storeNewIngredient()
		appendNewIngredient()
	}
})

// Clear all checked ingredients button
$(clearIngredientsBtn).on("click", function () {
	clearCheckedIngredients()
})

// Add ingredient button
$(addIngredientBtn).on("click", function (e) {
	e.preventDefault()
	addNewIngredient()
})

// Add button to submit a new ingredient
$(submitNewIngredientBtn).on("click", function (e) {
	e.preventDefault()
	storeNewIngredient()
	appendNewIngredient()
})

// Adding Functions

// Clears all checked ingredients
function clearCheckedIngredients() {
	for (var i = activeUserIngredientArray.length - 1; i >= 0; i--) {
		var itemChecked = document.getElementById("check-" + i)
		if (itemChecked.checked === true) {
			activeUserIngredientArray.splice(i, 1)
		}
	}
	appendNewIngredient()
}

// Appends a text input and adds a new ingredient from that search
function addNewIngredient() {
	$(ingredientTextInput).empty()

	$(ingredientTextInput).toggle()

	$(submitNewIngredientBtn).toggle()
}

// Append the items in the activeUserIngredientArray
function appendNewIngredient() {
	ingredientList.empty()
	for (i = 0; i < activeUserIngredientArray.length; i++) {

		var li = $("<li>")

		var checkbox = $("<input>")
			.attr("type", "checkbox")
			.attr("id", "check-" + i)
			.attr("class", "checkboxes")
			.val(activeUserIngredientArray[i])

		var label = $("<label>")
			.attr("for", "check-" + i)
			.text(activeUserIngredientArray[i])

		li.appendTo(ingredientList)
		$(checkbox).appendTo(li)
		$(label).appendTo(li)

	}
}

// Store new ingredients to the activeUserIngredientArray
function storeNewIngredient() {

	activeUserIngredientArray.push(ingredientTextInput.val())
}
const searchBarInput = $(`#search-bar-input`)
const searchBarDiv = $(`#search-bar-div`)
const searchForm = $(`#search-form`)
var searchPara, topMeals, userRatingScore, sampleIngredient, mealURL, mealImg;
var recipeArray = [];
// var recipestoPull = 20

searchForm.submit(function (e) {
	searchPara = searchBarInput[0].value 	// places value of search bar input into variable, on submit (enter)
	runRecipeAjax()
	e.preventDefault()

})

function runRecipeAjax() {

	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://tasty.p.rapidapi.com/recipes/list?&q=" + searchPara + "&from=0&sizes=20",
		"method": "GET",
		"headers": {
			"x-rapidapi-host": "tasty.p.rapidapi.com",
			"x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
		}
	}

	$.ajax(settings).then(function (response) {
		console.log(`======= AJAX response (received) START =======`, response)

		recipeArray = []		// clearing the array

		// loop through array of responses and grab what you need (put in obj)
		for (j = 0; j < response.results.length; j++) {
			var newObj = {};
			var ingredientResponse

			newObj.name = response.results[j].name						// name of recipe
			newObj.video_url = response.results[j].video_url
			newObj.thumbnail_url = response.results[j].thumbnail_url
			newObj.sections = {}
			newObj.sections.ingredientsArray = []			// making a clear array to house ingredients looped later
			newObj.instructions = []
			
			if (response.results[j].instructions !== undefined) {
				for (k = 0; k < response.results[j].instructions.length; k++) {
					newObj.instructions.push(response.results[j].instructions[k].display_text)
				}
			}
			if (response.results[j].sections !== undefined) {
				newObj.userRating = response.results[j].user_ratings.score				// not sure why this needs to be in this if statement ¯\_(ツ)_/¯
				for(t=0;t<response.results[j].sections.length;t++) {
					newObj.sections.name = response.results[j].sections[t].components.name
					ingredientResponse = response.results[j].sections[t].components
				}
				for (var i = 0; i < ingredientResponse.length; i++) {
					// some indices in the "ingredients" response array are "n/a", this just ignores them for pushing
					if (ingredientResponse[i].raw_text !== 'n/a') {
						newObj.sections.ingredientsArray.push(ingredientResponse[i].raw_text)
					}
				}

				recipeArray.push(newObj)			// push whole new obj into the recipe array, but only if it has simple "sections" recipe
			} 
			console.log(`Ingredients for response #`,j,`:`, ingredientResponse)
			// loop through each ingredients and push to array for easy access 
		}

		showResults()

		console.log(`The recipe array is:`, recipeArray, `======= AJAX response END =======`)
	});
}
function showResults() {
	if (recipeArray.length === 0){
		alert(`No recipes found`)
	}
	$(`#recipe-list`).empty()
	var ul = $(`<ul id="recipe-list">`)
	var linktoRecipe = $(`<a>`).attr(`href`,`https://www.google.com`).text(`Click here for full recipe`)
	var itemsToShow = 5			// amount of meals to show, to choose from
	if (recipeArray.length < 5) {
		itemsToShow = recipeArray.length
	} 

	for (i = 0; i < itemsToShow; i++) {
		var result = $(`<div>`).attr(`class`, `recipe-list-items`).attr(`id`, `list-item` + i)
		
		result.append($(`<img>`).attr(`src`, recipeArray[i].thumbnail_url).attr(`style`, `width: 6em`))
		result.append($(`<span>`).attr(`id`, `recipe-` + i).attr(`class`, `recipe-names`).text(recipeArray[i].name))
		ul.append(result)
		var ingredientsUL = $(`<ul class="ingredients-list" style="display:none;">`)

		// this is only appending to the last listed recipe item, why so?
		result.prepend(linktoRecipe)
		
		for (x = 0; x < recipeArray[i].sections.ingredientsArray.length; x++) {
			$(`<li class="truncate">`).text(recipeArray[i].sections.ingredientsArray[x]).appendTo(ingredientsUL)
		}
		result.append(ingredientsUL.append($(`<button class="recipe-ingredients-button">`).attr(`type`, `button`).attr(`id`,``).text(`add ingredients to my list`)))
	}

	searchBarDiv.append(ul)
	$(`.recipe-names`).on(`click`, function (e) {
		var el = e.target
		var content = el.nextElementSibling;

		if (content.style.display === "block") {
			content.style.display = "none";
		} else {
			content.style.display = "block";
		}
		
	})
}
function buildRecipeDiv() {
	// need to add button at bottom >> for "adding all ingredients" to "user Active List"

}


// $.ajax(settings).then(function (response) {
// 	console.log(response);
// });
