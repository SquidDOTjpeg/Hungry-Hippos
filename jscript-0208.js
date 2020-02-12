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
		console.log(`======= AJAX response (received) START =======`)
		console.log(`main response obj: `)
		console.log(response);

		recipeArray = []		// clearing the array

		// loop through array of responses and grab what you need (put in obj)
		for (j = 0; j < response.results.length; j++) {
			var newObj = {};
			var ingredientResponse

			newObj.name = response.results[j].name						// name of recipe
			newObj.video_url = response.results[j].video_url
			newObj.thumbnail_url = response.results[j].thumbnail_url
			newObj.ingredientsArray = []								// making a clear array to house ingredients looped later
			newObj.instructions = []
			// var instructionsLen = response.results[j].instructions.length
			// console.log(instructionsLen)

			if (response.results[j].instructions !== undefined) {

				for (k = 0; k < response.results[j].instructions.length; k++) {
					newObj.instructions.push(response.results[j].instructions[k].display_text)
				}
			}

			if (response.results[j].sections !== undefined) {
				newObj.userRating = response.results[j].user_ratings.score
				ingredientResponse = response.results[j].sections[0].components
			}

			// loop through each ingredients and push to array for easy access 
			for (var i = 0; i < ingredientResponse.length; i++) {
				// some indices in the "ingredients" response array are "n/a", this just ignores them for pushing
				if (ingredientResponse[i].raw_text !== 'n/a') {
					newObj.ingredientsArray.push(ingredientResponse[i].raw_text)
				}
			}
			recipeArray.push(newObj)			// push whole new obj into the recipe array
		}

		showResults()

		console.log(`The recipe array is:`)
		console.log(recipeArray)

		console.log(`======= AJAX response END =======`)
	});
}
function showResults() {
	if (recipeArray.length === 0){
		alert(`No recipes found`)
	}
	$(`#recipe-list`).empty()
	var ul = $(`<ul id="recipe-list">`)
	var itemsToShow = 5			// amount of meals to show, to choose from
	if (recipeArray.length < 5) {
		itemsToShow = recipeArray.length
	} 
	for (i = 0; i < itemsToShow; i++) {
		var result = $(`<li>`).attr(`class`, `recipe-list-items`).attr(`id`, `list-item` + i)
		
		result.append($(`<img>`).attr(`src`, recipeArray[i].thumbnail_url).attr(`style`, `width: 6em`))
		result.append($(`<span>`).attr(`id`, `recipe-` + i).attr(`class`, `recipe-names`).text(recipeArray[i].name))
		ul.append(result)
		var instructionUL = $(`<ul class="instruction-list" style="display:none;">`)
		for (x = 0; x < recipeArray[i].ingredientsArray.length; x++) {
			$(`<li>`).text(recipeArray[i].ingredientsArray[x]).appendTo(instructionUL)
		}
		result.append(instructionUL)
	}
	searchBarDiv.append(ul)
	$(`.recipe-names`).on(`click`, function (e) {
		var el = e.target
		console.log(el.id)
		var content = el.nextElementSibling;
		console.log(content)
		if (content.style.display === "block") {
			content.style.display = "none";
		} else {
			content.style.display = "block";
		}
		// switch (el.id) {
		// 	case `recipe-0`:
		// 		dropdownRecipe(0)
		// 		break
		// 	case `recipe-1`:
		// 		dropdownRecipe(1)
		// 		break
		// 	case `recipe-2`:
		// 		dropdownRecipe(2)
		// 		break
		// 	case `recipe-3`:
		// 		dropdownRecipe(3)
		// 		break
		// 	case `recipe-4`:
		// 		dropdownRecipe(4)
		// 		break
		// }
	})



	// ul.append($(`<button>`).attr(`type`, `button`).attr(`id`,``).text(`Next 5`))

	// 	var coll = $(".collapsible")
	// for (i = 0; i < coll.length; i++) {
	//   coll[i].addEventListener("click", function() {
	//     this.classList.toggle("active");
	//     var content = this.nextElementSibling;
	//     if (content.style.display === "block") {
	//       content.style.display = "none";
	//     } else {
	//       content.style.display = "block";
	//     }
	//   });
	// }

}


function dropdownRecipe(arg) {
	var selectedItem = `#list-item` + arg
	// $(`.instruction-list`).remove()

	var ul = $(`<ul class="instruction-list">`)
	// console.log(recipeArray.instructions[arg])
	for (x = 0; x < recipeArray[arg].ingredientsArray.length; x++) {
		$(`<li>`).text(recipeArray[arg].ingredientsArray[x]).appendTo(ul)
	}

	$(selectedItem).append(ul)
	// el.classList.toggle("active")

	// searchBarDiv.append(`instructions for ` + recipeArray[arg].name + ` are: `)
	// console.log(`this is the recipe name: ` + recipeArray[arg].name)
}

function buildRecipeDiv() {
	// need to add button at bottom >> for "adding all ingredients" to "user Active List"

}


