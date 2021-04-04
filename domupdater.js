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
        select.childNodes.forEach(option => option.remove())
    },

    setNoteLabels: () => {
        for (let i = 0; i < noteLabels.length; i++) {
            noteLabels[i].innerText = currentScale[i].name
        }
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


