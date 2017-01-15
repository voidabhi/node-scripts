var document = require("jsdom").jsdom(),
    window = document.createWindow(),
    jQuery = require('jquery').create(window),
    fs = require('fs'),
    script = document.createElement("script");

window.Canvas = require('canvas');
script.src = 'https://gist.github.com/raw/790339/3b0171c3e9b749bb93fff5d642eaa687f02939a5/jquery.flot.node-canvas.js';
script.onload = function ()
{
    var i, d1 = [], d2 = [], d3 = [];
    for (i = 10; --i;) d1.push([i, parseInt(Math.random() * 30)]);
    for (i = 10; --i;) d2.push([i, parseInt(Math.random() * 30)]);
    for (i = 10; --i;) d3.push([i, parseInt(Math.random() * 30)]);

    var defaults = { 
        lines: { show: true, fill: true, steps: false },
        bars: { show: false, barWidth: 0.6 }
    };

    var data = [
        jQuery.extend(true, {}, defaults, {data: d1}),
        jQuery.extend(true, {}, defaults, {data: d2}),
        jQuery.extend(true, {}, defaults, {data: d3})
    ];

    var options = {
        width: 600, height: 300, 
        grid: {clickable: true, hoverable: true} 
    };

    var placeholder = jQuery(''), // empty jQuery object
        plot = jQuery.plot(placeholder, data, options),
        node_canvas = plot.getCanvas(),
        ctx = node_canvas.getContext('2d'),
        out = fs.createWriteStream(__dirname + '/flot.png'),
        stream = node_canvas.createPNGStream();

    stream.on('data', function ( chunk ) {
        out.write(chunk); 
    });
};
document.head.appendChild(script);
