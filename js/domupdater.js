const domUpdater = {
    populateNoteSelects: () => {
        for(let note of noteObjects) {
            for (let select of noteSelects) {
                const option = document.createElement('option')
                option.value = note.id
                option.innerText = note.name
                select.append(option);
            }
        }
    },

    setNoteSelects: () => {
        for (let i = 0; i < noteSelects.length; i++) {
            noteSelects[i].value = currentScale[i].id 
        }
    },

    populateScaleSelect: () => {
        for (let scale of scaleObjects) {
            const option = document.createElement('option')
            option.value = scale.id
            option.innerText = scale.name
            scaleSelect.append(option);
        }
    },

    clearSelect: (select) => {
        for(let i = select.length - 1; i >= 0; i--) {
            scaleSelect.childNodes[i].remove()
        }
    },

    setNoteLabels: () => {
        for (let i = 0; i < noteLabels.length; i++) {
            noteLabels[i].innerText = currentScale[i].name
        }
    },

    showForm: function() {
        saveScaleButton.style.display = 'none'
        scaleNameInput.style.display = 'block'
        confirmDiv.style.display = 'block'
    },

    hideForm: function() {
        saveScaleButton.style.display = 'block'
        scaleNameInput.style.display = 'none'
        confirmDiv.style.display = 'none'
    },

    flashNotice: (message, success) => {
        notice.innerText = message;
        let status
        success ? status = 'flash-success' : status = 'flash-alert';
        notice.classList.add(`${status}`);
        notice.classList.add('expand');

        setTimeout(function() {
            notice.classList.remove('expand')
            notice.innerText = ""
        }, 5000);
    },

    showInstructions: function() {
        overlay.classList.add('overlay-visible');
        overlay.addEventListener('click', this.removeInstructions);
    },

    removeInstructions: function() {
        overlay.classList.remove('overlay-visible');
    }
}
