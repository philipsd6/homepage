function updateBackgroundWithTrianglify() {
  var target = document.body;
  var dimensions = target.getClientRects()[0];
  var pattern = Trianglify({
    width: dimensions.width,
    height: dimensions.height,
    cell_size: 50,
    variance: 0.8,
  });

  topPolys = pattern.polys.slice(Math.round(pattern.polys.length / 2))
  var colors = topPolys.map(function(val, idx, arr) {
    color = tinycolor(val[0])
    // If pixel is mostly opaque and not white
    if (!(color._r > 250 && color._g > 250 && color._b > 250)) {
      return color;
    }
  });

  // Sort colors as HSV
  colors.sort(function(a, b) {
    if (a.toHsv() > b.toHsv()) {
      return -1;
    }
    if (b.toHsv() > a.toHsv()) {
      return 1;
    }
    return 0;
  });

  var middleColor = colors[Math.round((colors.length - 1) / 2)];
  var colorChoices = [colors[0].darken(40),
                      colors[colors.length - 1].brighten(40)];
  var color = tinycolor.mostReadable(middleColor, colorChoices).toHexString();
  document.getElementById("banner").style['color'] = color;
  console.log(middleColor.toHexString() + " -> " + color);
  target.style['background-image'] = 'url(' + pattern.png() + ')';
  target.style['background-size'] = 'cover';
  target.style['-webkit-background-size'] = 'cover';
  target.style['-moz-background-size'] = 'cover';
  target.style['-o-background-size'] = 'cover';
}

function updateBackgroundWithGeoPattern() {
  var target = document.body;
  var pattern = GeoPattern.generate();
  var colorChoices = [tinycolor(pattern.color).brighten(40),
                      tinycolor(pattern.color).darken(40)];
  var color = tinycolor.mostReadable(pattern.color, colorChoices).toHexString();
  document.getElementById("banner").style['color'] = color;
  console.log(pattern.color + " -> " + color);
  target.style['background-image'] = pattern.toDataUrl();
  target.style['background-size'] = 'cover';
  target.style['-webkit-background-size'] = 'cover';
  target.style['-moz-background-size'] = 'cover';
  target.style['-o-background-size'] = 'cover';
}

function loadJSLib(resource, callback) {
  var head = document.getElementsByTagName("head")[0]
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", resource);
  script.onreadstatechange = callback;
  script.onload = callback;
  head.appendChild(script);
}

function createBackground(background) {
  switch (background) {
  case "trianglify":
    var resource = "js/trianglify.min.js";
    var updateBackground = updateBackgroundWithTrianglify;
    break;
  case "geopattern":
    var resource = "https://cdnjs.cloudflare.com/ajax/libs/geopattern/1.2.3/js/geopattern.min.js";
    var updateBackground = updateBackgroundWithGeoPattern;
    break;
  default:
    console.log("Unknown background type: " + type);
  }

  loadJSLib(resource, function() {
    updateBackground();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        updateBackground();
      }, 400);
    })
  });
}

function createBanner(target, title, font) {
  figlet.defaults({
    fontPath: '../fonts'
  });
  figlet(title, {
    font: font
  }, function(err, text) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    target.innerHTML = text
  });
}

function loadConfig(file) {
  var client = new XMLHttpRequest();
  client.onload = function() {
    if (this.status === 200) {
      handleConfig(jsyaml.load(client.responseText));
    }
  }
  client.open("GET", file, true);
  client.send(null);
}

function handleConfig(config) {
  document.title = config.title;
  createBackground(config.background);
  createBanner(
    document.getElementById("banner"),
    config.title,
    config.title_font);
}

loadConfig("config.yml")
