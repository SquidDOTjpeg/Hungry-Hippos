// $(window).on("load", function () {
	// waits for window to load before running rest of js ^
	const searchInput = $(`#findlocate`)
	const resultsDiv = $(`#results-div`)
	const formSearch = $(`#search-form`)
	const searchAnimationDiv = $(`<div class="search-animation-div">`)
	const ulRecipeList = $(`<ul id="recipe-list" class="recipe-list">`)
	const feelingLuckySpan = $(`#feeling-lucky`)
	const feelingLuckyCog = $(`#feeling-lucky-cog`)
	var searchingTimer;
	var searchPara, topMeals, userRatingScore, sampleIngredient, mealURL, mealImg;
	var recipeArray = [];			// array to hold each recipe obj
	var feelingLuckyArray = [`Pizza`, `Burger`, `Mexican`, `Chinese`, `Beef`, `Chicken`, `Pork`, `Tacos`, `Kale`, `Thai`, `Vietnamese`, `American`, `Orange Chicken`, `Orange Juice`, `Coconut`, `Acai`, `Corn`, `Hot Dog`]
	var yuckyArray = [`Pancake`];
	// var recipestoPull = 20

	feelingLuckyCog.on(`click`, function (e) {
		callSettingsModal()
		// alert(`Select which options to include in Hot recipes:\n\n` + feelingLuckyArray.join(`\n`))
	})

	feelingLuckySpan.on(`click`, function (e) {
		ulRecipeList.empty()
		var rnum = Math.floor(Math.random() * feelingLuckyArray.length)
		searchPara = feelingLuckyArray[rnum]
		runRecipeAjax()
	})

	formSearch.submit(function (e) {
		ulRecipeList.empty()
		searchPara = searchInput[0].value 	// places value of search bar input into variable, on submit (enter)
		runRecipeAjax()
		// e.preventDefault()
		searchInput[0].value = ``
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

		function createSettingsList(term,c){
			var foodterm = term
			var li = $(`<li class="settings-list-item">`)
			var checkbox;

			if(c === `chk`){
				checkbox = $(`<input type="checkbox" checked>`)

			} else{
				checkbox = $(`<input type="checkbox">`)
			}

			var label = $(`<label>`).attr(`for`,foodterm).attr(`id`,foodterm).text(foodterm)

			settingsList.append(li.append(checkbox, label))
		}

		modalContent.empty()
		modal.attr(`style`,`display:block;`)					// immediately displaying the modal when called

		for(l=0;l<feelingLuckyArray.length;l++){
			createSettingsList(feelingLuckyArray[l],chk)
		}

		for(y=0;y<yuckyArray.length;y++){
			createSettingsList(yuckyArray[y],unchk)
		}

		// make listener for checked change & move (push/splice) to yuckyArray

		modalContent.append(title, settingsList, saveBtn)
		
		saveBtn.on(`click`,function () {
			modal.attr(`style`,`display:none;`)			// fake save button if settings can be saved when checked/unchecked

		})

		// When the user clicks anywhere outside of the modal, it does not close it
		$(window).on(`click`,function (event) {
			if (event.target == modal) {
				modal.attr(`style`,`display:block;`)
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
			"url": "https://tasty.p.rapidapi.com/recipes/list?&q=" + searchPara + "&from=0&sizes=20",
			"method": "GET",
			"error": recipeAjaxError,
			"headers": {
				"x-rapidapi-host": "tasty.p.rapidapi.com",
				"x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
			}
		}

		$.ajax(settings).then(function (response) {
			console.log(`======= AJAX response (received) START =======`, response)
			searchPara = ``
			clearInterval(searchingTimer)			// clearing the "searching animation" timer soon as a response is received
			recipeArray = []						// clearing the array

			// loop through array of responses and grab what you need (put in obj)
			for (j = 0; j < response.results.length; j++) {
				var newObj = {};			// creating a blank new obj called, well, newObj.

				newObj.name = response.results[j].name						// name of recipe
				newObj.video_url = response.results[j].video_url
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
			// var modal = 

			// I'd like a MODAL here, with the instructions in it (scroll capable and responsive)

			// $(`<div class="instructions-container">`).append(" ELEMENT TO APPEND HERE ").appendTo(el)
		})
	}
	function buildRecipeContainer() {
		var itemsToShow = 5			// amount of meals to show, to choose from
		if (recipeArray.length < itemsToShow) {
			itemsToShow = recipeArray.length
		}

		for (i = 0; i < itemsToShow; i++) {
			var linktoRecipe = $(`<p class="full-recipe-links">`).attr(`id`, `recipe-video-` + i).text(`Click here for full recipe`)
			var result = $(`<div>`).attr(`class`, `recipe-list-items`).attr(`id`, `list-item` + i)
			var ulIngredientsList = $(`<ul class="ingredients-list" style="display:none;">`)

			result.append($(`<img class="recipe-images">`).attr(`src`, recipeArray[i].thumbnail_url))
			result.append($(`<span>`).attr(`id`, `recipe-` + i).attr(`class`, `recipe-names`).text(recipeArray[i].name))
			ulRecipeList.append(result)

			for (w = 0; w < recipeArray[i].sections.length; w++) {
				// append the name of the "component" and then in the loop its respective ingredients
				$(`<p class="component-header">`).text(recipeArray[i].sections[w].name).appendTo(ulIngredientsList)

				for (x = 0; x < recipeArray[i].sections[w].ingredientsArray[0].length; x++) {
					$(`<li class="truncate">`).text(recipeArray[i].sections[w].ingredientsArray[0][x].raw_text).appendTo(ulIngredientsList)
				}
			}
			ulIngredientsList.prepend(linktoRecipe)
			result.append(ulIngredientsList.append($(`<button class="recipe-ingredients-button-addAll">`).attr(`type`, `button`).attr(`id`, ``).text(`add ingredients to my list`)))
		}

	}


	function renderRecipeInstructions() {
		alert(`let's do this`)
	}

// })	// end of "on load" 	
