const loadScreen = document.querySelector('#load-screen');
const container = document.querySelector('#container');

let noteObjects = [];
let scaleObjects = [];
let currentScale = [];
let reverbBuffers = [];

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




//DROPDOWNS
const noteSelectsContainer = document.querySelector('#note-selects-container');
const noteSelects = document.querySelector('#note-selects-container').querySelectorAll('select');
const noteSelectsTitle = document.querySelector('#note-selects-title');
const notesArrow = document.querySelector("#notes-arrow");

const effectsContainer = document.querySelector('#effects-container');
const effectsTitle = document.querySelector('#effects-title');
const effectsArrow = document.querySelector("#effects-arrow");

const scaleSelect = document.querySelector('#scale');
const noteLabels = document.querySelectorAll('.note-label');
const dropdownControls = document.querySelectorAll('.dropdown-control')

dropdownControls.forEach(control => {
    control.addEventListener('click', function (e) {
        e.stopPropagation()
        this.parentElement.classList.toggle('select-expand');
        this.children[1].classList.toggle('rotate');
    })
})

document.addEventListener('click', function(e) {
    dropdownControls.forEach(control => {
        if (control.parentElement.className === 'select-expand') {
            control.click();
        }   
    })
})

noteSelects.forEach(select => {
    select.onclick = (e) => e.stopPropagation()
})

noteSelectsContainer.onclick = (e) => e.stopPropagation()
effectsContainer.onclick = (e) => e.stopPropagation()
scaleSelect.onclick = (e) => e.stopPropagation()



//SWITCHING SCALES AND SAMPLES

scaleSelect.addEventListener('change', async function(e) {
    e.stopPropagation();
    await apiLoader.loadCurrentScale(scaleSelect.value)
    domUpdater.setNoteSelects()
    domUpdater.setNoteLabels()
});

for (let select of noteSelects) {
    select.addEventListener('change', function(e) {
        let noteIndex = parseInt(e.target.id.slice(4)) - 1;
        let note = noteObjects.find_by_id(parseInt(e.target.value))
        currentScale[noteIndex] = note
        domUpdater.setNoteLabels();
    });
    select.onclick = function(e) {
        e.stopPropagation();
    }
};


//EFFECTS
const context = new AudioContext();
const masterVolume = context.createGain();
const delay = context.createDelay();
const feedback = context.createGain();
const delayAmountGain = context.createGain();
const reverb = context.createConvolver();
const reverbWetGain = context.createGain();
const reverbDryGain = context.createGain();
const volumeController = document.querySelector('#volume-controller')
const delayTimeController = document.querySelector('#delay-time-controller')
const delayFeedbackController = document.querySelector('#delay-feedback-controller')
const delayAmountController = document.querySelector('#delay-amount-controller')
const reverbDryController = document.querySelector('#reverb-dry-controller')
const reverbWetController = document.querySelector('#reverb-wet-controller')
const reverbSelect = document.querySelector('#reverb-select')

effectsControls.connectEffects()
apiLoader.loadReverbs()

volumeController.addEventListener('input', effectsControls.changeVolume)
delayTimeController.addEventListener('input', effectsControls.changeDelayTime)
delayFeedbackController.addEventListener('input', effectsControls.changeDelayFeedback)
delayAmountController.addEventListener('input', effectsControls.changeDelayAmount)
reverbDryController.addEventListener('input', effectsControls.changeReverbDryAmount)
reverbWetController.addEventListener('input', effectsControls.changeReverbWetAmount)
reverbSelect.addEventListener('change', effectsControls.changeReverb)




// SAVING A SCALE
const saveScaleButton = document.querySelector('#save-scale-button')
const scaleNameInput = document.querySelector('#scale-name-input')
const saveScaleConfirmButton = document.querySelector('#save-scale-confirm-button')

scaleNameInput.addEventListener('keydown', function (e) {
    e.stopPropagation();
}, false);

saveScaleButton.addEventListener('click', function(e) {
    e.stopPropagation()
    saveScaleButton.style.display = 'none'
    scaleNameInput.style.display = 'block'
    saveScaleConfirmButton.style.display = 'block'
});

saveScaleConfirmButton.addEventListener('click', async function(e) {
    e.stopPropagation()
    saveResult = await apiLoader.saveNewScale();
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
        e.stopPropagation()
        const noteIndex = parseInt(e.target.id.slice(11)) - 1;
        performer.play(currentScale[noteIndex].midBuffer);
        performer.createRipple(noteIndex, 'mid');
    });
}