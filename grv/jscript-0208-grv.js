// $(window).on("load", function () {
// waits for window to load before running rest of js ^
const searchInput = $(`#findlocate`)
const resultsDiv = $(`#results-div`)
const formSearch = $(`#search-form`)
const searchAnimationDiv = $(`<div class="search-animation-div">`)
const ulRecipeList = $(`<ul id="recipe-list" class="recipe-list">`)
const feelingLuckySpan = $(`#feeling-lucky`)
const feelingLuckyCog = $(`#feeling-lucky-cog`)
var searchingTimer, itemsToShow;
var searchPara, topMeals, userRatingScore, sampleIngredient, mealURL, mealImg;
var recipeArray = [];			// array to hold each recipe obj
// console.log(localStorage.getItem(JSON.parse(`hh-recipeArray`)))

var feelingLuckyArray = [`Pizza`, `Burger`, `Mexican`, `Chinese`, `Beef`, `Chicken`, `Pork`, `Tacos`, `Kale`, `Thai`, `Vietnamese`, `American`, `Orange Chicken`, `Orange Juice`, `Coconut`, `Acai`, `Corn`, `Hot Dog`]
var yuckyArray = [`Pancake`];

feelingLuckyCog.on(`click`, function (e) {
	callSettingsModal()

	// alert(`Select which options to include in Hot recipes:\n\n` + feelingLuckyArray.join(`\n`))
})

feelingLuckySpan.on(`click`, function (e) {
	resultsDiv.empty()
	ulRecipeList.empty()
	var rnum = Math.floor(Math.random() * feelingLuckyArray.length)
	searchPara = feelingLuckyArray[rnum]
	runRecipeAjax()
})

formSearch.submit(function (e) {
	resultsDiv.empty()
	ulRecipeList.empty()
	searchPara = searchInput[0].value 	// places value of search bar input into variable, on submit (enter)
	runRecipeAjax()
	// searchInput[0].value = ``
})

function callSettingsModal() {
	var chk = `chk`
	var unchk = `unchk`
	var modalContent = $(`#settings-modal-content`)
	var modal = $(`#templateModal`)
	var saveBtn = $(`<button id="flucky-save-button" class="modal-save-button">`).text(`Save`)
	// var combined = feelingLuckyArray.concat(yuckyArray)
	var settingsList = $(`<ol>`)
	var title = $(`<h5>`).text(`Please select your options:`)

	function createSettingsList(term, c) {
		var foodterm = term
		var span = $(`<span class="settings-list-item">`)
		var checkbox;

		if (c === `chk`) {
			checkbox = $(`<input type="checkbox" checked>`)

		} else {
			checkbox = $(`<input type="checkbox">`)
		}

		var label = $(`<label>`).attr(`for`, foodterm).attr(`id`, foodterm).text(foodterm)

		settingsList.append(span.append(checkbox, label))
	}

	modalContent.empty()
	modal.attr(`style`, `display:block;`)					// immediately displaying the modal when called

	for (l = 0; l < feelingLuckyArray.length; l++) {
		createSettingsList(feelingLuckyArray[l], chk)
	}

	for (y = 0; y < yuckyArray.length; y++) {
		createSettingsList(yuckyArray[y], unchk)
	}


	var labelforUserItemsToShowInput = $(`<label>`).attr(`for`, `userItemsToShowInput`).text(`Enter the max number of recipes you want displayed: `)
	var userItemsToShowInput = $(`<input type="text" id="userItemsToShowInput">`)

	modalContent.append(title, settingsList, labelforUserItemsToShowInput, userItemsToShowInput, saveBtn)

	// LISTENERS

	// make listener for checked change & move (push/splice) to yuckyArray

	saveBtn.on(`click`, function () {
		modal.attr(`style`, `display:none;`)			// fake save button if settings can be saved when checked/unchecked
		if(isNaN($(`#userItemsToShowInput`).val())){

		} else {
			localStorage.setItem(`hh-itemsToShow`,JSON.stringify($(`#userItemsToShowInput`).val()))
		}
	})

	// When the user clicks anywhere outside of the modal, it does not close it
	$(window).on(`click`, function (event) {
		if (event.target == modal[0]) {
			modal.attr(`style`, `display:none;`)
		}
	})
}


function runSearchAnimation() {
	searchInput.attr(`placeholder`, ``)
	searchAnimationDiv.empty()
	var searchAnimationText = ($(`<p style="font-size: 24px">`).text(`Searching for "` + searchPara + `".`))
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
		"url": "https://tasty.p.rapidapi.com/recipes/list?&q=" + searchPara + "&from=0&sizes=50",
		"method": "GET",
		"error": recipeAjaxError,
		"headers": {
			"x-rapidapi-host": "tasty.p.rapidapi.com",
			"x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
		}
	}

	$.ajax(settings).then(function (response) {
		console.log(`======= AJAX response (received) START =======`, response)
		resultsDiv.append($(`<div>`)
			.attr(`style`, `padding-top: .42em; text-align: center;`)
			.html(`Search results for: <h4 style="font-weight: 800;">` + searchPara + `</h6>`))
		searchPara = ``
		clearInterval(searchingTimer)			// clearing the "searching animation" timer soon as a response is received
		recipeArray = []						// clearing the array

		// loop through array of responses and grab what you need (put in obj)
		for (j = 0; j < response.results.length; j++) {
			var newObj = {};			// creating a blank new obj called, well, newObj.

			newObj.name = response.results[j].name						// name of recipe
			newObj.video_url = response.results[j].original_video_url
			newObj.thumbnail_url = response.results[j].thumbnail_url
			newObj.sections = []
			newObj.instructions = []

			// saving any instructions from response into our newObj
			if (response.results[j].instructions !== undefined) {
				for (k = 0; k < response.results[j].instructions.length; k++) {
					newObj.instructions.push(response.results[j].instructions[k].display_text)
				}
			}
			if (response.results[j].sections !== undefined) {
				newObj.userRating = response.results[j].user_ratings.score				// not sure why this needs to be in this if statement ¯\_(ツ)_/¯

				// this makes new obj with a name and an array of ingredients for each "component/section", if multiple found (ex. cake, icing, ganche)
				for (t = 0; t < response.results[j].sections.length; t++) {
					newObj.sections[t] = {}				// create new obj inside the sections array at t index, 
					newObj.sections[t].ingredientsArray = []
					newObj.sections[t].name = response.results[j].sections[t].name
					newObj.sections[t].ingredientsArray.push(response.results[j].sections[t].components)
				}

				recipeArray.push(newObj)			// push whole new obj into the recipe array holding all our recipe objs
			}
		}
		localStorage.setItem(`hh-recipeArray`, JSON.stringify(recipeArray))
		showResults()			// run showResults to display all gathered data from our recipeArray

		console.log(`The recipe array is:`, recipeArray, `======= AJAX response END =======`)
	});
}
function showResults() {
	searchAnimationDiv.remove()							// remove div holding search animation, prepping for adding recipes
	searchInput.attr(`placeholder`, `Search for...`)	// bring back the "search for..." placeholder.

	// checking to see if the search even grabbed anything to display (no internet, the word is mispelled, or it's simply not in the recipe api)
	if (recipeArray.length === 0) {
		alert(`No recipes found`)
	}

	$(`#recipe-list`).empty()			// emptying our handy recipe-list div for clean slate

	buildRecipeContainer()				// run buildRecipeContainer for dynamic html rendering

	resultsDiv.append(ulRecipeList)

	// on click listener, for displaying or hidding the ul list rendered underneath each "recipe name and image"
	// would like this to recognize any other "open" ul lists and close them before opening new one
	$(`.recipe-names`).on(`click`, function (e) {
		e.stopPropagation()
		var el = e.target
		var content = el.nextElementSibling;

		if (content.style.display === "block") {
			content.style.display = "none";
		} else {
			content.style.display = "block";
		}

	})

	$(`.full-recipe-links`).on(`click`, function (e) {
		var el = e.target
		var p = el.parentElement.id

		renderRecipeInstructions(p)
	})

	$(`.addAll`).on(`click`, function (e) {
		e.stopPropagation()
		var el = e.target
		console.log(el)
		$(el).attr(`class`, `recipe-ingredients-button addAll disable-click`).text(`Added all to list`)
		var ingSections = recipeArray[el.parentElement.id].sections

		for (s = 0; s < ingSections.length; s++) {
			var ingArray = recipeArray[el.parentElement.id].sections[s].ingredientsArray
			for (r = 0; r < ingArray.length; r++) {
				for (q = 0; q < ingArray[r].length; q++) {
					activeUserIngredientArray.push(ingArray[r][q].raw_text)
					// console.log()
				}
			}
		}

		console.log(activeUserIngredientArray)

	})

	// $(`.addSelected`).on(`click`, function (e) {
	// 	// e.stopPropagation()
	// 	var el = e.target
	// 	$(el).attr(`class`,`recipe-ingredients-button addSelected disable-click`).text(`Added selected to list`)
	// 	var ingSections = recipeArray[el.parentElement.id].sections
	// 	console.log(`addSelected element:`,el)
	// 	for(s=0;s<ingSections.length;s++){
	// 		var ingArray = recipeArray[el.parentElement.id].sections[s].ingredientsArray

	// 		for(r=0;r<ingArray.length;r++){
	// 			for(q=0;q<ingArray[r].length;q++){
	// 				if(el === checked){
	// 					console.log(`first try bitch`)
	// 				}
	// 				activeUserIngredientArray.push(ingArray[r][q].raw_text)
	// 				// console.log()
	// 			}
	// 		}
	// 	}

	// })
}
function buildRecipeContainer() {
	var getToShow = JSON.parse(localStorage.getItem(`hh-itemsToShow`))
	if (getToShow === null) {
		itemsToShow = 15			// amount of meals to show, to choose from

	} else {
		itemsToShow = getToShow
	}


	if (recipeArray.length < itemsToShow) {
		itemsToShow = recipeArray.length
	}

	for (i = 0; i < itemsToShow; i++) {
		var linktoRecipe = $(`<p class="full-recipe-links">`).attr(`id`, `recipe-video-` + i).text(`Click here for full recipe`)
		var result = $(`<div>`).attr(`class`, `recipe-list-items`).attr(`id`, `list-item` + i)
		var ulIngredientsList = $(`<ul class="recipe-ing-list" style="display:none;">`).attr(`id`, i).empty()

		result.append($(`<img class="recipe-images">`).attr(`src`, recipeArray[i].thumbnail_url))
		result.append($(`<span>`).attr(`id`, `recipe-` + i).attr(`class`, `recipe-names`).text(recipeArray[i].name))
		ulRecipeList.append(result)

		for (w = 0; w < recipeArray[i].sections.length; w++) {
			// append the name of the "component" and then in the loop its respective ingredients
			$(`<p class="component-header">`)
				.text(recipeArray[i].sections[w].name)				// name
				.appendTo(ulIngredientsList)						// append to the declared ul outside loop

			for (x = 0; x < recipeArray[i].sections[w].ingredientsArray[0].length; x++) {
				var li = $(`<li>`)
				// make a checkbox for each ingredient
				var chkbox = $(`<input>`).attr(`type`, `checkbox`).attr(`id`, `section-` + w + `-ingredient-` + x)
				var label = $(`<label class="truncate">`).attr(`for`, `section-` + w + `-ingredient-` + x).text(recipeArray[i].sections[w].ingredientsArray[0][x].raw_text)

				ulIngredientsList.append(li.append(chkbox, label))
			}
		}
		ulIngredientsList.prepend(linktoRecipe) 			// prepending the link to top

		// making a add-all and add-selected (to grocery list) buttons
		var allButton = $(`<button class="recipe-ingredients-button addAll">`).attr(`type`, `button`).attr(`id`, ``).text(`Add all`)
		var selectedButton = $(`<button class="recipe-ingredients-button addSelected">`).attr(`type`, `button`).attr(`id`, ``).text(`Add selected to My Grocery List`)
		result.append(ulIngredientsList.append(selectedButton, allButton))				// appending aforementioned buttons to ul which is itself appended to the "result" recipe
	}

}


function renderRecipeInstructions(id) {
	callRecipeModal(id)
}
function callRecipeModal(id) {
	var modalContent = $(`#recipe-modal-content`)
	var modal = $(`#recipe-modal`)
	var closeBtn = $(`<button id="recipe-close-button" class="recipe-close-button">`).text(`Close`)
	var instructionsList = $(`<ol>`)
	var title = $(`<h5>`).text(recipeArray[id].name + `:`)
	var video = $(`<video width="320" height="240" controls>`)
	var vidSrc = $(`<source>`).attr(`src`,recipeArray[id].video_url).attr(`type`,`video/mp4`)

	modalContent.empty()

	modal.attr(`style`, `display:block;`)					// immediately displaying the modal when called

	for (l = 0; l < recipeArray[id].instructions.length; l++) {
		var li = $(`<li class="instructions-list-item">`)
		li.text(recipeArray[id].instructions[l])
		instructionsList.append(li)
		// console.log(recipeArray[id].instructions)
	}

	modalContent.append(title, video.append(vidSrc), instructionsList, closeBtn)

	closeBtn.on(`click`, function () {
		modal.attr(`style`, `display:none;`)			// fake save button if settings can be saved when checked/unchecked

	})

	// When the user clicks anywhere outside of the modal, it closes it
	$(window).on(`click`, function (event) {

		if (event.target === modal[0]) {
			modal.attr(`style`, `display:none;`)
		}
	})
}

// })	// end of "on load" 	
