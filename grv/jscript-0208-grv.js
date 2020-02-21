// $(window).on("load", function () {
// waits for window to load before running rest of js ^
const searchInput = $(`#findlocate`)
const resultsDiv = $(`#results-div`)
const formSearch = $(`#search-form`)
const searchAnimationDiv = $(`<div class="search-animation-div">`)
const ulRecipeList = $(`<ul id="recipe-list" class="recipe-list">`)
const feelingLuckySpan = $(`#feeling-lucky`)
const feelingLuckyCog = $(`#feeling-lucky-cog`)
// const mapButton = $(`<li>`).append($(`<button class="menu-buttons">`).text(`Local Grocery Store`)).appendTo($(`.hero-search-filter-menu`))
var searchingTimer, itemsToShow;
var searchTerm, topMeals, userRatingScore, sampleIngredient, mealURL, mealImg, storedRecipeInstructions;
var recipeArray = [];			// array to hold each recipe obj
var feelingLuckyArray = [`Pizza`, `Burger`, `Wine`, `Chinese`, `Beef`, `Chicken`, `Pork`, `Tacos`, `Kale`, `Thai`, `Vietnamese`, `American`, `Orange Chicken`, `Orange Juice`, `Coconut`, `Acai`, `Corn`, `Hot Dog`]
var yuckyArray = [`Pancake`];

init()

function init() {
	searchInput.attr(`placeholder`, `(search for a cuisine, a meal, or an ingredient)`)
	var storedRecipeArray = JSON.parse(localStorage.getItem(`hh-recipeArray`))
	if ((storedRecipeArray !== null) || (storedRecipeArray !== [])) {
		recipeArray = storedRecipeArray
		// displaySearchTerm(JSON.parse(localStorage.getItem(`hh-`)))
		// showResults()
	} else {
		recipeArray = []
		resultsDiv.html(`<h4 class="component-header">No stored history. Begin your search above</h4>`)
	}
}

feelingLuckyCog.on(`click`, function (e) {
	e.stopPropagation()
	callSettingsModal()
})

feelingLuckySpan.on(`click`, function (e) {
	resultsDiv.empty()
	ulRecipeList.empty()
	var rnum = Math.floor(Math.random() * feelingLuckyArray.length)
	searchTerm = feelingLuckyArray[rnum]
	localStorage.setItem(`hh-search-term-last`, searchTerm)
	runRecipeAjax()
})

formSearch.submit(function (e) {
	e.preventDefault()
	resultsDiv.empty()
	ulRecipeList.empty()
	searchTerm = searchInput[0].value 	// places value of search bar input into variable, on submit (enter)
	localStorage.setItem(`hh-search-term-last`, searchTerm)
	runRecipeAjax()

})
// mapButton.on(`click`,function(e){
// 	if($(`.mapbox-div`) !== undefined){
// 		$(`.mapbox-div`).remove()
// 	}
// 	var div = $(`<div class="mapbox-div">`).prependTo(resultsDiv)
// 	var iframe = $(`<iframe class="mapbox-iframe">`).attr(`src`,`./grv/store-locator/index.html`).appendTo(div)
// })

function callSettingsModal() {
	var chk = `chk`
	var unchk = `unchk`
	var modalContent = $(`#settings-modal-content`)
	var modal = $(`#templateModal`)
	var saveBtn = $(`<button id="flucky-save-button" class="modal-save-button">`).text(`Save`)
	var settingsList = $(`<ol class="feeling-lucky-list-options">`)
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
	var userItemsToShowInput = $(`<input type="number" min="1" max="20" value="15" placeholder="(1-20)" id="userItemsToShowInput">`)

	modalContent.append(title, settingsList, labelforUserItemsToShowInput, userItemsToShowInput, saveBtn)

	// LISTENERS
	saveBtn.on(`click`, function (e) {
		e.preventDefault()

		modal.attr(`style`, `display:none;`)			// fake save button if settings can be saved when checked/unchecked
		var user1 = $(`#userItemsToShowInput`).val()
		// console.log(settingsList[0].children)
		feelingLuckyArray = []
		yuckyArray = []

		for (var i = 0; i < settingsList[0].children.length; i++) {
			var optionsBox = settingsList[0].children[i].children[0]
			if (optionsBox.checked) {
				feelingLuckyArray.push(settingsList[0].children[i].children[1].innerText)
				// save this to localstorage
			} else {
				yuckyArray.push(settingsList[0].children[i].children[1].innerText)
				// save this to localstorage
			}
		}

		if ((user1 >= 1) && (user1 <= 20)) {
			localStorage.setItem(`hh-itemsToShow`, JSON.stringify(user1))
		} else {
			alert(`Please enter a valid number between 1 and 20`)
		}
	})

	// When the user clicks anywhere outside of the modal, it closes it
	$(window).on(`click`, function (event) {
		if (event.target == modal[0]) {
			modal.attr(`style`, `display:none;`)
		}
	})
}
function runSearchAnimation() {
	searchInput.attr(`placeholder`, ``)
	searchAnimationDiv.empty()

	var searchAnimationText = ($(`<p style="font-size: 24px">`).text(`Searching for "` + searchTerm + `".`))

	resultsDiv.append(searchAnimationDiv.append(searchAnimationText))
	searchingTimer = setInterval(function () {
		searchAnimationText.text(`Searching for "` + searchTerm + `"..`)
		setTimeout(function () {
			searchAnimationText.text(`Searching for "` + searchTerm + `"...`)
		}, 500)
	}, 1000)
}
function runRecipeAjax() {

	runSearchAnimation()

	// var ajaxError = function () {
	// 	alert(`No recipes found`)
	// 	ulRecipeList.empty()
	// }
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://tasty.p.rapidapi.com/recipes/list?&q=" + searchTerm + "&from=0&sizes=50",
		"method": "GET",
		// "error": ajaxError,
		"headers": {
			"x-rapidapi-host": "tasty.p.rapidapi.com",
			"x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
		}
	}

	$.ajax(settings).then(function (response) {
		// console.log(`======= AJAX response (received) START =======`, response)
		searchInput[0].value = ``

		displaySearchTerm(searchTerm)			// just a little reminder to the user of which term they searched
		searchTerm = ``							// clearing the search parameter to avoid any potentials conflicts as it's no longer needed
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
				newObj.userRating = {}
				newObj.userRating = response.results[j].user_ratings				// not sure why this needs to be in this if statement ¯\_(ツ)_/¯

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

		// checking to see if the search even grabbed anything to display (no internet, the word is mispelled, or it's simply not in the recipe api)
		if (recipeArray.length === 0) {
			alert(`No recipes found`)
		} else {
			localStorage.setItem(`hh-recipeArray`, JSON.stringify(recipeArray))				// save current pulled recipe array into local storage
			showResults()			// run showResults to display all gathered data from our recipeArray
		}

		// console.log(`The recipe array is:`, recipeArray, `======= AJAX response END =======`)
	});
}
function showResults() {
	searchAnimationDiv.remove()							// remove div holding search animation, prepping for adding recipes
	searchInput.attr(`placeholder`, `(search for a cuisine, a meal, or an ingredient)`)	// bring back the "search for..." placeholder.

	buildRecipeContainer()				// run buildRecipeContainer for dynamic html rendering

	// on click listener, for displaying or hiding the ul list rendered underneath each "recipe name and image"
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

	// on click listener for user-ratings
	// currently does nothing, eventually maybe it will let you upvote/downvote; but no, not ever really
	$(`.user-ratings`).on(`click`, function (e) {
		e.preventDefault()
		// var el = e.target
		alert(`You must sign in to vote.`)
	})

	// on click listener for recipe name
	// opens its respective ingredient list and video/instruction list
	$(`.full-recipe-links`).on(`click`, function (e) {
		// e.stopPropagation()
		var el = e.target
		var p = el.parentElement.id

		callRecipeModal(p)
	})

	// on click listener for the addAll buttons to add all the respective ingredients to the activeUserIngredientArray
	// marks all ingredients as checked
	$(`.addAll`).on(`click`, function (e) {

		// e.stopPropagation()
		var el = e.target
		$(el).attr(`class`, `recipe-ingredients-button addAll disable-click`).text(`All selected`)

		var elementsinUlParent = el.parentElement.children			// all children of parent where button is in, including list items in variable

		// looping through the children
		for (var i = 0; i < elementsinUlParent.length; i++) {
			var item = elementsinUlParent[i]			// storing every element in item variable

			// checking to see if the child is an LI element
			if (item.tagName === `LI`) {
				item.children[0].checked = true
			}
		}


	})

	// on click listener for the addSelected buttons to add all the respective ingredients to the activeUserIngredientArray
	$(`.addSelected`).on(`click`, function (e) {
		e.stopPropagation()
		var el = e.target
		var found = false
		var elementsinUlParent = el.parentElement.children			// all children of parent where button is in, including list items in variable

		// looping through the children
		for (var i = 0; i < elementsinUlParent.length; i++) {
			var item = elementsinUlParent[i]			// storing every element in item variable

			// checking to see if the child is an LI element
			if (item.tagName === `LI`) {
				// checking to see if the input checkbox is checked (LI element's 1st child)
				if (item.children[0].checked) {
					found = true
					// if yes, push the text of its label (LI element's 2nd child) into the activeUserIngredientArray
					activeUserIngredientArray.push($(item.children[1]).text())			// binding to jquery to use text function
				}
			}
		}

		if (found) {
			localStorage.setItem(`hh-activeUserIngredientArray`, JSON.stringify(activeUserIngredientArray))
			$(el).attr(`class`, `recipe-ingredients-button addSelected disable-click`).text(`Added selected to list`)
		}

	})

	$(`.mini-selectAll-buttons`).on(`click`,function(e){
		alert(`feature coming soon!`)
		var el = e.target
		console.log(el.parentElement.parentElement.children)

		// going to have to give each ingredient a "component-id"
		// then add/select all ingredients associated with that component
		
		// while(el.parentElement.nextElementSibling.tagName === "LI"){

		// 	if(el.parentElement.nextElementSibling.children[0].checked){
		// 		console.log(`already checked`)
		// 	} else{
		// 		el.parentElement.nextElementSibling.children[0].checked = true
		// 	}
		// }
	})
}
function buildRecipeContainer() {
	resultsDiv.append(ulRecipeList.empty())			// appends blank recipe list to the results div 

	var getToShow = JSON.parse(localStorage.getItem(`hh-itemsToShow`))			// user set options to display

	if (getToShow === null) {
		itemsToShow = 15			// amount of meals to show, to choose from

	} else {
		itemsToShow = getToShow
	}

	if (recipeArray.length < itemsToShow) {
		itemsToShow = recipeArray.length
	}

	for (i = 0; i < itemsToShow; i++) {
		var linktoRecipe = $(`<p class="full-recipe-links">`).attr(`id`, `recipe-video-` + i).text(`Click here for full recipe & video`)
		var result = $(`<div>`).attr(`class`, `recipe-list-items`).attr(`id`, `list-item` + i)
		var ulIngredientsList = $(`<ul class="recipe-ing-list" style="display:none;">`).attr(`id`, i).empty()
		var recipeImg = $(`<img class="recipe-images">`).attr(`src`, recipeArray[i].thumbnail_url)
		var recipeName = $(`<p>`).attr(`id`, `recipe-name-` + i).attr(`class`, `recipe-names`).text(recipeArray[i].name)
		var recipeScorePos = $(`<span style="font-size:smaller">`).attr(`id`, `positive-score-` + i).attr(`class`, `user-ratings`).text(`👍: ` + recipeArray[i].userRating.count_positive + `     `)
		var recipeScoreNeg = $(`<span style="font-size:smaller">`).attr(`id`, `negative-score-` + i).attr(`class`, `user-ratings`).text(`👎: ` + recipeArray[i].userRating.count_negative + `     `)

		result.append(recipeImg, recipeScorePos, recipeScoreNeg, recipeName)
		ulRecipeList.append(result)

		for (w = 0; w < recipeArray[i].sections.length; w++) {
			// append the name of the "component" and then in the loop its respective ingredients
			var addThese = $(`<button class="mini-selectAll-buttons">`).text(`Select all`)
			$(`<p class="component-header">`)
				.text(recipeArray[i].sections[w].name)				// name
				.appendTo(ulIngredientsList)						// append to the declared ul outside loop
				.append(addThese)

			for (x = 0; x < recipeArray[i].sections[w].ingredientsArray[0].length; x++) {
				if (recipeArray[i].sections[w].ingredientsArray[0][x].raw_text !== `n/a`) {
					var li = $(`<li>`)
					// make a checkbox for each ingredient
					var chkbox = $(`<input>`).attr(`type`, `checkbox`).attr(`id`, `recipe-` + i + `-section-` + w + `-ingredient-` + x)
					var label = $(`<label class="truncate">`).attr(`for`, `recipe-` + i + `-section-` + w + `-ingredient-` + x).text(recipeArray[i].sections[w].ingredientsArray[0][x].raw_text)

					ulIngredientsList.append(li.append(chkbox, label))
				}

			}
		}
		ulIngredientsList.prepend(linktoRecipe) 			// prepending the link to top

		// making a add-all and add-selected (to grocery list) buttons
		var allButton = $(`<button class="recipe-ingredients-button addAll">`).attr(`type`, `button`).attr(`id`, ``).text(`Select all`)
		var selectedButton = $(`<button class="recipe-ingredients-button addSelected">`).attr(`type`, `button`).attr(`id`, ``).text(`Add selected to my Hungry Hip-List™`)
		result.append(ulIngredientsList.append(selectedButton, allButton))				// appending aforementioned buttons to ul which is itself appended to the "result" recipe
	}

}
function callRecipeModal(id) {
	var modalContent = $(`#recipe-modal-content`)
	var modal = $(`#recipe-modal`)
	var closeBtn = $(`<button id="recipe-close-button" class="recipe-close-button">`).text(`Close`)
	var instructionsList = $(`<ol>`)
	var title = $(`<h5>`).text(recipeArray[id].name + `:`)
	var video = $(`<video controls>`).attr(`class`, `recipe-videos`)
	var vidSrc1 = $(`<source>`).attr(`src`, recipeArray[id].video_url).attr(`type`, `video/mp4`).text(`Your browser does not support mp4 video playback`)

	modalContent.empty()
	modal.attr(`style`, `display:block;`)					// immediately displaying the modal when called

	for (l = 0; l < recipeArray[id].instructions.length; l++) {
		$(`<li class="instructions-list-item">`).text(recipeArray[id].instructions[l]).appendTo(instructionsList)
		// console.log(recipeArray[id].instructions)
	}

	modalContent.append(title, video.append(vidSrc1), instructionsList, closeBtn)

	closeBtn.on(`click`, function () {
		modal.attr(`style`, `display:none;`)		// fake save button if settings can be saved when checked/unchecked
		video.remove()								// removing video when modal is hidden
	})

	// When the user clicks anywhere outside of the modal, it closes it and removes video (or it will continue playing)
	$(window).on(`click`, function (event) {
		if (event.target === modal[0]) {
			modal.attr(`style`, `display:none;`)
			video.remove()
		}
	})
}
function displaySearchTerm(term) {
	resultsDiv.append($(`<div>`)
		.attr(`style`, `padding-top: .42em; text-align: center;`)
		.html(`Search results for: <h6 style="font-weight: 800;">` + term + `</h6>`))
}
// on click listener on header text to get you "back" to your previous search results
$(`.hero-section-text`).on(`click`, function (e) {
	resultsDiv.empty()
	displaySearchTerm(localStorage.getItem(`hh-search-term-last`))
	showResults()
})

// })	// end of "on load" 	
