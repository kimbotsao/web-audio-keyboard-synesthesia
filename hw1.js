
document.addEventListener("DOMContentLoaded", function(event) {

    // defaults
    var waveform = 'triangle'
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var rgb = new Array(255, 255, 255)

    const keyboardFrequencyMap = {
    '90': 261.625565300598634,  //Z - C 6
    '83': 277.182630976872096, //S - C# 22
    '88': 293.664767917407560,  //X - D 38
    '68': 311.126983722080910, //D - D# 56
    '67': 329.627556912869929,  //C - E 74
    '86': 349.228231433003884,  //V - F 94
    '71': 369.994422711634398, //G - F# 114
    '66': 391.995435981749294,  //B - G 136
    '72': 415.304697579945138, //H - G# 160
    '78': 440.000000000000000,  //N - A 185
    '74': 466.163761518089916, //J - A# 211
    '77': 493.883301256124111,  //M - B 238
    '81': 523.251130601197269,  //Q - C 13
    '50': 554.365261953744192, //2 - C# 44
    '87': 587.329535834815120,  //W - D 77
    '51': 622.253967444161821, //3 - D# 112
    '69': 659.255113825739859,  //E - E 149
    '82': 698.456462866007768,  //R - F 188
    '53': 739.988845423268797, //5 - F# 229
    '84': 783.990871963498588,  //T - G 18
    '54': 830.609395159890277, //6 - G# 65
    '89': 880.000000000000000,  //Y - A 115
    '55': 932.327523036179832, //7 - A# 167
    '85': 987.766602512248223,  //U - B 222
    }

    // adjust to user's waveform chocie
    const waveformControl = document.getElementById('waveform')
    waveformControl.addEventListener('change', function(event) {
        waveform = event.target.value
    });

    // globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
    // globalGain.connect(audioCtx.destination);

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {}
    gainNodes = {}

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
        }

        // color changes
        // r[0] <-- r[1], r[1] <-- r[2], r[2] <-- keyboardFrequencyMap[key] mod
        console.log("current " + rgb)
        rgb[0] = rgb[1]
        rgb[1] = rgb[2]
        rgb[2] = Math.trunc(keyboardFrequencyMap[key]) % 255
        console.log("after change " + rgb)

        document.body.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            var val = gainNodes[key].gain.value;
            // end of ADSR envelope
            gainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime)
            gainNodes[key].gain.setValueAtTime(val, audioCtx.currentTime)
            gainNodes[key].gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .1); //R
            // allow gain to decrease first
            setTimeout(function(){
               activeOscillators[key].stop();
               delete activeOscillators[key];
               delete gainNodes[key];
            }, 70)
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.type = waveform

        const gainNode = audioCtx.createGain();
        osc.connect(gainNode).connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        osc.start();

        // the rest of the envelope can be hard coded
        gainNode.gain.linearRampToValueAtTime(.2, audioCtx.currentTime + .1);
        gainNode.gain.setValueAtTime(.2,audioCtx.currentTime+.1);
        gainNode.gain.linearRampToValueAtTime(.1, audioCtx.currentTime + .5);

        activeOscillators[key] = osc
        gainNodes[key] = gainNode;
    }
});