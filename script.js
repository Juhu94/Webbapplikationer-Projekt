getCategories();

function init(){
	
	$("#answer1").on("click", checkAnswer);
	$("#answer2").on("click", checkAnswer);
	$("#answer3").on("click", checkAnswer);
	$("#answer4").on("click", checkAnswer);
}

function getCategories(){
		var category = $("#category");
		var urlNew = "https://opentdb.com/api_category.php";

		$.ajax({
			url: urlNew,
			dataType: "JSON",
		}).done(function(data){
			console.log("Test: ");
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

$("#get-q").on("click", function() {
	var selected = $("#category :selected").val();
	var difficulty = $("#difficulty :selected").text().toLowerCase();
	var nbrOfQuestions = $("#nbrOfQ").val();
	var questionType = "multiple";
	var encode = "base64";
	var url = "https://opentdb.com/api.php?";
	console.log("Antal frågor: " +nbrOfQuestions + " - Svårighetsgrad: -" +difficulty  +" - Kategori: " +selected);
	
	if(nbrOfQuestions === ""){
		nbrOfQuestions = "5";
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
});

var i = 0;

$("#next-q").on("click", function() {
	nextQuestion();
});

var parentObject;
var correctAnswer;
var correctAnswerPos;

function saveQuestions(jsonObject){
	i = 0;
	parentObject = jsonObject;	
	nextQuestion();
}

function nextQuestion(){
	
	if(i === parentObject.results.length){
		alert("NO MORE QUESTIONS");
	}else{
		$(".answersC").remove();
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
			$("#answers").append("<li class="+"answersC"+" id="+"answer"+(j+1)+"><a href="+ "#" +">" +answers[j] +"</a></li>");
			if(answers[j] === correctAnswer){
				$("#answer"+(j+1)).addClass("correct");
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
	
	if(answer === correctAnswer){
		console.log("GRATTIS");
		$(this).addClass("correctAnswer");
	}
	else{
		$(this).addClass("wrongAnswer");
		$(".correct").addClass("correctAnswer");
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