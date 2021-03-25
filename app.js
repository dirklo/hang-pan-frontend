document.addEventListener("DOMContentLoaded", function() {
    class Note {
        constructor(name, low_url, mid_url, high_url) {
            this.name = name
            this.low_url = low_url
            this.mid_url = mid_url
            this.high_url = high_url
        }
    }

    const noteList = document.querySelector("#note_list");
    let noteOneLowBuffer, noteTwoLowBuffer, noteThreeLowBuffer, noteFourLowBuffer, noteFiveLowBuffer, noteSixLowBuffer, noteSevenLowBuffer, noteEightLowBuffer;
    let noteOneMidBuffer, noteTwoMidBuffer, noteThreeMidBuffer, noteFourMidBuffer, noteFiveMidBuffer, noteSixMidBuffer, noteSevenMidBuffer, noteEightMidBuffer;
    let noteOneHighBuffer, noteTwoHighBuffer, noteThreeHighBuffer, noteFourHighBuffer, noteFiveHighBuffer, noteSixLHighuffer, noteSevenHighBuffer, noteEightHighBuffer;
    const context = new AudioContext();

    function createNoteObjects(json_data) {
        return json_data.map((note) => {
            return new Note(note.name, note.low_url, note.mid_url, note.high_url);
        })
    }

    function initialLoad() {
        fetch('http://localhost:3000/notes')
        .then(response => response.json())
        .then((json) => {
            const noteObjects = createNoteObjects(json)
            setBuffers(noteObjects)
        })
    }

    function setBuffers(noteObjects) {
        loadNote(noteObjects[0].low_url, noteOneLowBuffer);
        loadNote(noteObjects[1].low_url, noteTwoLowBuffer);
        loadNote(noteObjects[2].low_url, noteThreeLowBuffer);
        loadNote(noteObjects[3].low_url, noteFourLowBuffer);
        loadNote(noteObjects[4].low_url, noteFiveLowBuffer);
        loadNote(noteObjects[5].low_url, noteSixLowBuffer);
        loadNote(noteObjects[6].low_url, noteSevenLowBuffer);
        loadNote(noteObjects[7].low_url, noteEightLowBuffer);
    }
    
    initialLoad()


    function loadNote(url, target) {
        window.fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            target = audioBuffer;
        });
    }
        
    document.addEventListener('keydown', function(e) {
        if (e.key === 'z') {
            console.log("note One")
            play(noteOneLowBuffer)
        } else if (e.key === 'x') {
            play(noteTwoLowBuffer)
        } else if (e.key === 'c') {
            play(noteThreeLowBuffer)
        } else if (e.key === 'v') {
            play(noteFourLowBuffer)
        } else if (e.key === 'm') {
            play(noteFiveLowBuffer)
        } else if (e.key === ',') {
            play(noteSixLowBuffer)
        } else if (e.key === '.') {
            play(noteSevenLowBuffer)
        } else if (e.key === '/') {
            play(noteEightLowBuffer)
        }
    });

    function play(audioBuffer) {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start();
      }
})