console.log("🎵 Custom Spotify Clone Loaded");

let currentSong = new Audio();
let songs = [];
let currentAlbum = null;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

async function loadAlbums() {
    let res = await fetch("albums.json");
    let albums = await res.json();
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    albums.forEach((album, index) => {
        let card = document.createElement("div");
        card.classList.add("card");
        card.dataset.album = JSON.stringify(album);

        card.innerHTML = `
      <div class="play"><img src="img/play-button-svgrepo-com.svg" alt="play"></div>
      <img src="${album.cover}" alt="${album.title}">
      <h2>${album.title}</h2>
      <p>${album.description}</p>
    `;


        card.addEventListener("click", () => {
            console.log("Album clicked:", album.title);
            currentAlbum = album;
            songs = album.songs;

            // load first song immediately
            playMusic(songs[0].url, songs[0].name);
            renderSongList();
        });

        cardContainer.appendChild(card);

        if (index === 0) {
            currentAlbum = album;
            songs = album.songs;
            playMusic(songs[0].url, songs[0].name, true); // load first song but don't autoplay
            renderSongList();
        }

    });
}

function renderSongList() {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        let li = document.createElement("li");
        li.innerHTML = `
      <img class="invert" src="img/music.svg" alt="music">
      <div class="info"><div>${song.name}</div></div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="play">
      </div>
    `;
        li.addEventListener("click", () => playMusic(song.url, song.name));
        songUL.appendChild(li);
    });
}

function playMusic(url, name, pause = false) {
    currentSong.src = url;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(name);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

function main() {
    loadAlbums();

    // Hamburger open
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });


    // Play/Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Time update + progress
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        if (!isNaN(currentSong.duration)) {
            const percent = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".circle").style.left = `${percent}%`;
        }
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Prev button
    previous.addEventListener("click", () => {
        let index = songs.findIndex(s => s.url === currentSong.src);
        if (index > 0) playMusic(songs[index - 1].url, songs[index - 1].name);
    });

    // Next button
    next.addEventListener("click", () => {
        let index = songs.findIndex(s => s.url === currentSong.src);
        if (index + 1 < songs.length) playMusic(songs[index + 1].url, songs[index + 1].name);
    });

    // Autoplay next song
    currentSong.addEventListener("ended", () => {
        let index = songs.findIndex(s => s.url === currentSong.src);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1].url, songs[index + 1].name);
        } else {
            playMusic(songs[0].url, songs[0].name); // loop back
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
        document.querySelector(".volume img").src =
            currentSong.volume === 0 ? "img/mute.svg" : "img/volume.svg";
    });

    // Mute toggle
    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
            e.target.src = "img/mute.svg";
        } else {
            currentSong.volume = 0.5;
            document.querySelector(".range input").value = 50;
            e.target.src = "img/volume.svg";
        }
    });
}

main();
