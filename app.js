document.addEventListener("DOMContentLoaded", function() {
    //DECLARING CLASSES
    class Note {
        constructor(name, id, low_url, mid_url, high_url) {
            this.name = name;
            this.id = id;
            this.low_url = low_url;
            this.mid_url = mid_url;
            this.high_url = high_url;
        }

        async addNoteBuffers() {
            const urls = [this.low_url, this.mid_url, this.high_url]
            const [lowBuffer, midBuffer, highBuffer] = await Promise.all(urls.map(url => 
                fetch(url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
            ));
            this.lowBuffer = lowBuffer
            this.midBuffer = midBuffer
            this.highBuffer = highBuffer
            return this
        }
    }

    class Scale {
        constructor(name, id) {
            this.name = name;
            this.id = id;
        }
    }

    Array.prototype.find_by_id = function(searchId) {
        return this.find((item) => item.id === searchId)
    }

    //INITIAL DOM AND OBJECT MANAGEMENT

    const context = new AudioContext();
    const noteSelects = document.querySelector('#notes-select-div').querySelectorAll('select');
    const scaleSelect = document.querySelector('#scale');
    const noteLabels = document.querySelectorAll('.note-label')
    const loadScreen = document.querySelector('#load-screen')
    const container = document.querySelector('.container')
    let noteObjects = []
    let scaleObjects = []
    let currentScale = [] 
    
    function createNoteObjects(json_data) {
        return json_data.map((note) => {
            return new Note(note.name, note.id, note.low_url, note.mid_url, note.high_url);
        })
    }

    function createScaleObjects(json_data) {
        return json_data.map((scale) => {
            return new Scale(scale.name, scale.id);
        })
    }
    
    function populateNoteSelects(notes) {
        for(let note of notes) {
            for (let select of noteSelects) {
                const option = document.createElement('option')
                option.value = note.id
                option.innerText = note.name
                select.append(option);
            }
        }
    }

    function populateScaleSelect(scales) {
        for (let scale of scales) {
            const option = document.createElement('option')
            option.value = scale.id
            option.innerText = scale.name
            scaleSelect.append(option);
        }
    }

    function populateLabels() {
        for (let i = 0; i < noteLabels.length; i++) {
            noteLabels[i].innerText = currentScale[i].name
        }
    }

    async function initialLoad() {
        await fetch('http://localhost:3000/notes')
        .then(response => response.json())
        .then((json) => {
            noteObjects = createNoteObjects(json);
        })
        await noteObjects.map((note) => {
            return note.addNoteBuffers();
        })
        await populateNoteSelects(noteObjects);

        await fetch('http://localhost:3000/scales')
        .then(response => response.json())
        .then((json) => {
            scaleObjects = createScaleObjects(json);
        })
        populateScaleSelect(scaleObjects);
        loadScale(1);
        loadScreen.classList.add('hidden');
        container.classList.add('load');
    }
    
    initialLoad()
    

    
    //SWITCHING SCALES AND SAMPLES
    
    function loadScale(id) {
        fetch(`http://localhost:3000/scales/${id}`)
        .then(response => response.json())
        .then(scaleNotes => {
            for (let i = 0; i < scaleNotes.length; i++) {
                let note = noteObjects.find_by_id(scaleNotes[i].id)
                currentScale[i] = note
                updateNote(note, i)
            }
            populateLabels()
        })
    }

    function updateNote(note, noteIndex) {
        noteSelects[noteIndex].value = note.id
    }
    
    scaleSelect.addEventListener('change', function() {
        loadScale(scaleSelect.value)
    });

    for (let select of noteSelects) {
        select.addEventListener('change', function(e) {
            let noteIndex = parseInt(e.target.id.slice(4)) - 1;
            let note = noteObjects.find_by_id(parseInt(e.target.value))
            currentScale[noteIndex] = note
            populateLabels()
        })
    };



    // SAVING A SCALE
    const saveScaleButton = document.querySelector('#save-scale-button')
    const saveScaleDiv = document.querySelector('#save-scale-div')

    saveScaleButton.addEventListener('click', loadForm);
        
    function loadForm() {
        saveScaleButton.style.display = 'none'
        formName = document.createElement('input');
        formName.id = "scale-name";
        formName.name = "scale-name";
        formName.type = "text";
        saveScaleDiv.append(formName);
        submitButton = document.createElement('button')
        submitButton.innerText = "Save New Scale"
        submitButton.type = "button"
        saveScaleDiv.append(submitButton);
        submitButton.addEventListener('click', saveNewScale)
    }

    function saveNewScale() {
        const scaleName = document.querySelector('#scale-name')
        data = {
            name: scaleName.value,
            ...noteObjects.map((note) => note.id)
        }
        console.log(data)
        config = {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        }

        fetch('http://localhost:3000/scales', config)
        .then(response => console.log(response))
    }

    // PERFORMANCE
        
    document.addEventListener('keydown', function(e) {
        const lowKeys = ['z', 'x', 'c', 'v', 'n', 'm', ',', '.', '/']
        for (let i = 0; i < currentScale.length; i++){
            if (e.key === lowKeys[i]){
                play(currentScale[i].lowBuffer)
            }
        }
        const midKeys = ['a', 's', 'd', 'f', 'h', 'j', 'k', 'l', ';']
        for (let i = 0; i < currentScale.length; i++){
            if (e.key === midKeys[i]){
                play(currentScale[i].midBuffer)
            }
        }
        const highKeys = ['q', 'w', 'e', 'r', 'y', 'u', 'i', 'o', 'p']
        for (let i = 0; i < currentScale.length; i++){
            if (e.key === highKeys[i]){
                play(currentScale[i].highBuffer)
            }
        }
    });

    function play(audioBuffer) {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start();
      }
})