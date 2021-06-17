# Pantam

A virtual instrument with samples sourced from https://www.darkarps.com/hang-drum-multisampled-instrument/

This project was built entirly with vanilla Javascript, HTML and CSS with no dependancies, for Mod 4 of the Software Engineering program at Flatiron School.

## Installation Instructions

Fork and clone this repo to your machine.

The back-end is deployed and available through https://hang-pan.herokuapp.com

If you clone and install the back-end repo, you'll have to update the ```apiLoader.js``` file:

The ```apiUrl``` variable will have to be set to your local address.  For Example:
```http://localhost:3000```

# Key Features

## Database
Pantam uses a simple Rails API on the back-end, with only 3 models.  A hard-coded set of audio samples are loaded from Cloudinary, into local buffers on the note objects. These notes can be organized into scales, and saved on the database.

![pantam-database](https://user-images.githubusercontent.com/72274257/122440982-61a5c100-cf9d-11eb-91b0-c9a1e6f4a713.jpg)

## WebAudioAPI Implementation


## Playing the Instrument

### The Keyboard Map
Use the keyboard to play the 9 notes of the instrument.  
- The bottom row (z x c v n m , . ?) trigger the soft versions of the notes.
- The home row (a s d f h j k l ;) trigger the medium versions of the notes.
- The top row (q w e r y u i o p) trigger the loud versions of the notes.
View the keymap by clicking the "help" icon in the bottom right corner of the app.

![pantam-help](https://user-images.githubusercontent.com/72274257/122440250-ab41dc00-cf9c-11eb-8de5-53911ddf61bd.jpg)

### Selecting Notes
Use the "Notes" menu, by clicking the "Notes" button to select which notes each position of the pan produce.
Notes may be repeated in several slots, and any chromatic note between C2 and A3 may be selected.

### Effects
Open the "Effects" menu by clicking the "Effects" button.

#### Volume
- Controls your master output volume.

#### Delay Time
- Controls how long before the delayed note is repeated.
- A higher amount results in a longer delay time.

#### Delay Feedback
- Controls how much of the signal is fed back into the delay unit.
- A higher amount results in more repeats of the delayed sound.

#### Delay Amount 
- Controls how quickly the repeats lower in volume.
- A higher amount results in louder repeats of the delayed sound, that fade away slower.

#### Reverb Wet
- Controls the level of only the reflected sound of the selected reverb.
- A higher level results in a more distant sound, as if you were standing further from the instrument.

#### Reverb Dry
- Controls the level of only the direct samples as you play.  
- Use this to control the blend of the "wet" sound with the "dry" sound to dial in the reverb.

#### Reverb Type
Comes loaded with 3 reverb types:
- Room
- Hall
- Outdoor

### Selecting a Scale
- Use the dropdown menu below the instrument to select a scale that has already been saved.  This will load the notes of that scale into the instrument.

### Saving a Scale
- Select the notes for a new scale, and click the "Save This Scale" button.  This allows you to enter a name for your scale and save it to the master scale list.
- You cannot save a scale with a name that already exists on the list, or with a blank name.
