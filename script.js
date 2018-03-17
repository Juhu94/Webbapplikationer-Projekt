getCategories();

function init(){

	$("#btn0").on("click", checkAnswer);
	$("#btn1").on("click", checkAnswer);
	$("#btn2").on("click", checkAnswer);
	$("#btn3").on("click", checkAnswer);
}

function getCategories(){
		var category = $("#category");
		var urlNew = "https://opentdb.com/api_category.php";

		$.ajax({
			url: urlNew,
			dataType: "JSON",
		}).done(function(data){
			console.log(data);
			console.log(data.trivia_categories.length);
			for(var i = 0; i < data.trivia_categories.length; i++){
				category.append("<option value="+data.trivia_categories[i].id+">"+data.trivia_categories[i].name+"</options>");
			}
		}).fail(function (data){
			console.log(data);
			alert("Gick inte att hämta kategorier");

		});
}

$("#save-q").on("click", function(){
	var selected = $("#category :selected").val();
	var category = $("#category :selected").text();
	var difficulty = $("#difficulty :selected").text().toLowerCase();
	var nbrOfQuestions = $("#nbrOfQ").val();
	var loadQuestions = "true";
	localStorage.setItem("selected", selected);
	localStorage.setItem("category", category);
	localStorage.setItem("difficulty", difficulty);
	localStorage.setItem("nbrOfQuestions", nbrOfQuestions);
	localStorage.setItem("loadQuestions", loadQuestions);
});

$("#get-h").on("click", function() {
	var loadHistory = "true";
	localStorage.setItem("loadHistory", loadHistory);
	console.log("value: " + loadHistory);
});

$(window).on("load", function() {
	var loadQuestions = "false";
	var loadHistory = "false";
	loadQuestions = localStorage.getItem("loadQuestions");
	loadHistory = localStorage.getItem("loadHistory");
	console.log("loadQuestions värde: " + loadQuestions);
	console.log("loadHistory värde: " + loadHistory);
	if(loadQuestions === "true"){
		startQuiz();
	} else if(loadHistory === "true") {
		console.log("loadHistory value: " + loadHistory);
		startHistory();
	} else {
		console.log("loadHistory and loadQuestions are false");
	}
});

function startQuiz() {
	var selected = localStorage.getItem("selected");
	var category = localStorage.getItem("category");
	var difficulty = localStorage.getItem("difficulty");
	var nbrOfQuestions = localStorage.getItem("nbrOfQuestions");
	console.log("selected: " + selected + "-----" + "difficulty: " + difficulty + "-----" + "nbrOfQuestions: " + nbrOfQuestions + "------------------ category: " + category);
	var questionType = "multiple";
	var encode = "base64";
	var url = "https://opentdb.com/api.php?";
	console.log("Antal frågor: " +nbrOfQuestions + " - Svårighetsgrad: -" +difficulty  +" - Kategori: " +selected);

	if(nbrOfQuestions === ""){
		nbrOfQuestions = "5";
		localStorage.setItem("nbrOfQuestions", nbrOfQuestions);
		url += "amount="+nbrOfQuestions;
	}else{
		url += "amount="+nbrOfQuestions;
	}

	if(difficulty !== "any difficulty"){
		url += "&difficulty="+difficulty;
	}

	if(selected !== "Any category"){
		url += "&category="+selected;
	}

	url += "&type="+questionType;
	url += "&encode="+encode;

	console.log(url);

	$.ajax({
		url: url,
		dataType: "JSON",
	}).done (function (data){

		console.log("DATA: " +data);
		console.log("DATA: " +data.results[0].question);
		saveQuestions(data);


	}).fail (function (data){
		console.log(data);
	});
}

function startHistory() {
	var games = getGames();
	console.log("games: " + games);
	for(var j = 0; j < games.length; j++){
		console.log("Funkar något? " + games[j].points + " ---- " + games[j].number_questions + " ---- " + games[j].date);
		$("#listGames").append("<li class=" + "historyLI" + ">"+"POINTS: " + games[j].points + " out of " + games[j].number_questions + " | CATEGORY: " + games[j].category + " | DIFFICULTY: " + games[j].difficulty + " | DATE: " + games[j].date + "</li>");
	}
	localStorage.removeItem("loadHistory");
}

var i = 0;

$("#next-q").on("click", function() {
	nextQuestion();
});

var parentObject;
var correctAnswer;
var correctAnswerPos;
var nbrCorrectAnswers = 0;

function saveQuestions(jsonObject){
	i = 0;
	parentObject = jsonObject;
	nextQuestion();
}

function nextQuestion(){
	console.log("Vad händer: " + parentObject);
	if(i === parentObject.results.length){
		$("#next-q").hide();
		var nbrOfQuestions = localStorage.getItem("nbrOfQuestions");
		alert("You got " + nbrCorrectAnswers + " right out of " + nbrOfQuestions + " questions.");
		saveResult(nbrCorrectAnswers, nbrOfQuestions);
		localStorage.removeItem("selected");
		localStorage.removeItem("difficulty");
		localStorage.removeItem("nbrOfQuestions");
		localStorage.removeItem("loadQuestions");
		localStorage.removeItem("loadHistory");
		url = "index.html";
		window.location.replace(url);
	}else{
		$("#next-q").hide();
		$(".answersC").remove();
		$("#btn0").removeClass("correct correctAnswer wrongAnswer");
		$("#btn1").removeClass("correct correctAnswer wrongAnswer");
		$("#btn2").removeClass("correct correctAnswer wrongAnswer");
		$("#btn3").removeClass("correct correctAnswer wrongAnswer");
		$("#progress").text("Question " + (i + 1) + " of " + parentObject.results.length);
		var currentQuestion = parentObject.results[i];

		var question = currentQuestion.question;
		var answer1 = currentQuestion.incorrect_answers[0];
		var answer2 = currentQuestion.incorrect_answers[1];
		var answer3 = currentQuestion.incorrect_answers[2];
		var answer4 = currentQuestion.correct_answer;

		question = b64DecodeUnicode(question);
		answer1 = b64DecodeUnicode(answer1);
		answer2 = b64DecodeUnicode(answer2);
		answer3 = b64DecodeUnicode(answer3);
		answer4 = b64DecodeUnicode(answer4);

		correctAnswer = answer4;

		var answers = [answer1, answer2, answer3, answer4];
		answers = shuffle(answers);

		var q = $("#question").text(question);
		for(var j = 0; j < answers.length; j++){
			//$("#answers").append("<li class="+"answersC"+" id="+"answer"+(j+1)+"><a href="+ "#" +">" +answers[j] +"</a></li>");
			$("#btn"+j).text(answers[j]);
			if(answers[j] === correctAnswer){
				$("#btn"+(j)).addClass("correct");
			}
		}
		init();
		console.log("i = " + i);
		i++;

	}
}

function checkAnswer(){
	var answer = $(this).text();
	console.log(answer);
	$("#next-q").show();

	if(answer === correctAnswer){
		console.log("GRATTIS");
		$(this).addClass("correctAnswer");
		nbrCorrectAnswers++;
		console.log("Antal rätt svar: " + nbrCorrectAnswers);
	}
	else{
		$(this).addClass("wrongAnswer");
		$(".correct").addClass("correctAnswer");
	}
	$("#btn0").off();
	$("#btn1").off();
	$("#btn2").off();
	$("#btn3").off();
}

function saveResult(nbrCorrectAnswers, nbrOfQuestions){
	var d = new Date();
	var month = d.getMonth()+1;
	var day = d.getDate();

	var output = d.getFullYear() + '/' +
    (month<10 ? '0' : '') + month + '/' +
    (day<10 ? '0' : '') + day;
		console.log("Date: " + output);

	var category = localStorage.getItem("category");
	var difficulty = localStorage.getItem("difficulty");

		var newGame = {
			date: output,
			points: nbrCorrectAnswers,
			number_questions: nbrOfQuestions,
			category: category,
			difficulty: difficulty
		}

		var games = getGames();
		games.push(newGame);
		console.log(games);
		localStorage.setItem("games", JSON.stringify(games));
}

function getGames() {
	// Hämtar alla todos från localStorage
	var games = localStorage.getItem("games");

	// Kontrollera om det finns några todos i localStorage
	if(games == null) {
		// Det finns inget i localStorage, så vi skapar en tom lista där
		localStorage.setItem("games", JSON.stringify([]));
		// Returnerar en tom lista (= inga todos)
		return [];
	} else {
		// Returnerar alla todos i en lista (från JSON => lista med objekt)
		return JSON.parse(games);
	}
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
