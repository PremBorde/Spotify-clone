console.log("Welcome to JavaScript")
let currentSong = new Audio(); 

// Add this at the beginning of your script
const hamburger = document.querySelector('.hamburger');
const leftPanel = document.querySelector('.left');

hamburger.addEventListener('click', () => {
    leftPanel.classList.toggle('active');
});

// Optional: Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!leftPanel.contains(e.target) && !hamburger.contains(e.target)) {
        leftPanel.classList.remove('active');
    }
});

// Add these variables at the top with your other declarations
let currentSongIndex = 0;
let songs = [];

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split("/songs/")[1])
        }
    }
    return songs
}
const playMusic = (track) => {
    // Update current song index
    const trackWithMP3 = track + ".mp3";
    currentSongIndex = songs.findIndex(song => song === trackWithMP3);
    
    currentSong.src = "/songs/" + track + ".mp3"
    currentSong.play()
    
    // Update song info in playbar
    let cleanSongName = track.replaceAll("%20", " ").replace(".mp3", "")
    document.querySelector(".song-name").innerHTML = cleanSongName
    document.querySelector(".artist-name").innerHTML = "Artist Name" // You can customize this
    
    // Update song cover (you'll need to map song names to cover images)
    document.querySelector(".song-cover").src = "covers/default-cover.jpg" // Update with actual cover
    
    // Update progress bar and time
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".time-total").innerHTML = formatTime(currentSong.duration)
        updateProgressBar(0)
    })

    currentSong.addEventListener("timeupdate", () => {
        // Update current time
        document.querySelector(".time-current").innerHTML = formatTime(currentSong.currentTime)
        
        // Update progress bar
        const progress = (currentSong.currentTime / currentSong.duration) * 100
        updateProgressBar(progress)
    })
}

// Helper function to format time in MM:SS
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60)
    let remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

// Helper function to update progress bar
function updateProgressBar(progress) {
    const progressBar = document.querySelector(".progress")
    const progressHandle = document.querySelector(".progress-handle")
    progressBar.style.width = `${progress}%`
    progressHandle.style.left = `${progress}%`
}

async function Main(){
  
    // Get the list of all the songs
    songs = await getSongs()
    console.log(songs)

    // Populate the songlist in library
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    
    // Populate the card container
    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = "" // Clear existing cards
    
    for (const song of songs) {
        // Replace %20 with space and remove .mp3 extension
        const cleanSongName = song.replaceAll("%20", " ").replace(".mp3", "")
        
        // Add to library list
        songUl.innerHTML += `<li class="song-item">
            <img class="invert song-icon" src="music.svg" alt="">
            <div class="info">
                <div class="song-title">${cleanSongName}</div>
                <div class="song-artist">PREM</div>
            </div>
            <div class="playnow">
                <span class="play-text">Play Now</span>
                <img class="invert play-icon" src="play.svg" alt="">
            </div> 
        </li>`
        
        // Add to card container
        cardContainer.innerHTML += `
        <div class="card rounded" data-song="${cleanSongName}">
            <img src="music.svg" alt="${cleanSongName}">
            <h3>${cleanSongName}</h3>
            <div class="play">
                <img src="play.svg" alt="Play" class="invert">
            </div>
        </div>`
    }

    // Add event listeners to library songs
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })    
    })

    // Add event listeners to cards
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", () => {
            const songName = card.dataset.song
            playMusic(songName)
        })
    })

    // Get reference to the play button image
    let playButton = document.querySelector("#play-pause-button img")
    
    // Add event listener to the play-pause button
    document.getElementById("play-pause-button").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "play.svg";
        }
    })

    // Add click handler for progress bar
    const progressContainer = document.querySelector(".progress-bar")
    progressContainer.addEventListener("click", (e) => {
        const rect = progressContainer.getBoundingClientRect()
        const clickPosition = e.clientX - rect.left
        const progressPercent = (clickPosition / rect.width) * 100
        const newTime = (progressPercent / 100) * currentSong.duration
        
        currentSong.currentTime = newTime
        updateProgressBar(progressPercent)
    })

    // Add volume slider functionality
    const volumeSlider = document.querySelector(".volume-slider")
    
    // Initialize volume slider with default values
    const initialVolume = currentSong.volume * 100 || 100;
    volumeSlider.querySelector(".progress").style.width = `${initialVolume}%`
    volumeSlider.querySelector(".progress-handle").style.left = `${initialVolume}%`
    
    volumeSlider.addEventListener("click", (e) => {
        const rect = volumeSlider.getBoundingClientRect()
        const clickPosition = e.clientX - rect.left
        const volumePercent = (clickPosition / rect.width) * 100
        
        currentSong.volume = volumePercent / 100
        volumeSlider.querySelector(".progress").style.width = `${volumePercent}%`
        volumeSlider.querySelector(".progress-handle").style.left = `${volumePercent}%`
    })

    // Add drag functionality for seekbar
    let isDraggingSeekbar = false;
    const seekbar = document.querySelector(".seekbar");

    seekbar.addEventListener("mousedown", () => {
        isDraggingSeekbar = true;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDraggingSeekbar) {
            const rect = seekbar.getBoundingClientRect();
            let clickPosition = e.clientX - rect.left;
            
            // Constrain the values between 0 and 100
            clickPosition = Math.max(0, Math.min(clickPosition, rect.width));
            const progressPercent = (clickPosition / rect.width) * 100;
            
            // Update seekbar progress and handle
            seekbar.querySelector(".progress").style.width = `${progressPercent}%`;
            seekbar.querySelector(".circle").style.left = `${progressPercent}%`;
            
            // Update song time
            const newTime = (progressPercent / 100) * currentSong.duration;
            currentSong.currentTime = newTime;
            
            // Update time display
            document.querySelector(".time-current").innerHTML = formatTime(newTime);
        }
    });

    document.addEventListener("mouseup", () => {
        isDraggingSeekbar = false;
    });

    // Add event listeners for next and previous buttons
    document.getElementById("next-button").addEventListener("click", playNextSong);
    document.getElementById("previous-button").addEventListener("click", playPreviousSong);

    // Add event listener for song ended
    currentSong.addEventListener("ended", () => {
        playNextSong();
    });
}

// Add these new functions
function playNextSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    const nextSong = songs[currentSongIndex].replace(".mp3", "");
    playMusic(nextSong);
    updatePlayButton();
}

function playPreviousSong() {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    const previousSong = songs[currentSongIndex].replace(".mp3", "");
    playMusic(previousSong);
    updatePlayButton();
}

// Helper function to update play button state
function updatePlayButton() {
    let playButton = document.querySelector("#play-pause-button img");
    playButton.src = "pause.svg";
}

Main()
