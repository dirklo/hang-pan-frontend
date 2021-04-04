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