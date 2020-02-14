const searchBarInput = $(`#findlocate`)
const resultsDiv = $(`#results-div`)
const searchForm = $(`#search-form`)
const searchBarLabel = $(`#search-bar-label`)
const searchAnimationDiv = $(`<div>`)
const ulRecipeList = $(`<ul id="recipe-list" class="recipe-list">`)
var searchingTimer;
var searchPara, topMeals, userRatingScore, sampleIngredient, mealURL, mealImg;
var recipeArray = [];
// var recipestoPull = 20

searchForm.submit(function (e) {
	ulRecipeList.empty()
	searchPara = searchBarInput[0].value 	// places value of search bar input into variable, on submit (enter)
	runRecipeAjax()
	e.preventDefault()
	searchBarInput[0].value = ``
})
function runSearchAnimation() {
	searchBarInput.attr(`placeholder`, ``)
	searchAnimationDiv.empty()
	var searchAnimationText = ($(`<h4>`).text(`Searching for "` + searchPara + `".`))
	resultsDiv.append(searchAnimationDiv.append(searchAnimationText))
	searchingTimer = setInterval(function () {
		searchAnimationText.text(`Searching for "` + searchPara + `"..`)
		setTimeout(function () {
			searchAnimationText.text(`Searching for "` + searchPara + `"...`)
		}, 500)

	}, 1000)
}
function recipeAjaxError() {
	alert(`No recipes found`)
	ulRecipeList.empty()
}
function runRecipeAjax() {

	runSearchAnimation()

	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://tasty.p.rapidapi.com/recipes/list?&q=" + searchPara + "&from=0&sizes=20",
		"method": "GET",
		// "error": recipeAjaxError,
		"headers": {
			"x-rapidapi-host": "tasty.p.rapidapi.com",
			"x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
		}
	}

	$.ajax(settings).then(function (response) {
		console.log(`======= AJAX response (received) START =======`, response)
		clearInterval(searchingTimer)

		recipeArray = []		// clearing the array

		// loop through array of responses and grab what you need (put in obj)
		for (j = 0; j < response.results.length; j++) {
			var newObj = {};
			var ingredientResponse = []

			newObj.name = response.results[j].name						// name of recipe
			newObj.video_url = response.results[j].video_url
			newObj.thumbnail_url = response.results[j].thumbnail_url
			newObj.sections = []
			// newObj.sections.recipes = {}

			newObj.instructions = []

			if (response.results[j].instructions !== undefined) {
				for (k = 0; k < response.results[j].instructions.length; k++) {
					newObj.instructions.push(response.results[j].instructions[k].display_text)
				}
			}
			if (response.results[j].sections !== undefined) {
				newObj.userRating = response.results[j].user_ratings.score				// not sure why this needs to be in this if statement ¯\_(ツ)_/¯

				// this makes new obj with a name and an array of ingredients for each "component/section", if multiple found
				for (t = 0; t < response.results[j].sections.length; t++) {
					newObj.sections[t] = {}
					newObj.sections[t].ingredientsArray = []
					newObj.sections[t].name = response.results[j].sections[t].name
					newObj.sections[t].ingredientsArray.push(response.results[j].sections[t].components)
				}

				// for (var i = 0; i < newObj.sections.length; i++) {
				// 	newObj.sections[t].name = response.results[j].sections[t].components.name
				// 	newObj.sections[i].ingredientsArray = []
				// 	// some indices in the "ingredients" response array are "n/a", this just ignores them for pushing
				// 	if (ingredientResponse[i].raw_text !== 'n/a') {
				// 		newObj.sections[i].ingredientsArray.push(ingredientResponse[i].raw_text)
				// 	}
				// }

				recipeArray.push(newObj)			// push whole new obj into the recipe array, but only if it has simple "sections" recipe
			}
			// loop through each ingredients and push to array for easy access 
		}

		showResults()

		console.log(`The recipe array is:`, recipeArray, `======= AJAX response END =======`)
	});
}
function showResults() {
	searchAnimationDiv.remove()
	searchBarInput.attr(`placeholder`, `Search for...`)
	if (recipeArray.length === 0) {
		alert(`No recipes found`)
	}
	$(`#recipe-list`).empty()

	var linktoRecipe = $(`<a>`).attr(`href`, `https://www.google.com`).text(`Click here for full recipe`)
	var itemsToShow = 5			// amount of meals to show, to choose from
	if (recipeArray.length < 5) {
		itemsToShow = recipeArray.length
	}

	for (i = 0; i < itemsToShow; i++) {
		var result = $(`<div>`).attr(`class`, `recipe-list-items`).attr(`id`, `list-item` + i)
		result.append($(`<img class="recipe-images">`).attr(`src`, recipeArray[i].thumbnail_url))
		result.append($(`<span>`).attr(`id`, `recipe-` + i).attr(`class`, `recipe-names`).text(recipeArray[i].name))
		ulRecipeList.append(result)
		var ulIngredientsList = $(`<ul class="ingredients-list" style="display:none;">`)
		// ulIngredientsList.prepend(linktoRecipe)

		for (w = 0; w < recipeArray[i].sections.length; w++) {
			// append the name of the "component" and then in the loop its respective ingredients
			$(`<p class="component-header">`).text(recipeArray[i].sections[w].name).appendTo(ulIngredientsList)

			for (x = 0; x < recipeArray[i].sections[w].ingredientsArray[0].length; x++) {
				console.log(`ingredients array: `, recipeArray[i].sections[w].ingredientsArray[0])
				$(`<li class="truncate">`).text(recipeArray[i].sections[w].ingredientsArray[0][x].raw_text).appendTo(ulIngredientsList)
			}
		}
		result.prepend(linktoRecipe)
		result.append(ulIngredientsList.append($(`<button class="recipe-ingredients-button">`).attr(`type`, `button`).attr(`id`, ``).text(`add ingredients to my list`)))
	}

	resultsDiv.append(ulRecipeList)
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


