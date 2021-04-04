const apiLoader = {
    fetchScales: async function() {
        return await fetch('http://localhost:3000/scales')
        .then(response => response.json())
        .then(json => scaleObjects = this.createScaleObjects(json));
    },

    createNoteObjects: (json_data) => {
        return json_data.map(note => {
            return new Note(note.name, note.id, note.low_url, note.mid_url, note.high_url);
        })
    },

    fetchNotes: async function() {
        await fetch('http://localhost:3000/notes')
        .then(response => response.json())
        .then(json => noteObjects = this.createNoteObjects(json));
        noteObjects.map(note => note.addNoteBuffers());
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
                currentScale[i] = noteObjects.find_by_id(scaleNotes[i].id)
            }
        });
    },

    saveNewScale: async function() {
        const data = {
            name: scaleNameInput.value,
            ...currentScale.map((note) => note.id)
        }
        const config = {
            method: "post",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        }

        return await fetch('http://localhost:3000/scales', config)
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw error })
            } else {
                return response.json();
            }
        })
        .then(scale => {
            return {status: "ok", data: scale}
        })
        .catch(error => {
            return {status: "error", data: error}
        });
    }
}