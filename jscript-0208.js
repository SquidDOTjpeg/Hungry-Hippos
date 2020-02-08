var searchPara, userRatingScore, sampleIngredient, mealURL, mealImg;
var recipeArray = [];
const searchBar = $(`#search-bar`)
const targetForm = $(`#target-form`)
// console.log(searchBar)
targetForm.submit(function(e){
    e.preventDefault()
    el = e.target
    console.log(el)
    console.log(searchBar[0].value)
    searchPara = searchBar[0].value
    runRecipeAjax()
})

function runRecipeAjax(){
    console.log(`======= runAjax() START =======`)


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
        console.log(`======= response received START =======`)
        recipeArray = []
        console.log(response);
    
        for(j=0;j<response.results.length;j++){
            var newObj = {};
            newObj.name = response.results[j].name
            newObj.video_url = response.results[j].video_url
            newObj.thumbnail_url = response.results[j].thumbnail_url
            newObj.ingredientsArray = []
            var ingredientResponse
            if(response.results[j].sections !== undefined){
                newObj.userRating = response.results[j].user_ratings.score
                ingredientResponse = response.results[j].sections[0].components
            }
    
            for(var i=0;i<ingredientResponse.length;i++){
                if(ingredientResponse[i].raw_text !== 'n/a'){
                    newObj.ingredientsArray.push(ingredientResponse[i].raw_text)
                } 
            }
            recipeArray.push(newObj)
        }
        console.log(recipeArray)

        console.log(`======= response received END =======`)
    });

    console.log(`======= runAjax() END =======`)
}






