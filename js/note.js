class Note {
    constructor(name, id, low_url, mid_url, high_url) {
        this.name = name;
        this.id = id;
        this.low_url = low_url;
        this.mid_url = mid_url;
        this.high_url = high_url;
    };


    addNoteBuffers() {
        this.buffers = []
        apiLoader.fetchNoteBuffers.call(this)
    }
};