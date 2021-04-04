const noteSelectsContainer = document.querySelector('#note-selects-container')
const noteSelects = document.querySelector('#note-selects-container').querySelectorAll('select');
const noteSelectsTitle = document.querySelector('#note-selects-title')
const arrow = document.querySelector(".arrow")
const scaleSelect = document.querySelector('#scale');
const noteLabels = document.querySelectorAll('.note-label')
const loadScreen = document.querySelector('#load-screen')
const container = document.querySelector('#container')
const context = new AudioContext();
let noteObjects = [];
let scaleObjects = [];
let currentScale = [];

async function initialLoad() {
    await apiLoader.fetchNotes();
    domUpdater.populateNoteSelects();
    
    await apiLoader.fetchScales();
    domUpdater.populateScaleSelect();
    
    await apiLoader.loadCurrentScale(1);
    domUpdater.setNoteSelects();
    domUpdater.setNoteLabels();
    
    loadScreen.classList.add('hidden');
    container.classList.add('load');
}

initialLoad()

//SWITCHING SCALES AND SAMPLES

scaleSelect.addEventListener('change', async function() {
    await apiLoader.loadCurrentScale(scaleSelect.value)
    domUpdater.setNoteSelects()
    domUpdater.setNoteLabels()
});

for (let select of noteSelects) {
    select.addEventListener('change', function(e) {
        let noteIndex = parseInt(e.target.id.slice(4)) - 1;
        let note = noteObjects.find_by_id(parseInt(e.target.value))
        currentScale[noteIndex] = note
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

scaleNameInput.addEventListener('keydown', function (e) {
    e.stopPropagation();
}, false);

saveScaleButton.addEventListener('click', function() {
    saveScaleButton.style.display = 'none'
    scaleNameInput.style.display = 'block'
    saveScaleConfirmButton.style.display = 'block'
});

saveScaleConfirmButton.addEventListener('click', async function() {
    saveResult = await apiLoader.saveNewScale();
    debugger;
    if (saveResult.status === "ok") {
        scaleNameInput.classList.remove('red-border')
        domUpdater.flashNotice(`${saveResult.data.name} Sucessfully Saved!`, true)
        await apiLoader.fetchScales()
        domUpdater.clearSelect(scaleSelect)
        domUpdater.populateScaleSelect()
        scaleSelect.value = saveResult.data.id
        saveScaleButton.style.display = 'block'
        scaleNameInput.style.display = 'none'
        saveScaleConfirmButton.style.display = 'none'
    } else {
        domUpdater.flashNotice(`Scale not saved: ${saveResult.data.message}`, false);
        scaleNameInput.classList.add('red-border')
    }
});

    


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
                currentScale[index].lowBuffer, 
                currentScale[index].midBuffer, 
                currentScale[index].highBuffer
            ];
            const velocities = ['low', 'mid', 'high'];
            performer.play(buffers[i], context);
            performer.createRipple(index, velocities[i]);
            break;
        }
    }
});

for (let label of noteLabels) {
    label.addEventListener('click', function(e) {
        const noteIndex = parseInt(e.target.id.slice(11)) - 1;
        performer.play(apiLoader.currentScale[noteIndex].midBuffer, context);
        performer.createRipple(noteIndex, 'mid');
    });
}