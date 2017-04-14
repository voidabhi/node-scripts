var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');
 
getUserMedia({ video: false, audio: true })
  .then(function(stream) {
    var micStream = new MicrophoneStream(stream);
 
    // get Buffers (Essentially a Uint8Array DataView of the same Float32 values) 
    micStream.on('data', function(chunk) {
      // Optionally convert the Buffer back into a Float32Array 
      // (This actually just creates a new DataView - the underlying audio data is not copied or modified.) 
      var raw = MicrophoneStream.toRaw(chunk)
      //... 
 
      // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers 
     });
 
    // or pipe it to another stream 
    micStream.pipe(/*...*/);
 
    // It also emits a format event with various details (frequency, channels, etc) 
    micStream.on('format', function(format) {
      console.log(format);
    });
 
    // Stop when ready 
    document.getElementById('my-stop-button').onclick = function() {
      micStream.stop();
    };
  }).catch(function(error) {
    console.log(error);
  });
