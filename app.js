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

    class ApiLoader {
        static noteObjects = []
        static scaleObjects = []
        static currentScale = []
        
        static async fetchScales() {
            await fetch('http://localhost:3000/scales')
            .then(response => response.json())
            .then(json => this.scaleObjects = this.createScaleObjects(json));
        }
        
        static createNoteObjects(json_data) {
            return json_data.map(note => {
                return new Note(note.name, note.id, note.low_url, note.mid_url, note.high_url);
            })
        }

        static async fetchNotes() {
            await fetch('http://localhost:3000/notes')
            .then(response => response.json())
            .then(json => this.noteObjects = this.createNoteObjects(json));
            this.noteObjects.map(note => note.addNoteBuffers());
        }

        static createScaleObjects(json_data) {
            return json_data.map(scale => {
                return new Scale(scale.name, scale.id);
            })
        }

        static async loadCurrentScale(id) {
            await fetch(`http://localhost:3000/scales/${id}`)
            .then(response => response.json())
            .then(scaleNotes => {
                for (let i = 0; i < scaleNotes.length; i++) {
                    this.currentScale[i] = this.noteObjects.find_by_id(scaleNotes[i].id)
                    noteSelects[i].value = scaleNotes[i].id
                }
            });
        }

        static async saveNewScale() {
            const scaleNameInput = document.querySelector('#scale-name-input')
            data = {
                name: scaleNameInput.value,
                ...currentScale.map((note) => note.id)
            }
            config = {
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
                flashNotice(`${scale.name} Sucessfully Saved!`, true)
                resetScaleSelect(scaleNameInput)
            })
            .catch(error => {
                flashNotice(`Scale not saved: ${error.message}`, false);
                scaleNameInput.classList.add('red-border')
            });
        }
    }

    class DomUpdater {
        static load() {
            loadScreen.classList.add('hidden');
            container.classList.add('load');
        }

        static populateNoteSelects(notes) {
            for(let note of notes) {
                for (let select of noteSelects) {
                    const option = document.createElement('option')
                    option.value = note.id
                    option.innerText = note.name
                    select.append(option);
                }
            }
        }

        static updateNoteSelectsScale() {
            for (let i = 0; i < noteSelects.length; i++) {
                noteSelects[i].value = ApiLoader.currentScale[i].id 
            }
        }

        static populateScaleSelect(scales) {
            this.clearScaleSelect()
            for (let scale of scales) {
                const option = document.createElement('option')
                option.value = scale.id
                option.innerText = scale.name
                scaleSelect.append(option);
            }
        }

        static clearScaleSelect() {
            scaleSelect.childNodes.forEach(option => option.remove())
        }
    
        static populateLabels() {
            for (let i = 0; i < noteLabels.length; i++) {
                noteLabels[i].innerText = ApiLoader.currentScale[i].name
            }
        }

        static loadNewScaleForm() {
            saveScaleButton.style.display = 'none'
            formName = document.createElement('input');
            formName.id = "scale-name-input";
            formName.name = "scale-name-input";
            formName.type = "text";
            formName.placeholder = "Name Your Scale";
            saveScaleDiv.append(formName);
            submitButton = document.createElement('button')
            submitButton.innerText = "Save"
            submitButton.type = "button"
            submitButton.id = "save-scale-confirm-button"
            saveScaleDiv.append(submitButton);
            submitButton.addEventListener('click', saveNewScale)
            formName.addEventListener('keydown', function (e) {
                e.stopPropagation();
            }, false);
        }

        static async resetScaleSelect(scaleNameInput) {
            const scaleNameValue = scaleNameInput.value;
            const saveButton = document.querySelector('#save-scale-confirm-button');
            saveButton.remove();
            scaleNameInput.remove();
            const button = document.createElement('button');
            button.type = 'button';
            button.id = 'save-scale-button';
            button.innerText = 'Save This Scale';
            saveScaleDiv.append(button);
            button.addEventListener('click', loadForm);
    
            scaleSelect.childNodes.forEach(node => node.remove())
            await ApiLoader.fetchScales();
            loadScale(scaleObjects.find_by_name(scaleNameValue).id)
        }

        static flashNotice(message, success) {
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

    class Performer {
        static play(audioBuffer) {
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.start();
        }
    
        static createRipple(index, velocity) {
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

    (async function initialLoad() {
        await ApiLoader.fetchNotes();
        DomUpdater.populateNoteSelects(ApiLoader.noteObjects);
        await ApiLoader.fetchScales();
        DomUpdater.populateScaleSelect(ApiLoader.scaleObjects);
        await ApiLoader.loadCurrentScale(1);
        DomUpdater.populateLabels();
        DomUpdater.load()
    })()
    

    //SWITCHING SCALES AND SAMPLES
    
    scaleSelect.addEventListener('change', async function() {
        await ApiLoader.loadCurrentScale(scaleSelect.value)
        DomUpdater.updateNoteSelectsScale()
        DomUpdater.populateLabels()
    });

    for (let select of noteSelects) {
        select.addEventListener('change', function(e) {
            let noteIndex = parseInt(e.target.id.slice(4)) - 1;
            let note = ApiLoader.noteObjects.find_by_id(parseInt(e.target.value))
            ApiLoader.currentScale[noteIndex] = note
            DomUpdater.populateLabels();
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
    const saveScaleDiv = document.querySelector('#save-scale-div')

    saveScaleButton.addEventListener('click', DomUpdater.loadNewScaleForm);
        


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
                    ApiLoader.currentScale[index].lowBuffer, 
                    ApiLoader.currentScale[index].midBuffer, 
                    ApiLoader.currentScale[index].highBuffer
                ];
                const velocities = ['low', 'mid', 'high'];
                Performer.play(buffers[i]);
                Performer.createRipple(index, velocities[i]);
                break;
            }
        }
    });

    for (let label of noteLabels) {
        label.addEventListener('click', function(e) {
            const noteIndex = parseInt(e.target.id.slice(11)) - 1;
            Performer.play(ApiLoader.currentScale[noteIndex].midBuffer);
            Performer.createRipple(noteIndex, 'mid');
        });
    }
})