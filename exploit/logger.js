(function() {
  function createEntry(message) {
    var entry = document.createElement("div");
    entry.classList += "entry";
    entry.innerHTML = message;
    return entry;
  }

  // Get reference to log section.
  var log = document.getElementById("log");

  // Print logs to page.
  var originalLog = console.log;

  console.log = function(message) {
    originalLog(message);
    var entry = createEntry(message);
    log.appendChild(entry);
  };

  // Print errors to page.
  var originalError = console.error;

  console.error = function(error) {
    originalError(error);
    var entry = createEntry(error);
    entry.style = "color: red;";
    log.appendChild(entry);
  };

  // Print window errors to page.
  var originalWindowError = window.onerror;

  window.onerror = function(error, url, line) {
    originalWindowError(error, url, line);
    var entry = createEntry(error);
    entry.style = "color: red;";
    log.appendChild(entry);
  };
}());
