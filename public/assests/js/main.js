function listenFunction() {
  alert("Function listening");
}

function offlineFunction() {
  alert("Function offline");
}

// Check if the browser supports the SpeechRecognition API
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  // Create an instance of SpeechRecognition
  var recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();

  // Set the language for speech recognition (optional)
  recognition.lang = "en-US";

  // Speech recognition event handlers
  // recognition.onresult = function (event) {
  //   var transcript = event.results[0][0].transcript;
  //   console.log("Transcript:", transcript);
  //   // location.replace('../../welcome.html');
  //   localStorage.setItem('spokenText', transcript);
  //   if (transcript == "go to home page") {
  //     if ("speechSynthesis" in window) {
  //       var msg = new SpeechSynthesisUtterance();
  //       msg.text = "Did you say?" + transcript +"Or would you like to repeat it?";
  //       msg.rate = 1.0;
  //       msg.pitch = 1.0;
  //       window.speechSynthesis.speak(msg);
  //     }
  //     location.replace('../../welcome.html');
  //   }
  //   else if (transcript == "go to login page") {
  //     if ("speechSynthesis" in window) {
  //       var msg = new SpeechSynthesisUtterance();
  //       msg.text = "Did you say?" + transcript +"Or would you like to repeat it?";
  //       msg.rate = 1.0;
  //       msg.pitch = 1.0;
  //       window.speechSynthesis.speak(msg);
  //     }
  //     location.replace('../../login.html');
  //   }
  //   else if (transcript == "go to sign up page") {
  //     if ("speechSynthesis" in window) {
  //       var msg = new SpeechSynthesisUtterance();
  //       msg.text = "Did you say?" + transcript +"Or would you like to repeat it?";
  //       msg.rate = 1.0;
  //       msg.pitch = 1.0;
  //       window.speechSynthesis.speak(msg);
  //     }
  //     location.replace('../../signin.html');
  //   }
  //   else{
  //     if ("speechSynthesis" in window) {
  //       var msg = new SpeechSynthesisUtterance();
  //       msg.text = "The service you requested is not available! please try again";
  //       msg.rate = 1.0;
  //       msg.pitch = 1.0;
  //       window.speechSynthesis.speak(msg);
  //     }
  //     location.replace('../../welcome.html');
  //   }
  recognition.onresult = function (event) {
    var transcript = event.results[0][0].transcript;
    console.log("Transcript:", transcript);
    localStorage.setItem("spokenText", transcript);

    switch (transcript) {
      case "go to home page":
        speakAndRedirect(transcript, "../../home.html");
        break;

      case "go to login page":
        speakAndRedirect(transcript, "../../login.html");
        break;

      case "go to sign up page":
        speakAndRedirect(transcript, "../../signin.html");
        break;

      default:
        speakText(
          "The service you requested is not available! Please try again"
        );
        redirectURL("../../home");
        break;
    }
  };

  function speakText(text) {
    if ("speechSynthesis" in window) {
      var msg = new SpeechSynthesisUtterance();
      msg.text = text;
      msg.rate = 1.0;
      msg.pitch = 1.0;
      window.speechSynthesis.speak(msg);
    }
  }

  function redirectURL(url) {
    location.replace(url);
  }

  function speakAndRedirect(transcript, url) {
    var message =
      "Did you say? " + transcript + " Or would you like to repeat it?";
    speakText(message);
    redirectURL(url);
  }

  // function navigatePageTo(){
  //   window.location.href ='../../home'
  // }

  recognition.onend = function () {
    console.log("Speech recognition ended.");
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
  };

  // Start speech recognition when button is clicked
  document
    .getElementById("speechToTextBtn")
    .addEventListener("click", function () {
      recognition.start();
    });
}
