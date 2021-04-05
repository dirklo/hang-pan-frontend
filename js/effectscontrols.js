const effectsControls = {
    connectEffects: function() {
        delayAmountGain.connect(delay)
        delay.connect(feedback)
        feedback.connect(delay)
        delay.connect(reverbDryGain)
        delay.connect(reverbWetGain)
        reverbWetGain.connect(reverb)
        reverbDryGain.connect(masterVolume)
        reverb.connect(masterVolume)
        masterVolume.connect(context.destination)

        delay.delayTime.value = 0;
        delayAmountGain.gain.value = 0;
        feedback.gain.value = 0;
        reverbWetGain.gain.value = 0;
        reverbDryGain.gain.value = 1;
    },
    
    changeVolume: function() {
        masterVolume.gain.value = this.value;
    },
    
    changeDelayTime: function() {
        delay.delayTime.value = this.value;
    },

    changeDelayFeedback: function() {
        feedback.gain.value = this.value;
    },

    changeDelayAmount: function() {
        delayAmountGain.gain.value = this.value;
    },

    changeReverbDryAmount: function() {
        reverbDryGain.gain.value = this.value;
    },

    changeReverbWetAmount: function() {
        reverbWetGain.gain.value = this.value;
    },

    changeReverb: function() {
        reverb.buffer = reverbBuffers[parseInt(reverbSelect.value - 1)]
    }
}