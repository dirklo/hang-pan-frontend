const apiLoader = {
    fetchScales: function() {
        return fetch('https://hang-pan.herokuapp.com/scales')
        .then(response => response.json())
        .then(json => scaleObjects = this.createScaleObjects(json));
    },

    createNoteObjects: (json_data) => {
        return json_data.map(note => {
            return new Note(note.name, note.id, note.low_url, note.mid_url, note.high_url);
        })
    },

    fetchNotes: async function() {
        await fetch('https://hang-pan.herokuapp.com/notes')
        .then(response => response.json())
        .then(json => noteObjects = this.createNoteObjects(json));
        await noteObjects.map(note => note.addNoteBuffers());
    },

    fetchNoteBuffers: function () {
        const urls = [this.low_url, this.mid_url, this.high_url]
        for (let i = 0; i < urls.length; i++) {
            fetch(urls[i])
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => context.decodeAudioData(arrayBuffer, (buffer) => this.buffers[i] = buffer, (e) => console.log(e)))
        }
    }, 

    createScaleObjects: (json_data) => {
        return json_data.map(scale => {
            return new Scale(scale.name, scale.id);
        })
    },

    loadCurrentScale: function(id) {
        return fetch(`https://hang-pan.herokuapp.com/scales/${id}`)
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

        return await fetch('https://hang-pan.herokuapp.com/scales', config)
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
    },

    loadReverbs: async function() {
        const urls = [
            'https://res.cloudinary.com/dn4l2f1ea/video/upload/v1617632408/hang-pan/Impulse%20Responses/room_bopa42.mp3',
            'https://res.cloudinary.com/dn4l2f1ea/video/upload/v1617632408/hang-pan/Impulse%20Responses/hall_zdubir.mp3',
            'https://res.cloudinary.com/dn4l2f1ea/video/upload/v1617632408/hang-pan/Impulse%20Responses/outdoor_b9gvkp.mp3'
        ]
        await Promise.all(urls.map(url => 
            fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => context.decodeAudioData(arrayBuffer, (buffer) => reverbBuffers.push(buffer), (e) => console.log(e)))
        ));
        reverb.buffer = reverbBuffers[0];
    }
}