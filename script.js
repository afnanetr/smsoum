const menu = document.getElementById("menu");
const game = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const player = document.getElementById("player");

const messageBox = document.getElementById("messageBox");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");

// Journal System
const journalBtn = document.getElementById("journalBtn");
const controlsImg = document.getElementById("controlsImg");
const journalModal = document.getElementById("journalModal");
const closeJournal = document.getElementById("closeJournal");
const inventoryModal = document.getElementById("inventoryModal");
const closeInventory = document.getElementById("closeInventory");
const revealPopup = document.getElementById("revealPopup");
const continueBtn = document.getElementById("continueBtn");

// Lightstick System
const lightstickFixed = document.getElementById("lightstickFixed");
const lightstickButton = document.getElementById("lightstickButton");
const lightstickSlot = document.getElementById("lightstickSlot");
const lightstickMessage = document.getElementById("lightstickMessage");

let lightstickUnlocked = false;
let lightstickOn = false;
let lightstickMusic = null;
let lightstickClickCount = 0;
let lightstickClickTimer = null;
let lightstickEquipped = false;
let letterCollected = false;

// Photocard Lightbox
const photocardLightbox = document.getElementById("photocardLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");
const prevPhotocard = document.getElementById("prevPhotocard");
const nextPhotocard = document.getElementById("nextPhotocard");
let currentLightboxIndex = 0;

let gameStarted = false;
let lettersCollected = 0;
let gameState = 1; // 1 = mission1 (letters), 2 = mission2 (pieces)

let piecesCollected = 0;
let totalPieces = 5;
let mission1Completed = false;
let mission2Completed = false;
let mission1Timer = null;

// Game State
const targetWord = "smsoumti";
const totalLetters = targetWord.length;
let collectedChars = Array(totalLetters).fill(null);
let collectedPhotocards = [];

// Photocard pool
const photocardPool = [
    "photocard_bnd_1.png",
    "photocard_bnd_2.png",
    "photocard_bnd_3.png",
    "photocard_bnd_4.png",
    "photocard_bnd_5.png",
    "photocard_bnd_6.png",
    "photocard_bnd_7.png",
    "photocard_bnd_8.png"
];

// Hints for each letter
const hints = [
    "the nickname I gave you",
    "instagram",
    "carat",
    "miniscule",
    "date in numbers",
    "2025",
    "password is : nickname+full date(no space)",
    "love you (this isn't a hint )"
];

let x = 565;
let y = 425;
const speed = 5;

const keys = {};
let lastDirection = "front";
let isPicking = false;

// Mobile touch controls
const mobileControls = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Initialize mobile controls
function initMobileControls(){
    const btnUp = document.getElementById("btnUp");
    const btnDown = document.getElementById("btnDown");
    const btnLeft = document.getElementById("btnLeft");
    const btnRight = document.getElementById("btnRight");
    const btnJournal = document.getElementById("btnJournal");
    const btnInventory = document.getElementById("btnInventory");
    
    if(!btnUp) return; // Exit if mobile controls aren't present
    
    // Direction buttons
    const addDirectionListeners = (btn, direction) => {
        btn.addEventListener("touchstart", (e) => {
            e.preventDefault();
            mobileControls[direction] = true;
        });
        btn.addEventListener("touchend", (e) => {
            e.preventDefault();
            mobileControls[direction] = false;
        });
        btn.addEventListener("mousedown", (e) => {
            e.preventDefault();
            mobileControls[direction] = true;
        });
        btn.addEventListener("mouseup", (e) => {
            e.preventDefault();
            mobileControls[direction] = false;
        });
    };
    
    addDirectionListeners(btnUp, "up");
    addDirectionListeners(btnDown, "down");
    addDirectionListeners(btnLeft, "left");
    addDirectionListeners(btnRight, "right");
    
    // Action buttons
    btnJournal.addEventListener("click", (e) => {
        e.preventDefault();
        if(journalModal.style.display === "block"){
            journalModal.style.display = "none";
        } else {
            journalModal.style.display = "block";
            updateJournalDisplay();
        }
    });
    
    btnInventory.addEventListener("click", (e) => {
        e.preventDefault();
        if(inventoryModal.style.display === "block"){
            inventoryModal.style.display = "none";
        } else {
            inventoryModal.style.display = "block";
        }
    });
}

function showMessage(title, text){
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageBox.style.display = "block";
}

function hideMessage(){
    messageBox.style.display = "none";
}

startBtn.addEventListener("click", () => {

    menu.style.display = "none";
    game.style.display = "block";
    journalBtn.style.display = "block";
    controlsImg.style.display = "block";

    // Initialize lightstick music
    initLightstickMusic("song.mp3");

    // Initialize mobile controls
    initMobileControls();

    initializeJournal();

});

// Journal Functions
function initializeJournal(){
    updateJournalDisplay();
}

function updateJournalDisplay(){
    // Update progress counter
    document.getElementById("progressCount").textContent = `${lettersCollected}/${totalLetters}`;
    
    // Update word display
    const wordDisplay = document.getElementById("wordDisplay");
    wordDisplay.innerHTML = "";
    
    for(let i = 0; i < totalLetters; i++){
        const slot = document.createElement("div");
        slot.className = collectedChars[i] ? "wordSlot" : "wordSlot empty";
        slot.textContent = collectedChars[i] || "?";
        wordDisplay.appendChild(slot);
    }
    
    // Update hints display
    const hintsList = document.getElementById("hintsList");
    hintsList.innerHTML = "";
    
    for(let i = 0; i < totalLetters; i++){
        const hintItem = document.createElement("div");
        hintItem.className = collectedChars[i] ? "hintItem collected" : "hintItem locked";
        
        if(collectedChars[i]){
            hintItem.innerHTML = `<strong>Letter ${i + 1}:</strong> ${hints[i]}`;
        } else {
            hintItem.innerHTML = `<strong>Letter ${i + 1}:</strong> ???`;
        }
        
        hintsList.appendChild(hintItem);
    }
    
    // Update photocard grid
    const photocardGrid = document.getElementById("photocardGrid");
    photocardGrid.innerHTML = "";
    
    photocardPool.forEach((photocard, index) => {
        const item = document.createElement("div");
        const isUnlocked = collectedPhotocards.includes(photocard);
        item.className = isUnlocked ? "photocardItem" : "photocardItem locked";
        
        item.innerHTML = `
            <img src="${photocard}" alt="Photocard ${index + 1}">
        `;
        
        // Add click handler for unlocked photocards
        if(isUnlocked){
            item.addEventListener("click", () => {
                openPhotocardLightbox(index);
            });
        }
        
        photocardGrid.appendChild(item);
    });
}

function openPhotocardLightbox(index){
    currentLightboxIndex = index;
    const photocard = photocardPool[index];
    lightboxImage.src = photocard;
    photocardLightbox.style.display = "flex";
}

function closePhotocardLightbox(){
    photocardLightbox.style.display = "none";
}

function showNextPhotocard(){
    const unlockedIndices = photocardPool
        .map((p, i) => collectedPhotocards.includes(p) ? i : -1)
        .filter(i => i !== -1);
    
    const currentPosition = unlockedIndices.indexOf(currentLightboxIndex);
    const nextPosition = (currentPosition + 1) % unlockedIndices.length;
    currentLightboxIndex = unlockedIndices[nextPosition];
    
    lightboxImage.src = photocardPool[currentLightboxIndex];
}

function showPrevPhotocard(){
    const unlockedIndices = photocardPool
        .map((p, i) => collectedPhotocards.includes(p) ? i : -1)
        .filter(i => i !== -1);
    
    const currentPosition = unlockedIndices.indexOf(currentLightboxIndex);
    const prevPosition = (currentPosition - 1 + unlockedIndices.length) % unlockedIndices.length;
    currentLightboxIndex = unlockedIndices[prevPosition];
    
    lightboxImage.src = photocardPool[currentLightboxIndex];
}

function getRandomPhotocard(){
    const available = photocardPool.filter(p => !collectedPhotocards.includes(p));
    if(available.length === 0) return photocardPool[0];
    return available[Math.floor(Math.random() * available.length)];
}

function showRevealPopup(letterNum, char, photocard){
    document.getElementById("revealLetterNum").textContent = letterNum;
    document.getElementById("revealChar").textContent = char;
    document.getElementById("revealPhotocardImg").src = photocard;
    document.getElementById("revealPhotocardName").textContent = "Photocard recorded";
    document.getElementById("logChar").textContent = char;
    document.getElementById("logPhotocard").textContent = "your photocard";
    
    revealPopup.style.display = "flex";
}

// Journal UI Controls
journalBtn.addEventListener("click", () => {
    journalModal.style.display = "block";
    updateJournalDisplay();
});

closeJournal.addEventListener("click", () => {
    journalModal.style.display = "none";
});

// Photocard Lightbox Controls
closeLightbox.addEventListener("click", closePhotocardLightbox);
nextPhotocard.addEventListener("click", showNextPhotocard);
prevPhotocard.addEventListener("click", showPrevPhotocard);

// Close lightbox when clicking outside the image
photocardLightbox.addEventListener("click", (e) => {
    if(e.target === photocardLightbox){
        closePhotocardLightbox();
    }
});

closeInventory.addEventListener("click", () => {
    inventoryModal.style.display = "none";
});

continueBtn.addEventListener("click", () => {
    revealPopup.style.display = "none";
});

document.addEventListener("keydown", (e) => {

    keys[e.key] = true;
    const lowerKey = e.key.toLowerCase();

    if(gameStarted){
        // Don't trigger shortcuts if typing in password input
        const isTypingPassword = document.activeElement === passwordInput;
        
        if(!isTypingPassword && lowerKey === "j"){
            if(journalModal.style.display === "block"){
                journalModal.style.display = "none";
            } else {
                journalModal.style.display = "block";
                updateJournalDisplay();
            }
        }

        if(!isTypingPassword && lowerKey === "i"){
            if(inventoryModal.style.display === "block"){
                inventoryModal.style.display = "none";
            } else {
                inventoryModal.style.display = "block";
            }
        }
    }

    if(!gameStarted){

        gameStarted = true;

        showMessage(
            "Mission 1 💌",
            "Hello! Welcome! Start searching and picking the letters. There are 8 hidden letters!"
        );

        setTimeout(() => {

            hideMessage();

            requestAnimationFrame(update);

        }, 2000);
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

const spriteMap = {
    left: "character_s_left.png",
    right: "character_s_right.png",
    back: "character_s_back.png",
    front: "character_s_front.png"
};

const pickSpriteMap = {
    left: "character_pick_left.png",
    right: "character_pick.png",
    back: "character_pick_back.png",
    front: "test.png"
};

function collectLetter(letter){

    if(isPicking) return;

    isPicking = true;

    player.src = pickSpriteMap[lastDirection];

    letter.style.display = "none";

    lettersCollected++;
    
    // Get letter number from ID (e.g., "letter3" -> 3)
    const letterNum = letter.id.replace("letter", "");
    
    // Assign the correct character for this letter position and give a random photocard
    const letterIndex = parseInt(letter.id.replace("letter", ""), 10) - 1;
    const revealedChar = targetWord[letterIndex] || "?";
    const revealedPhotocard = getRandomPhotocard();
    
    // Store in collections at the fixed position
    if(letterIndex >= 0 && letterIndex < totalLetters){
        collectedChars[letterIndex] = revealedChar;
    } else {
        collectedChars.push(revealedChar);
    }
    collectedPhotocards.push(revealedPhotocard);

    setTimeout(() => {

        letter.remove();

        isPicking = false;

        player.src = spriteMap[lastDirection];
        
        // Show reveal popup
        showRevealPopup(letterNum, revealedChar, revealedPhotocard);
        
        // Update journal
        updateJournalDisplay();

        if(lettersCollected === totalLetters){

            setTimeout(() => {
                showMessage(
                    "Mission 1 Complete",
                    "Congrats! You've completed Mission 1. Head to the door to go to Mission 2."
                );
            }, 500);

        }

            // Transition to mission 2 after a short delay
            if(lettersCollected === totalLetters && gameState === 1 && !mission1Completed){
                mission1Completed = true;
                // auto transition after 5 seconds unless the player heads to the door
                mission1Timer = setTimeout(() => {
                    if(gameState === 1) startMission2();
                }, 5000);
            }

    }, 1500);
}

    function startMission2(){
        // clear any pending timer
        if(mission1Timer){
            clearTimeout(mission1Timer);
            mission1Timer = null;
        }

        gameState = 2;

        // Change room to garden image
        const roomImg = document.getElementById("room");
        roomImg.src = "garden.png";

        // Hide any remaining letters (should be none)
        document.querySelectorAll('.letter').forEach(l => l.remove());

        // Spawn pieces at fixed positions in the garden
        const piecePositions = [
            {left: 200, top: 250},
            {left: 550, top: 180},
            {left: 900, top: 350},
            {left: 350, top: 650},
            {left: 750, top: 550}
        ];

        piecePositions.slice(0, totalPieces).forEach((pos, i) => {
            const img = document.createElement('img');
            img.className = 'piece';
            img.id = `piece${i+1}`;
            img.src = `piece${i+1}.png`;
            img.style.position = 'absolute';
            img.style.left = pos.left + 'px';
            img.style.top = pos.top + 'px';
            
            // Different sizes: piece1 stays 60px, pieces 2-3 are 45px, pieces 4-5 are 35px
            if(i === 0){
                img.style.width = '60px';
            } else if(i >= 3){
                img.style.width = '35px';
            } else {
                img.style.width = '45px';
            }
            
            img.style.zIndex = 5;
            img.style.background = 'transparent';
            img.style.imageRendering = 'pixelated';
            document.getElementById('game').appendChild(img);
        });

        showMessage(
            "Mission 2",
            "There are some missing pieces around the garden—try to collect them all."
        );

        setTimeout(hideMessage, 3500);
    }

    function collectPiece(piece){
        if(isPicking) return;

        isPicking = true;

        player.src = pickSpriteMap[lastDirection];

        piece.style.display = 'none';

        piecesCollected++;

        setTimeout(() => {
            piece.remove();
            isPicking = false;
            player.src = spriteMap[lastDirection];

            // Subtle feedback, do not reveal what the final object is
            showMessage(
                `Piece ${piecesCollected} collected`,
                "You found a missing piece. Keep searching!"
            );

            setTimeout(hideMessage, 1800);

            if(piecesCollected === totalPieces){
                // Unlock the lightstick!
                unlockLightstick();
                
                showMessage(
                    "Mission 2 Complete!",
                    "You've collected all the missing pieces. The BINI lightstick is now unlocked! Head to the door for Mission 3."
                );
                
                // Mark mission 2 as completed
                setTimeout(() => {
                    mission2Completed = true;
                }, 2000);
            }
        }, 900);
    }

function checkLetters(){

    const p = player.getBoundingClientRect();

    // Check collision against both letters and pieces
    document.querySelectorAll(".letter, .piece").forEach(el => {

        const l = el.getBoundingClientRect();

        if(
            p.left < l.right &&
            p.right > l.left &&
            p.top < l.bottom &&
            p.bottom > l.top
        ){
            if(el.classList.contains('piece')){
                collectPiece(el);
            } else {
                collectLetter(el);
            }
        }
    });
}

function update(){

    let moving = false;

    if(!isPicking){

        const up = keys["w"] || keys["z"] || keys["ArrowUp"] || mobileControls.up;
        const down = keys["s"] || keys["ArrowDown"] || mobileControls.down;
        const left = keys["a"] || keys["q"] || keys["ArrowLeft"] || mobileControls.left;
        const right = keys["d"] || keys["ArrowRight"] || mobileControls.right;

        // Movement
        if(up){
            y -= speed;
            moving = true;
        }

        if(down){
            y += speed;
            moving = true;
        }

        if(left){
            x -= speed;
            moving = true;
        }

        if(right){
            x += speed;
            moving = true;
        }

        // Diagonal sprites
        if(up && left){
            player.src = "character_s_wa.png";
            lastDirection = "left";
            player.classList.remove("standing");
        }
        else if(up && right){
            player.src = "character_s_wd.png";
            lastDirection = "right";
            player.classList.remove("standing");
        }

        // Single directions
        else if(up){
            player.src = "character_s_back.png";
            lastDirection = "back";
            player.classList.remove("standing");
        }
        else if(down){
            // If equipped with lightstick and moving down (front), show lightstick sprite
            if(lightstickEquipped){
                player.src = "character_lightstick.png";
            } else {
                player.src = "character_s_front.png";
            }
            lastDirection = "front";
            player.classList.remove("standing");
        }
        else if(left){
            player.src = "character_s_left.png";
            lastDirection = "left";
            player.classList.remove("standing");
        }
        else if(right){
            player.src = "character_s_right.png";
            lastDirection = "right";
            player.classList.remove("standing");
        }

        // Standing still
        else{
            // If equipped with lightstick and facing front, show lightstick sprite
            if(lightstickEquipped && lastDirection === "front"){
                player.src = "character_lightstick.png";
                player.classList.add("standing");
            } else {
                player.src = spriteMap[lastDirection];
                player.classList.add("standing");
            }
        }
    }

    x = Math.max(0, Math.min(x, 1130));
    y = Math.max(0, Math.min(y, 850));

    player.style.left = x + "px";
    player.style.top = y + "px";

    // If mission1 completed, allow entering garden by heading to the door
    if(mission1Completed && gameState === 1){
        if(x <= 0 || y <= 0 || x >= 1130 || y >= 850){
            if(mission1Timer){
                clearTimeout(mission1Timer);
                mission1Timer = null;
            }
            startMission2();
        }
    }
    
    // If mission2 completed, allow entering night scene by heading to the door
    if(mission2Completed && gameState === 2){
        if(x <= 0 || y <= 0 || x >= 1130 || y >= 850){
            startMission3();
        }
    }

    checkLetters();
    
    // Performance tracking
    updateFPS();

    requestAnimationFrame(update);
}


// ==================== LIGHTSTICK SYSTEM ====================

// Initialize lightstick music
function initLightstickMusic(audioFile){
    lightstickMusic = new Audio(audioFile);
    lightstickMusic.loop = true;
}

// Unlock lightstick after completing Mission 2
function unlockLightstick(){
    console.log("Unlocking lightstick!");
    lightstickUnlocked = true;
    lightstickFixed.style.display = "block";
    lightstickSlot.style.display = "block";
    
    // Hide empty message and show instructions
    document.getElementById("emptyInventoryMessage").style.display = "none";
    document.getElementById("inventoryInstructions").style.display = "block";
    
    // Show the instruction message for 10 seconds
    setTimeout(() => {
        lightstickMessage.style.display = "block";
    }, 100);
    
    // Hide message after 10 seconds
    setTimeout(() => {
        lightstickMessage.style.display = "none";
    }, 10100);
    
    showMessage(
        "🎉 Lightstick Unlocked!",
        "Check the left side of your screen!"
    );
    
    setTimeout(hideMessage, 3000);
}

// Toggle lightstick equipped state
lightstickSlot.addEventListener("click", () => {
    if(!lightstickUnlocked) return;
    
    lightstickEquipped = !lightstickEquipped;
    
    if(lightstickEquipped){
        lightstickSlot.classList.add("equipped");
        showMessage("Lightstick Equipped!", "You're now holding the lightstick when facing front!");
    } else {
        lightstickSlot.classList.remove("equipped");
        showMessage("Lightstick Unequipped!", "Back to normal.");
    }
    
    setTimeout(hideMessage, 1500);
    
    // Update character sprite if standing front
    updateCharacterSprite();
});

// Letter viewer functionality
const letterViewerModal = document.getElementById("letterViewerModal");
const closeLetterViewer = document.getElementById("closeLetterViewer");
const letterSlot = document.getElementById("letterSlot");

letterSlot.addEventListener("click", () => {
    if(!letterCollected) return;
    
    letterViewerModal.style.display = "flex";
});

closeLetterViewer.addEventListener("click", () => {
    letterViewerModal.style.display = "none";
});

// Update character sprite based on lightstick state
function updateCharacterSprite(){
    if(lightstickEquipped && lastDirection === "front" && !isPicking){
        const up = keys["w"] || keys["z"] || keys["ArrowUp"];
        const down = keys["s"] || keys["ArrowDown"];
        const left = keys["a"] || keys["q"] || keys["ArrowLeft"];
        const right = keys["d"] || keys["ArrowRight"];
        
        // Only show lightstick sprite when standing still facing front
        if(!up && !down && !left && !right){
            player.src = "character_lightstick.png";
        }
    }
}

// Handle double-click on fixed lightstick to toggle light
lightstickFixed.addEventListener("click", () => {
    if(!lightstickUnlocked) return;
    
    lightstickClickCount++;
    
    if(lightstickClickTimer){
        clearTimeout(lightstickClickTimer);
    }
    
    lightstickClickTimer = setTimeout(() => {
        lightstickClickCount = 0;
    }, 500);
    
    if(lightstickClickCount === 2){
        lightstickClickCount = 0;
        clearTimeout(lightstickClickTimer);
        toggleLightstick();
    }
});

// Toggle lightstick on/off
function toggleLightstick(){
    lightstickOn = !lightstickOn;
    
    console.log("Toggling lightstick. New state:", lightstickOn ? "ON" : "OFF");
    
    const lightstickElement = lightstickFixed.querySelector(".lightstick");
    
    if(lightstickOn){
        lightstickElement.classList.add("lit");
    } else {
        lightstickElement.classList.remove("lit");
    }
    
    if(lightstickOn){
        if(lightstickMusic){
            lightstickMusic.play().catch(err => {
                console.log("Music playback failed:", err);
            });
        }
    } else {
        if(lightstickMusic){
            lightstickMusic.pause();
        }
    }
}

// Toggle inventory
function toggleInventory(){
    if(inventoryModal.style.display === "block"){
        inventoryModal.style.display = "none";
    } else {
        inventoryModal.style.display = "block";
    }
}

// Close inventory button
closeInventory.addEventListener("click", () => {
    inventoryModal.style.display = "none";
});

// Initialize lightstick music when game starts
// Call this with your music file: initLightstickMusic("your_music_file.mp3");


// ==================== MISSION 3 SYSTEM ====================

// Mission 3 variables
const passwordBoxModal = document.getElementById("passwordBoxModal");
const passwordInput = document.getElementById("passwordInput");
const submitPassword = document.getElementById("submitPassword");
const closePasswordBox = document.getElementById("closePasswordBox");
const openJournalFromBox = document.getElementById("openJournalFromBox");
const passwordError = document.getElementById("passwordError");
const timerDisplay = document.getElementById("timerDisplay");
const timerFill = document.getElementById("timerFill");
const finalLetterModal = document.getElementById("finalLetterModal");
const finalLetterText = document.getElementById("finalLetterText");
const closeFinalLetter = document.getElementById("closeFinalLetter");
const treasureBox = document.getElementById("treasureBox");
const lightstickReminderModal = document.getElementById("lightstickReminderModal");
const lightstickReminderDone = document.getElementById("lightstickReminderDone");

let mission3Started = false;
let mission3Timer = null;
let mission3TimeLeft = 600; // 10 minutes in seconds
let passwordCorrect = "smsoumti05082025"; // The password
let boxOpened = false;
let treasureBoxClicked = false;

// Your letter content
const yourLetter = `To my smsoumti

Akhhh bch nbda bch nkml, my beautiful samsouma even tho we've never met I've never considered you as an online friend (despite the fact that jamis ma tla9ina akhhhh) but I've always considered you as my best friend the friend I want to tell all my stories and secrets to.

I wanted to do this little game as my first project even tho it's a small one but I wanted it to be about you so that I have the motivation to complete it haha.

Almohim I can't describe how much I love you and how much I want to n3dk you were the friend I talked to in the nights after my bac and my first days at la fac, love you so much my babyyyyn7bk my mokaaaa.

Nsit ma hdrtch 3la seventeen w boynextdoor hadi khliha f les msgs 💕

With all my love,
Your friend who made this game for you 💌`;

// Start Mission 3
function startMission3(){
    gameState = 3;
    mission3Started = true;
    
    // Change room to night scene
    const roomImg = document.getElementById("room");
    roomImg.src = "night.png";
    
    // Remove any remaining pieces
    document.querySelectorAll('.piece').forEach(p => p.remove());
    
    // Show treasure box in center
    treasureBox.style.display = "block";
    
    showMessage(
        "Mission 3 - The Night",
        "It's getting dark... Tap on the treasure box in the center!"
    );
    
    setTimeout(hideMessage, 4000);
}

// Click on treasure box
treasureBox.addEventListener("click", () => {
    if(boxOpened) return; // Only prevent if box is already opened
    
    // Check if lightstick is on
    if(!lightstickOn){
        // Show reminder to turn on lightstick
        lightstickReminderModal.style.display = "flex";
    } else {
        // Lightstick is on, open password box
        openPasswordBox();
    }
});

// Done button on lightstick reminder
lightstickReminderDone.addEventListener("click", () => {
    lightstickReminderModal.style.display = "none";
});

// Check if player is in center of room - REMOVED, now click box instead
function checkCenterPosition(){
    // No longer needed - player clicks the box
}

// Open password box
function openPasswordBox(){
    if(boxOpened) return;
    
    passwordBoxModal.style.display = "flex";
    passwordInput.value = "";
    passwordError.style.display = "none";
    
    // Start 10-minute timer (only if not already running)
    if(!mission3Timer){
        startMission3Timer();
    }
}

// Start the 10-minute countdown
function startMission3Timer(){
    if(mission3Timer) return; // Already running
    
    mission3TimeLeft = 600; // Reset to 10 minutes
    
    mission3Timer = setInterval(() => {
        mission3TimeLeft--;
        
        // Update timer display
        const minutes = Math.floor(mission3TimeLeft / 60);
        const seconds = mission3TimeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer bar
        const percentage = (mission3TimeLeft / 600) * 100;
        timerFill.style.width = percentage + "%";
        
        // Time's up - auto open
        if(mission3TimeLeft <= 0){
            clearInterval(mission3Timer);
            mission3Timer = null;
            autoOpenBox();
        }
    }, 1000);
}

// Submit password
submitPassword.addEventListener("click", () => {
    const enteredPassword = passwordInput.value.trim();
    
    if(enteredPassword === passwordCorrect){
        // Correct password!
        if(mission3Timer){
            clearInterval(mission3Timer);
            mission3Timer = null;
        }
        openBox();
    } else {
        // Wrong password
        passwordError.textContent = "Incorrect password. Check the hints in your journal!";
        passwordError.style.display = "block";
        passwordInput.value = "";
    }
});

// Enter key to submit
passwordInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter"){
        submitPassword.click();
    }
});

// Close password box (but timer keeps running)
closePasswordBox.addEventListener("click", () => {
    passwordBoxModal.style.display = "none";
    // Timer continues in background
});

// Open journal from password box
openJournalFromBox.addEventListener("click", () => {
    // Keep password box open but show journal on top
    journalModal.style.display = "block";
    updateJournalDisplay();
});

// Auto open box after 10 minutes
function autoOpenBox(){
    passwordBoxModal.style.display = "none";
    showMessage(
        "Time's Up!",
        "The box opens by itself..."
    );
    
    setTimeout(() => {
        hideMessage();
        openBox();
    }, 2000);
}

// Open the box and show final letter
function openBox(){
    boxOpened = true;
    passwordBoxModal.style.display = "none";
    treasureBox.style.display = "none"; // Hide the treasure box
    
    // Add letter to inventory
    letterCollected = true;
    document.getElementById("letterSlot").style.display = "block";
    
    // Update inventory display
    if(lightstickUnlocked){
        document.getElementById("emptyInventoryMessage").style.display = "none";
        document.getElementById("inventoryInstructions").style.display = "block";
    }
    
    showMessage(
        "Box Opened!",
        "You found a letter inside... Check your inventory!"
    );
    
    setTimeout(() => {
        hideMessage();
        showFinalLetter();
    }, 3000);
}

// Show the final letter
function showFinalLetter(){
    finalLetterText.textContent = yourLetter;
    finalLetterModal.style.display = "flex";
}

// Close final letter
closeFinalLetter.addEventListener("click", () => {
    finalLetterModal.style.display = "none";
    
    showMessage(
        "🎉 Game Complete!",
        "Thank you for playing! Happy Birthday! 🎂"
    );
    
    setTimeout(hideMessage, 5000);
});




// ==================== DEVELOPER TOOLS (REMOVED) ====================

/*
// Skip button removed for production release
// To re-enable for testing, uncomment the button in index.html and this code

const devSkipLevel = document.getElementById("devSkipLevel");

devSkipLevel.addEventListener("click", () => {
    if(gameState === 1){
        // Skip Mission 1 - collect all letters instantly
        console.log("DEV: Skipping Mission 1");
        
        // Auto-collect all remaining letters
        const remainingLetters = document.querySelectorAll(".letter");
        remainingLetters.forEach(letter => {
            if(letter.style.display !== "none"){
                letter.style.display = "none";
                letter.remove();
            }
        });
        
        // Fill in all characters
        const chars = targetWord.split("");
        collectedChars = chars;
        lettersCollected = totalLetters;
        
        // Collect all photocards
        collectedPhotocards = [...photocardPool];
        
        // Update journal
        updateJournalDisplay();
        
        // Mark mission 1 as completed
        mission1Completed = true;
        
        showMessage(
            "DEV: Mission 1 Skipped!",
            "All letters collected. Head to the door to enter Mission 2 (Garden)."
        );
        
        setTimeout(hideMessage, 3000);
        
    } else if(gameState === 2){
        // Skip Mission 2 - collect all pieces instantly
        console.log("DEV: Skipping Mission 2");
        
        // Auto-collect all remaining pieces
        const remainingPieces = document.querySelectorAll(".piece");
        remainingPieces.forEach(piece => {
            if(piece.style.display !== "none"){
                piece.style.display = "none";
                piece.remove();
            }
        });
        
        piecesCollected = totalPieces;
        mission2Completed = true;
        
        // Unlock lightstick
        unlockLightstick();
        
        showMessage(
            "DEV: Mission 2 Skipped!",
            "All pieces collected. Lightstick unlocked! Head to the door for Mission 3."
        );
        
        setTimeout(hideMessage, 3000);
        
    } else if(gameState === 3){
        // Skip Mission 3 - auto open box
        console.log("DEV: Skipping Mission 3");
        
        if(mission3Timer){
            clearInterval(mission3Timer);
        }
        
        openBox();
    }
});

// Keyboard shortcut: Press Shift+S to skip level
document.addEventListener("keydown", (e) => {
    if(e.shiftKey && e.key === "S"){
        devSkipLevel.click();
    }
});
*/

// ==================== IMPROVEMENTS & POLISH ====================

// Sound Effects System
const soundEffects = {
    collect: null,
    success: null,
    click: null
};

// Initialize sound effects (optional - add sound files if you have them)
function initSoundEffects(){
    // You can add sound files like: collect.mp3, success.mp3, click.mp3
    // soundEffects.collect = new Audio("collect.mp3");
    // soundEffects.success = new Audio("success.mp3");
    // soundEffects.click = new Audio("click.mp3");
}

function playSound(soundName){
    if(soundEffects[soundName]){
        soundEffects[soundName].currentTime = 0;
        soundEffects[soundName].play().catch(e => console.log("Sound play failed"));
    }
}

// Progress Tracking
function getGameProgress(){
    return {
        mission1: mission1Completed,
        mission2: mission2Completed,
        mission3: boxOpened,
        lettersCollected: lettersCollected,
        piecesCollected: piecesCollected,
        lightstickUnlocked: lightstickUnlocked,
        lightstickEquipped: lightstickEquipped
    };
}

// Save progress to localStorage
function saveProgress(){
    const progress = getGameProgress();
    localStorage.setItem('smsoumti_progress', JSON.stringify(progress));
}

// Auto-save every 30 seconds
setInterval(saveProgress, 30000);

// FPS counter (hidden, for debugging)
let fps = 0;
let lastTime = performance.now();
let frameCount = 0;

function updateFPS(){
    frameCount++;
    const currentTime = performance.now();
    if(currentTime >= lastTime + 1000){
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        // console.log('FPS:', fps); // Uncomment to see FPS
    }
}

// Smooth camera follow (subtle)
let targetX = x;
let targetY = y;
const cameraSmooth = 0.1;

function updateCamera(){
    targetX += (x - targetX) * cameraSmooth;
    targetY += (y - targetY) * cameraSmooth;
    // Could be used for parallax effects if needed
}
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    if(konamiCode.length > 10) konamiCode.shift();
    
    if(JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)){
        showMessage("🎮 Konami Code!", "You found the secret! All photocards unlocked!");
        collectedPhotocards = [...photocardPool];
        updateJournalDisplay();
        konamiCode = [];
    }
});

// Keyboard shortcuts help
document.addEventListener('keydown', (e) => {
    if(e.key === 'h' || e.key === 'H'){
        if(gameStarted){
            showMessage(
                "⌨️ Keyboard Shortcuts",
                "J - Journal | I - Inventory | H - Help | Arrow Keys/WASD - Move"
            );
            setTimeout(hideMessage, 4000);
        }
    }
});

// Performance optimization: Pause animations when tab not visible
document.addEventListener('visibilitychange', () => {
    if(document.hidden){
        // Pause music if playing
        if(lightstickMusic && !lightstickMusic.paused){
            lightstickMusic.pause();
        }
    } else {
        // Resume music if it was on
        if(lightstickMusic && lightstickOn){
            lightstickMusic.play().catch(e => console.log("Resume failed"));
        }
    }
});

// Double-click protection for all buttons
document.querySelectorAll('button').forEach(btn => {
    let clicking = false;
    btn.addEventListener('click', () => {
        if(clicking) return;
        clicking = true;
        setTimeout(() => clicking = false, 500);
    });
});

// Better error handling
window.addEventListener('error', (e) => {
    console.error('Game error:', e.message);
    // Don't show to user unless critical
});

// Accessibility: High contrast mode toggle
let highContrast = false;
document.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.key === 'h'){
        highContrast = !highContrast;
        document.body.style.filter = highContrast ? 'contrast(1.5) brightness(1.2)' : 'none';
        showMessage("Accessibility", highContrast ? "High contrast ON" : "High contrast OFF");
        setTimeout(hideMessage, 2000);
    }
});

// Completion time tracking
let gameStartTime = Date.now();
let completionTime = 0;

function trackCompletion(){
    completionTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;
    console.log(`Game completed in ${minutes}m ${seconds}s`);
}

// Call this when game completes
closeFinalLetter.addEventListener('click', () => {
    trackCompletion();
});

// Mobile touch support (if needed later)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    if(!gameStarted) return;
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // Simulate keyboard based on touch direction
    if(Math.abs(deltaX) > Math.abs(deltaY)){
        keys['ArrowRight'] = deltaX > 0;
        keys['ArrowLeft'] = deltaX < 0;
    } else {
        keys['ArrowDown'] = deltaY > 0;
        keys['ArrowUp'] = deltaY < 0;
    }
});

document.addEventListener('touchend', () => {
    // Clear all keys
    Object.keys(keys).forEach(key => keys[key] = false);
});

console.log("%c🎮 SMSOUMTI Birthday Adventure", "color: #8b4789; font-size: 20px; font-weight: bold;");
console.log("%cPress H for keyboard shortcuts!", "color: #ffd43b; font-size: 14px;");
console.log("%cMade with ❤️ for a special birthday", "color: #ff6b9d; font-size: 12px; font-style: italic;");
