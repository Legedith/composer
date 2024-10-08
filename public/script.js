/*************************
 * Player Class
 ************************/
class Player {
    constructor() {
        this.player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
        this.loadAllSamples();
    }
    
    loadAllSamples() {
        const seq = { notes: [] };
        for (let i = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE; i <= CONSTANTS.HIGHEST_PIANO_KEY_MIDI_NOTE; i++) {
            seq.notes.push({ pitch: i });
        }
        this.player.loadSamples(seq);
    }
    
    playNoteDown(pitch) {
        mm.Player.tone.context.resume();
        this.player.playNoteDown({ pitch: pitch });
    }
    
    playNoteUp(pitch) {
        this.player.playNoteUp({ pitch: pitch });
    }
}

/*************************
 * FloatyNotes Class
 ************************/
class FloatyNotes {
    constructor() {
        this.notes = [];  // The notes floating on the screen.
        
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.lineWidth = 4;
        this.context.lineCap = 'round';
        
        this.contextHeight = 0;
    }
    
    resize(whiteNoteHeight) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = this.contextHeight = window.innerHeight - whiteNoteHeight - 20;
    }
    
    addNote(x, width) { // Removed 'button' parameter as it's unused
        const noteToPaint = {
            x: parseFloat(x),
            y: 0,
            width: parseFloat(width),
            height: 0,
            color: '#FFD700', // Gold color
            on: true
        };
        this.notes.push(noteToPaint);
        return noteToPaint;
    }
    
    stopNote(noteToPaint) {
        noteToPaint.on = false;
    }
    
    drawLoop() {
        const dy = 3;
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
        // Remove all the notes that will be off the page
        this.notes = this.notes.filter((note) => note.on || note.y < (this.contextHeight - 100));
    
        // Advance all the notes
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
    
            if (note.on) {
                note.height += dy;
            } else {
                note.y += dy;
            }
            
            this.context.globalAlpha = 1 - note.y / this.contextHeight;
            this.context.fillStyle = note.color;
            this.context.fillRect(note.x, note.y, note.width, note.height);
        }
        window.requestAnimationFrame(() => this.drawLoop());
    }
}

/*************************
 * Piano Class
 ************************/
class Piano {
    constructor() {
        this.config = {
            whiteNoteWidth: 20,
            blackNoteWidth: 20,
            whiteNoteHeight: 70,
            blackNoteHeight: (2 * 70) / 3
        };
        
        this.svg = document.getElementById('svg');
        this.svgNS = 'http://www.w3.org/2000/svg';
    }
    
    resize(totalWhiteNotes) {
        const ratio = window.innerWidth / totalWhiteNotes;
        this.config.whiteNoteWidth = OCTAVES > 6 ? ratio : Math.floor(ratio);
        this.config.blackNoteWidth = (this.config.whiteNoteWidth * 2) / 3;
        this.svg.setAttribute('width', window.innerWidth);
        this.svg.setAttribute('height', this.config.whiteNoteHeight);
    }
    
    draw() {
        this.svg.innerHTML = '';
        const halfABlackNote = this.config.blackNoteWidth / 2;
        let x = 0;
        let y = 0;
        let index = 0;
    
        const blackNoteIndexes = [1, 3, 6, 8, 10];
        
        // Draw white notes
        for (let o = 0; o < OCTAVES; o++) {
            for (let i = 0; i < CONSTANTS.NOTES_PER_OCTAVE; i++) {
                if (!blackNoteIndexes.includes(i)) {
                    this.makeRect(index, x, y, this.config.whiteNoteWidth, this.config.whiteNoteHeight, 'white', '#141E30');
                    x += this.config.whiteNoteWidth;
                }
                index++;
            }
        }
        
        // Reset x for black notes
        x = 0;
        index = 0;
        
        // Draw black notes
        for (let o = 0; o < OCTAVES; o++) {
            for (let i = 0; i < CONSTANTS.NOTES_PER_OCTAVE; i++) {
                if (blackNoteIndexes.includes(i)) {
                    this.makeRect(index, x + this.config.whiteNoteWidth - halfABlackNote, y, this.config.blackNoteWidth, this.config.blackNoteHeight, 'black');
                } else {
                    x += this.config.whiteNoteWidth;
                }
                index++;
            }
        }
    }
    
    highlightNote(noteIndex) {
        const rect = this.svg.querySelector(`rect[data-index="${noteIndex}"]`);
        if (!rect) {
            console.log('Could not find a rect for note index', noteIndex);
            return null;
        }
        rect.setAttribute('active', true);
        return rect;
    }
    
    clearNote(rect) {
        rect.removeAttribute('active');
    }
    
    makeRect(index, x, y, w, h, fill, stroke) {
        const rect = document.createElementNS(this.svgNS, 'rect');
        rect.setAttribute('data-index', index);
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', h);
        rect.setAttribute('fill', fill);
        if (stroke) {
            rect.setAttribute('stroke', stroke);
            rect.setAttribute('stroke-width', '3px');
        }
        this.svg.appendChild(rect);
        return rect;
    }
}

const CONSTANTS = {
    NOTES_PER_OCTAVE: 12,
    WHITE_NOTES_PER_OCTAVE: 7,
    LOWEST_PIANO_KEY_MIDI_NOTE: 21,
    HIGHEST_PIANO_KEY_MIDI_NOTE: 108,
};

let OCTAVES = 7;
let currentMusic = []; // To keep track of the music sequence
let isGenerating = false; // To prevent multiple simultaneous requests
let sustainingNotes = [];
let isRepeating = false; // To track repeat state

const player = new Player();
const painter = new FloatyNotes();
const piano = new Piano();

initEverything();

/*************************
 * Basic UI Initialization
 ************************/
function initEverything() {
    console.log('🎹 Piano Composer ready!');
    const playBtn = document.getElementById('playBtn');
    playBtn.textContent = 'Play';
    playBtn.removeAttribute('disabled');
    playBtn.classList.remove('loading');

    // Event listener for the send command button
    document.getElementById('sendCommand').addEventListener('click', () => {
        const commandInput = document.getElementById('userCommand');
        const command = commandInput.value.trim();
        if (command && !isGenerating) {
            isGenerating = true;
            handleUserCommand(command);
            commandInput.value = '';
        }
    });

    // Event listeners for control buttons
    document.getElementById('repeatBtn').addEventListener('click', toggleRepeat);
    document.getElementById('downloadBtn').addEventListener('click', downloadMusic);

    // Start the drawing loop.
    onWindowResize();
    window.requestAnimationFrame(() => painter.drawLoop());

    // Optional: Handle window resize events
    window.addEventListener('resize', onWindowResize);
}

/*************************
 * Show Main Screen
 ************************/
function showMainScreen() {
    document.querySelector('.splash').hidden = true;
    document.querySelector('.loaded').hidden = false;
}

/*************************
 * Handle User Commands
 ************************/
async function handleUserCommand(command) {
    appendMessage('user', command);
    showLoader();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ message: command, current_piece: currentMusic })
        });

        if (response.ok) {
            const data = await response.json();
            const musicNotes = data.music_notes; // LLM returns an array of note events
            if (musicNotes && Array.isArray(musicNotes)) {
                appendMessage('bot', 'Imagining new music...');
                appendToCurrentPiece(musicNotes);
                processMusicNotes(musicNotes);
                enableControlButtons();
            } else {
                appendMessage('bot', 'Received invalid music data.');
            }
        } else {
            console.error('Error from server:', response.statusText);
            appendMessage('bot', 'Sorry, there was an error processing your request.');
        }
    } catch (error) {
        console.error('Error handling user command:', error);
        appendMessage('bot', 'An unexpected error occurred.');
    } finally {
        hideLoader();
        isGenerating = false;
    }
}

/**
 * Append new notes to the currentMusic array
 * @param {Array} newNotes - Array of new note events to append
 */
function appendToCurrentPiece(newNotes) {
    currentMusic = currentMusic.concat(newNotes);
}

/*************************
 * Process and Play Notes
 ************************/
function processMusicNotes(notes) {
    if (Array.isArray(notes) && notes.length > 0) {
        playMusicSequence(notes);
    } else {
        console.error('Invalid music notes received:', notes);
        appendMessage('bot', 'Failed to generate music. Please try again.');
    }
}

/**
 * Plays a sequence of notes. If repeat is true, it will loop the sequence indefinitely.
 * @param {Array} notes - Array of note events to play
 */
function playMusicSequence(notes) {
    // Stop any existing notes
    stopAllNotes();

    // Clear the piano visualization
    piano.svg.querySelectorAll('rect[active]').forEach(rect => piano.clearNote(rect));

    let index = 0;

    function playNextNote() {
        if (index < notes.length) {
            const noteEvent = notes[index];
            const { time, duration, notes: notePitches } = noteEvent;

            // Schedule the notes
            setTimeout(() => {
                notePitches.forEach(pitch => playNoteDown(pitch));
                setTimeout(() => {
                    notePitches.forEach(pitch => playNoteUp(pitch));
                }, duration);
            }, time);

            index++;
            playNextNote(); // Continue to the next note event
        } else {
            // Finished playing current notes
            if (isRepeating) {
                // Restart the sequence after a short delay
                setTimeout(() => {
                    playMusicSequence(currentMusic);
                }, 500); // 500 ms delay
            } else {
                appendMessage('bot', 'Music generation complete!');
            }
        }
    }

    playNextNote();
}

/**
 * Plays a note down and visualizes it.
 * @param {number} pitch - MIDI pitch number
 */
function playNoteDown(pitch) {
    // Play the note using the player
    player.playNoteDown(pitch);

    // Visualize the note
    const noteIndex = pitch - CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE;
    const rect = piano.highlightNote(noteIndex);
    if (rect) {
        const noteToPaint = painter.addNote(
            parseFloat(rect.getAttribute('x')),
            parseFloat(rect.getAttribute('width'))
        );

        // Store the rect for later clearing
        sustainingNotes.push({ pitch, rect, noteToPaint });
    }
}

/**
 * Stops playing a note and removes its visualization.
 * @param {number} pitch - MIDI pitch number
 */
function playNoteUp(pitch) {
    // Stop the note
    player.playNoteUp(pitch);

    // Remove visualization
    const index = sustainingNotes.findIndex(n => n.pitch === pitch);
    if (index !== -1) {
        const { rect, noteToPaint } = sustainingNotes[index];
        piano.clearNote(rect);
        painter.stopNote(noteToPaint);
        sustainingNotes.splice(index, 1);
    }
}

/**
 * Stops all currently playing notes and clears visualizations.
 */
function stopAllNotes() {
    sustainingNotes.forEach(({ pitch }) => player.playNoteUp(pitch));
    sustainingNotes = [];
    piano.svg.querySelectorAll('rect[active]').forEach(rect => piano.clearNote(rect));
}

/*************************
 * Resize Handling
 ************************/
function onWindowResize() {
    OCTAVES = window.innerWidth > 700 ? 7 : 3;
    const bonusNotes = OCTAVES > 6 ? 4 : 0;  // starts on an A, ends on a C
    const totalNotes = CONSTANTS.NOTES_PER_OCTAVE * OCTAVES + bonusNotes; 
    const totalWhiteNotes = CONSTANTS.WHITE_NOTES_PER_OCTAVE * OCTAVES + (bonusNotes - 1); 
    piano.resize(totalWhiteNotes);
    painter.resize(piano.config.whiteNoteHeight);
    piano.draw();
}

/*************************
 * Utility Functions
 ************************/

/**
 * Appends a message to the messages container.
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - The message text
 */
function appendMessage(sender, text) {
    const messagesDiv = document.querySelector('.messages');
    const message = document.createElement('div');
    message.classList.add('message', sender);
    message.textContent = text;
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Shows the loader by disabling the send button and changing its text.
 */
function showLoader() {
    const sendButton = document.getElementById('sendCommand');
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
}

/**
 * Hides the loader by enabling the send button and resetting its text.
 */
function hideLoader() {
    const sendButton = document.getElementById('sendCommand');
    sendButton.textContent = 'Send';
    sendButton.disabled = false;
}

/**
 * Enables the Repeat and Download buttons.
 */
function enableControlButtons() {
    const repeatBtn = document.getElementById('repeatBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    if (repeatBtn) repeatBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
}

/**
 * Toggles the repeat functionality.
 */
function toggleRepeat() {
    isRepeating = !isRepeating;
    const repeatBtn = document.getElementById('repeatBtn');
    if (isRepeating) {
        repeatBtn.textContent = 'Stop Repeat';
        appendMessage('bot', 'Repeating music...');
        // If not currently playing, start playing
        if (currentMusic.length > 0 && !isGenerating) {
            playMusicSequence(currentMusic);
        }
    } else {
        repeatBtn.textContent = 'Repeat';
        appendMessage('bot', 'Repeating stopped.');
    }
}

/**
 * Downloads the current music piece as a MIDI file.
 */
function downloadMusic() {
    if (currentMusic.length === 0) {
        alert('No music to download!');
        return;
    }

    // Convert currentMusic to a Magenta.js SequenceProto object
    const sequence = convertToSequence(currentMusic);

    // Convert the SequenceProto to MIDI
    const midi = mm.sequenceProtoToMidi(sequence);

    // Create a Blob from the MIDI array
    const blob = new Blob([midi], { type: 'audio/midi' });

    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'composition.mid';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    appendMessage('bot', 'Your composition has been downloaded as composition.mid!');
}

/**
 * Converts currentMusic array to a Magenta.js SequenceProto object.
 * @param {Array} music - Array of note events
 * @returns {Object} SequenceProto object
 */
function convertToSequence(music) {
    const sequence = {
        notes: [],
        totalTime: 0,
    };

    music.forEach(noteEvent => {
        const { time, duration, notes: pitches } = noteEvent;
        pitches.forEach(pitch => {
            sequence.notes.push({
                pitch: pitch,
                startTime: time / 1000, // Convert ms to seconds
                endTime: (time + duration) / 1000,
                velocity: 80, // Default velocity
            });
        });
        const eventEnd = (time + duration) / 1000;
        if (eventEnd > sequence.totalTime) {
            sequence.totalTime = eventEnd;
        }
    });

    return sequence;
}
