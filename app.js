document.addEventListener("DOMContentLoaded", function() {
    class Note {
        constructor(name, low_url, mid_url, high_url) {
            this.name = name
            this.low_url = low_url
            this.mid_url = mid_url
            this.high_url = high_url
        }
    }

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
    
    function setBuffers(noteObjects){
        loadNotes(noteObjects);
    }
    
    initialLoad()
    
    let lowNotes = [];
    let midNotes = [];
    let highNotes = [];
    function loadNotes(noteObjects) {
        for (let i = 0; i < noteObjects.length; i++) {
            fetch(noteObjects[i].low_url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                lowNotes[i] = audioBuffer;
            });
        }
        for (let i = 0; i < noteObjects.length; i++) {
            fetch(noteObjects[i].mid_url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                midNotes[i] = audioBuffer;
            });
        }
        for (let i = 0; i < noteObjects.length; i++) {
            fetch(noteObjects[i].high_url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                highNotes[i] = audioBuffer;
            });
        }
    }
        
    document.addEventListener('keydown', function(e) {
        if (e.key === 'z') {
            play(lowNotes[0])
        } else if (e.key === 'x') {
            play(lowNotes[1])
        } else if (e.key === 'c') {
            play(lowNotes[2])
        } else if (e.key === 'v') {
            play(lowNotes[3])
        } else if (e.key === 'm') {
            play(lowNotes[4])
        } else if (e.key === ',') {
            play(lowNotes[5])
        } else if (e.key === '.') {
            play(lowNotes[6])
        } else if (e.key === '/') {
            play(lowNotes[7])
        } else if (e.key === 'a') {
            play(midNotes[0])
        } else if (e.key === 's') {
            play(midNotes[1])
        } else if (e.key === 'd') {
            play(midNotes[2])
        } else if (e.key === 'f') {
            play(midNotes[3])
        } else if (e.key === 'j') {
            play(midNotes[4])
        } else if (e.key === 'k') {
            play(midNotes[5])
        } else if (e.key === 'l') {
            play(midNotes[6])
        } else if (e.key === ';') {
            play(midNotes[7])
        } else if (e.key === 'q') {
            play(highNotes[0])
        } else if (e.key === 'w') {
            play(highNotes[1])
        } else if (e.key === 'e') {
            play(highNotes[2])
        } else if (e.key === 'r') {
            play(highNotes[3])
        } else if (e.key === 'u') {
            play(highNotes[4])
        } else if (e.key === 'i') {
            play(highNotes[5])
        } else if (e.key === 'o') {
            play(highNotes[6])
        } else if (e.key === 'p') {
            play(highNotes[7])
        }
    });

    function play(audioBuffer) {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start();
      }
})