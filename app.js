document.addEventListener("DOMContentLoaded", function() {
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
    
    //INITIAL LOAD
    const noteSelectsContainer = document.querySelector('#note-selects-container')
    const noteSelects = document.querySelector('#note-selects-container').querySelectorAll('select');
    const noteSelectsTitle = document.querySelector('#note-selects-title')
    const arrow = document.querySelector(".arrow")
    const scaleSelect = document.querySelector('#scale');
    const noteLabels = document.querySelectorAll('.note-label')
    const loadScreen = document.querySelector('#load-screen')
    const container = document.querySelector('#container')
    const context = new AudioContext();

    const apiLoader = {
        noteObjects: [],
        scaleObjects: [],
        currentScale: [],
        
        fetchScales: async function() {
            await fetch('http://localhost:3000/scales')
            .then(response => response.json())
            .then(json => this.scaleObjects = this.createScaleObjects(json));
        },
    
        createNoteObjects: (json_data) => {
            return json_data.map(note => {
                return new Note(note.name, note.id, note.low_url, note.mid_url, note.high_url);
            })
        },
    
        fetchNotes: async function() {
            await fetch('http://localhost:3000/notes')
            .then(response => response.json())
            .then(json => {
                this.noteObjects = this.createNoteObjects(json)
            });
            this.noteObjects.map(note => note.addNoteBuffers());
        },
    
        createScaleObjects: (json_data) => {
            return json_data.map(scale => {
                return new Scale(scale.name, scale.id);
            })
        },
    
        loadCurrentScale: async function(id) {
            await fetch(`http://localhost:3000/scales/${id}`)
            .then(response => response.json())
            .then(scaleNotes => {
                for (let i = 0; i < scaleNotes.length; i++) {
                    this.currentScale[i] = this.noteObjects.find_by_id(scaleNotes[i].id)
                    noteSelects[i].value = scaleNotes[i].id
                }
            });
            scaleSelect.value = id
        },
    
        saveNewScale: async function() {
            const data = {
                name: scaleNameInput.value,
                ...this.currentScale.map((note) => note.id)
            }
            const config = {
                method: "post",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            }
    
            fetch('http://localhost:3000/scales', config)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw error })
                } else {
                    return response.json();
                }
            })
            .then(scale => {
                DomUpdater.flashNotice(`${scale.name} Sucessfully Saved!`, true)
                this.fetchScales()
                DomUpdater.resetNewScaleInput(scale.name)
            })
            .catch(error => {
                DomUpdater.flashNotice(`Scale not saved: ${error.message}`, false);
                scaleNameInput.classList.add('red-border')
            });
        }
    }

    const domUpdater = {
        load: () => {
            loadScreen.classList.add('hidden');
            container.classList.add('load');
        },
    
        populateNoteSelects: () => {
            for(let note of apiLoader.noteObjects) {
                for (let select of noteSelects) {
                    const option = document.createElement('option')
                    option.value = note.id
                    option.innerText = note.name
                    select.append(option);
                }
            }
        },
    
        updateNoteSelectsScale: () => {
            for (let i = 0; i < noteSelects.length; i++) {
                noteSelects[i].value = apiLoader.currentScale[i].id 
            }
        },
    
        populateScaleSelect: function() {
            this.clearScaleSelect()
            for (let scale of apiLoader.scaleObjects) {
                const option = document.createElement('option')
                option.value = scale.id
                option.innerText = scale.name
                scaleSelect.append(option);
            }
        },
    
        clearScaleSelect: () => {
            scaleSelect.childNodes.forEach(option => option.remove())
        },
    
        populateLabels: () => {
            for (let i = 0; i < noteLabels.length; i++) {
                noteLabels[i].innerText = apiLoader.currentScale[i].name
            }
        },
    
        loadNewScaleForm: () => {
            saveScaleButton.style.display = 'none'
            scaleNameInput.style.display = 'block'
            saveScaleConfirmButton.style.display = 'block'
        },
    
        resetNewScaleInput: async (newScaleName) => {
            saveScaleConfirmButton.style.display = 'none';
            scaleNameInput.style.display = 'none';
            saveScaleButton.style.display = 'block';
            await apiLoader.fetchScales();
            this.populateScaleSelect()
            apiLoader.loadCurrentScale(apiLoader.scaleObjects.find_by_name(newScaleName).id)
        },
    
        flashNotice: (message, success) => {
            const notice = document.querySelector('#flash-notice-div');
            notice.innerText = message;
            let status
            success ? status = 'flash-success' : status = 'flash-alert';
            notice.classList.add(`${status}`);
            notice.classList.add('expand');
    
            setTimeout(function() {
                notice.classList.remove('expand')
                notice.innerText = ""
            }, 5000);
        }
    }

    const performer = {
        play: (audioBuffer) => {
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.start();
        },
    
        createRipple: (index, velocity) => {
            const circle = document.createElement('div');
            noteLabels[index].appendChild(circle);
            circle.style.width = '10px';
            circle.style.height = '10px';
            circle.classList.add('ripple');
            
            let color
            switch(velocity) {
                case 'mid':
                    color = 'rgba(0, 255, 255, 0.7)';
                    break;
                case 'high':
                    color = 'rgba(255, 0, 0, 0.7)';
                    break;
                default: 
                    color = 'rgba(255, 255, 255, 0.7)';
            }
            circle.style.backgroundColor = color;
            
            setTimeout(function (){
                circle.remove()
            }, 1000)
        }
    }
    

    Array.prototype.find_by_id = function(searchId) {
        return this.find((item) => item.id === searchId)
    }

    Array.prototype.find_by_name = function(searchName) {
        return this.find((item) => item.name === searchName)
    }

    async function initialLoad() {
        await apiLoader.fetchNotes();
        domUpdater.populateNoteSelects();
        await apiLoader.fetchScales();
        domUpdater.populateScaleSelect();
        await apiLoader.loadCurrentScale(1);
        domUpdater.populateLabels();
        domUpdater.load()
    }
    
    initialLoad()

    //SWITCHING SCALES AND SAMPLES
    
    scaleSelect.addEventListener('change', async function() {
        await apiLoader.loadCurrentScale(scaleSelect.value)
        domUpdater.updateNoteSelectsScale()
        domUpdater.populateLabels()
    });

    for (let select of noteSelects) {
        select.addEventListener('change', function(e) {
            let noteIndex = parseInt(e.target.id.slice(4)) - 1;
            let note = apiLoader.noteObjects.find_by_id(parseInt(e.target.value))
            apiLoader.currentScale[noteIndex] = note
            domUpdater.populateLabels();
        });
        select.onclick = function(e) {
            e.stopPropagation();
        }
    };

    noteSelects.forEach(select => {
        select.onclick = (e) => e.stopPropagation()
    })

    noteSelectsContainer.onclick = (e) => e.stopPropagation()

    noteSelectsTitle.addEventListener('click', function (e) {
        e.stopPropagation()
        noteSelectsContainer.classList.toggle('select-expand');
        arrow.classList.toggle('rotate');
    })

    document.addEventListener('click', function(e) {
        if (noteSelectsContainer.className === 'select-expand') {
            noteSelectsTitle.click();
        }
    })



    // SAVING A SCALE
    const saveScaleButton = document.querySelector('#save-scale-button')
    const scaleNameInput = document.querySelector('#scale-name-input')
    const saveScaleConfirmButton = document.querySelector('#save-scale-confirm-button')

    saveScaleButton.addEventListener('click', domUpdater.loadNewScaleForm);
    saveScaleConfirmButton.addEventListener('click', apiLoader.saveNewScale.bind(apiLoader))
    scaleNameInput.addEventListener('keydown', function (e) {
        e.stopPropagation();
    }, false);
        


    // PERFORMANCE
    document.addEventListener('keydown', function(e) {
        const keyZones = [
                ['z', 'x', 'c', 'v', 'n', 'm', ',', '.', '/'],
                ['a', 's', 'd', 'f', 'h', 'j', 'k', 'l', ';'],
                ['q', 'w', 'e', 'r', 'y', 'u', 'i', 'o', 'p']
        ]
        for (let i = 0; i < keyZones.length; i++) {
            if (keyZones[i].includes(e.key)) {
                const index = keyZones[i].indexOf(e.key);
                const buffers = [
                    apiLoader.currentScale[index].lowBuffer, 
                    apiLoader.currentScale[index].midBuffer, 
                    apiLoader.currentScale[index].highBuffer
                ];
                const velocities = ['low', 'mid', 'high'];
                performer.play(buffers[i]);
                performer.createRipple(index, velocities[i]);
                break;
            }
        }
    });

    for (let label of noteLabels) {
        label.addEventListener('click', function(e) {
            const noteIndex = parseInt(e.target.id.slice(11)) - 1;
            performer.play(apiLoader.currentScale[noteIndex].midBuffer);
            performer.createRipple(noteIndex, 'mid');
        });
    }
})