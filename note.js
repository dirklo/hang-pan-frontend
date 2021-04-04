class Note {
    constructor(name, id, low_url, mid_url, high_url) {
        this.name = name;
        this.id = id;
        this.low_url = low_url;
        this.mid_url = mid_url;
        this.high_url = high_url;
    };

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
    };
};