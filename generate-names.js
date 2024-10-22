(function () {
  window.addEventListener("load", () => {
    console.log("load event");
    displayNames(100);
  });
  window.addEventListener("DOMContentLoaded", () => {
    debugger;
    $("a.dropdown-item").click((event) => {
      debugger;
      $("#names").html("");
      displayNames(100, event.target.dataLang);
    });
  });
})();

// https://gist.github.com/ionurboz/51b505ee3281cd713747b4a84d69f434
function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last, deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date(),
      args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

var scrollY = 0;
document.addEventListener(
  "scroll",
  throttle(() => {
    let newScrollY = document.documentElement.scrollTop;
    if (newScrollY > scrollY) {
      console.log("Adding 10 names ...");
      displayNames(10);
    }
    scrollY = newScrollY;
  }, 1000)
);

function generateName(adj_matrix) {
  var firstLetterIndex = getRandomIntInclusive(0, 25);
  var numLetters = getRandomIntInclusive(5, 15);
  var i = 0,
    firstLetter;
  for (var letter in adj_matrix) {
    if (i === firstLetterIndex) {
      firstLetter = letter;
      break;
    }
    i++;
  }
  var row = adj_matrix[letter];
  var generatedName = [];
  var nextLetter = firstLetter;
  for (var i = 0; i < numLetters; i++) {
    generatedName.push(nextLetter);
    nextLetter = weightedRand(row);
    row = adj_matrix[nextLetter];
  }
  return generatedName.join("");
}

var matrixTypeToFile = {
  nordic: "adj-matrix-nordic-full",
  social: "adj-matrix-neutral",
};

function displayNames(num_rows, matrix_type) {
  console.log("displayNames");
  let matrix_fname = matrixTypeToFile[matrix_type];
  let url = `https://first-name-generator-5cb32459f194.herokuapp.com/static/${matrix_fname}.json`;
  $.ajax({
    dataType: "json",
    url: "https://first-name-generator-5cb32459f194.herokuapp.com/static/adj-matrix-nordic-full.json",
    success: function (adj_matrix) {
      var div = $("#names");
      var viewport = window.visualViewport.width;
      var numCols = Math.floor(viewport / 400) + 1;
      for (i = 0; i < num_rows; i++) {
        var rowDiv = $("<div>", { class: "row" });
        for (j = 0; j < numCols; j++) {
          let name = generateName(adj_matrix);
          let nameDiv = $(
            `<div class="name text-left mt-2 ml-2 lead"> <strong>${name}</strong></div>`
          );
          let copyButton = $(`<img src="copy.png"/>`);
          async function writeClipboardText(text) {
            console.log(`writing ${text} to clipboard`);
            try {
              await navigator.clipboard.writeText(text);
            } catch (error) {
              console.error(error.message);
            }
          }
          copyButton.click(() => {
            writeClipboardText(name);
          });
          colDiv = $(`<div class="col"></div>`);
          nameDiv.prepend(copyButton);
          colDiv.append(nameDiv);
          rowDiv.append(colDiv);
        }
        $(div).append(rowDiv);
      }
    },
  });
}

// Ref:
// https://stackoverflow.com/questions/8435183/generate-a-weighted-random-number
function weightedRand(spec) {
  var i,
    sum = 0,
    r = Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}

// Ref:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

// Ref: SO
function get_req(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return req.responseText;
}
