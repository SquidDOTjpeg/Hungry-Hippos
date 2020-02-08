var unirest = require("unirest");

var req = unirest("GET", "https://tasty.p.rapidapi.com/tags/list");

req.headers({
	"x-rapidapi-host": "tasty.p.rapidapi.com",
	"x-rapidapi-key": "859d702838msh5b93a71ca2adb7dp16e714jsnd5e12694a313"
});


req.end(function (res) {
	if (res.error) throw new Error(res.error);

	console.log(res.body);
});