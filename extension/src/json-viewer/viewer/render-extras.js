var chrome = require('chrome-framework');
var svgSearch = require('../../../icons/search.svg');
var svgGear = require('../../../icons/gear.svg');
var svgRaw = require('../../../icons/raw.svg');
var svgUnfold = require('../../../icons/unfold.svg');
var applyJsonPath = require('./apply-jsonpath');

function renderExtras(pre, options, highlighter) {
  var extras = document.createElement("div");
  extras.className = "extras";

  if (!options.addons.autoHighlight) {
    extras.className += ' auto-highlight-off';
  }

  var originalText = "";
  var searchLink = document.createElement("a");
  searchLink.className = "json_viewer icon filter";
  searchLink.href = "#";
  searchLink.title = "Toggle JSONPath filter";
  searchLink.innerHTML = svgSearch;
  searchLink.onclick = function(e) {
    e.preventDefault();

    var editor = document.getElementsByClassName('CodeMirror')[0];
    if (pre.searchEnabled) {
      pre.searchEnabled = false;
      extras.classList.remove("search-active");

      var searchWindow = document.getElementsByClassName("search")[0];
      editor.removeChild(searchWindow);

      highlighter.editor.setValue(originalText);
    } else {
      pre.searchEnabled = true;

      var searchWindow = document.createElement("div");
      searchWindow.classList.add("search", "jsonpath-wrapper");

      var textField = document.createElement("input");
      textField.value = "$";
      searchWindow.appendChild(textField);

      originalText = highlighter.editor.getValue();
      textField.addEventListener("keyup", function () {
        if (!this.value) this.value = "$";
        
        applyJsonPath(this.value, originalText, highlighter, options.addons.prependHeader);
      })

      editor.prepend(searchWindow);
    }
  }

  var optionsLink = document.createElement("a");
  optionsLink.className = "json_viewer icon gear";
  optionsLink.href = chrome.runtime.getURL("/pages/options.html");
  optionsLink.target = "_blank";
  optionsLink.title = "Options";
  optionsLink.innerHTML = svgGear;

  var rawLink = document.createElement("a");
  rawLink.className = "json_viewer icon raw";
  rawLink.href = "#";
  rawLink.title = "Show original JSON";
  rawLink.innerHTML = svgRaw;
  rawLink.onclick = function(e) {
    e.preventDefault();
    var editor = document.getElementsByClassName('CodeMirror')[0];

    if (pre.hidden) {
      // Raw enabled
      highlighter.hide();
      pre.hidden = false;
      extras.className += ' auto-highlight-off';

    } else {
      // Raw disabled
      highlighter.show();
      pre.hidden = true;
      extras.className = extras.className.replace(/\s+auto-highlight-off/, '');
    }
  }

  var unfoldLink = document.createElement("a");
  unfoldLink.className = "json_viewer icon unfold";
  unfoldLink.href = "#";
  unfoldLink.title = "Fold/Unfold all";
  unfoldLink.innerHTML = svgUnfold;
  unfoldLink.onclick = function(e) {
    e.preventDefault();
    var value = pre.getAttribute('data-folded')

    if (value === 'true' || value === true) {
      highlighter.unfoldAll();
      pre.setAttribute('data-folded', false)

    } else {
      highlighter.fold();
      pre.setAttribute('data-folded', true)
    }
  }
  pre.setAttribute('data-folded', options.addons.alwaysFold)

  extras.appendChild(rawLink);
  extras.appendChild(unfoldLink);
  extras.appendChild(searchLink);
  extras.appendChild(optionsLink);

  document.body.appendChild(extras);
}

module.exports = renderExtras;
