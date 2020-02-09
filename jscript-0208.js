const searchBarInput = $(`#search-bar-input`)
const searchBarDiv = $(`#search-bar-div`)
const searchForm = $(`#search-form`)
var searchPara, topMeals, userRatingScore, sampleIngredient, mealURL, mealImg;
var recipeArray = [];
// var recipestoPull = 20

searchForm.submit(function(e){
	e.preventDefault()
	searchPara = searchBarInput[0].value 	// places value of search bar input into variable, on submit (enter)

    runRecipeAjax()
})

function runRecipeAjax(){

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://tasty.p.rapidapi.com/recipes/list?&q="+searchPara+"&from=0&sizes=20",
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "tasty.p.rapidapi.com",
            "x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
        }
    }

    $.ajax(settings).then(function (response) {
        console.log(`======= AJAX response (received) START =======`)
		console.log(`response obj: `)
		console.log(response);
		
		recipeArray = []		// clearing the array
	
		// loop through array of responses and grab what you need (put in obj)
        for(j=0;j<response.results.length;j++){
            var newObj = {};
			var ingredientResponse
			
            newObj.name = response.results[j].name						// name of recipe
            newObj.video_url = response.results[j].video_url
            newObj.thumbnail_url = response.results[j].thumbnail_url
            newObj.ingredientsArray = []								// making a clear array to house ingredients looped later

            if(response.results[j].sections !== undefined){
                newObj.userRating = response.results[j].user_ratings.score
                ingredientResponse = response.results[j].sections[0].components
            }
			
			// loop through each ingredients and push to array for easy access 
            for(var i=0;i<ingredientResponse.length;i++){
				// some indices in the "ingredients" response array are "n/a", this just ignores them for pushing
                if(ingredientResponse[i].raw_text !== 'n/a'){
                    newObj.ingredientsArray.push(ingredientResponse[i].raw_text)
                } 
            }
            recipeArray.push(newObj)			// push whole new obj into the recipe array
		}

        showResults()
		
		// console.log(`The recipe array is:`)
		// console.log(recipeArray)	

        console.log(`======= AJAX response END =======`)
    });
}
function showResults(){
	var ul = $(`<ul>`)
	var itemsToShow = 5			// amount of meals to show, to choose from
	
    for(i=0;i<itemsToShow;i++){
        var result = $(`<li>`).attr(`class`, ``).attr(`id`, `list-item`+i)
        result.append($(`<img>`).attr(`src`,recipeArray[i].thumbnail_url).attr(`style`,`width: 6em`))
        result.append($(`<button>`).attr(`id`,`button-`+i).attr(`type`,`button`).attr(`class`,`meal-buttons`).text(recipeArray[i].name))
        ul.append(result)
    }

	searchBarDiv.append(ul)
	searchBarDiv.append($(`<button>`).attr(`type`, `button`).attr(`id`,``).text(`Next 5`))
    
    $(`.meal-buttons`).on(`click`,function(e){
        var el = e.target
        console.log(el.id)
        
        switch(el.id){
            case `button-0`:
                dropdownRecipe(0)
                break
            case `button-1`:
                dropdownRecipe(1)
                break
            case `button-2`:
                dropdownRecipe(2)
                break
            case `button-3`:
                dropdownRecipe(3)
                break
            case `button-4`:
                dropdownRecipe(4)
                break
        }
    })
}


function dropdownRecipe(arg){
    var selectedItem = `#list-item`+arg
    $(selectedItem).append(`instructions for ` + recipeArray[arg].name + ` are: `)
    // searchBarDiv.append(`instructions for ` + recipeArray[arg].name + ` are: `)
    // console.log(`this is the recipe name: ` + recipeArray[arg].name)
}

function buildRecipeDiv(){
    // need to add button at bottom >> for "adding all ingredients" to "user Active List"
    
}
