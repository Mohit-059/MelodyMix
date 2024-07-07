document.querySelector(".abouttxt").addEventListener("mouseenter", () => {
    document.querySelector(".aboutimg").style.opacity = "1";
});

document.querySelector(".abouttxt").addEventListener("mouseleave",()=>{
    document.querySelector(".aboutimg").style.opacity = "0.5";
})

let songs = [];
let currentSong = new Audio();
let isPlaying = false;
let currentTrack;
let currentTarget;
songprog.value=0;
vol.value=100;
let pv = currentSong.volume;
let currFolder;

function formatTime(secondsFloat) {
    // Convert floating-point seconds to whole seconds
    let totalSeconds = Math.floor(secondsFloat);

    // Calculate minutes and seconds
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    // Ensure both minutes and seconds are two digits
    let formattedMinutes = ('0' + minutes).slice(-2);
    let formattedSeconds = ('0' + seconds).slice(-2);

    // Return formatted time string
    return formattedMinutes + ':' + formattedSeconds;
}


async function getSongs(folder){
    currFolder = folder;
    //Data fetch karliya 
    let data = await fetch(`/songs/${folder}`)
    let datatext = await data.text();

    //ab ek div jisme ye sab data temporarily jaayega :-
    let div = document.createElement("div")
    div.innerHTML = datatext;

    //get the anchors with songs
    let allanchors = div.getElementsByTagName("a");
    Array.from(allanchors)

    songs = [];

    //loop lagake get all anchors
    for (let index = 0; index < allanchors.length; index++) {
        const element = allanchors[index];

        //check if anchors contains song
        if(element.href.endsWith("mp3")){
            //get all songs in the songs array
            let s = element.href.split('/').pop().replaceAll('%20'," ")
            songs.push(s)
        }
        
    }

    //get song's ul jaha songs print karne hai
    let songUl = document.querySelector(".leftsonglist ul");
    songUl.innerHTML = ""
    //songs ki list mai li add karo so that it will get printed
    for (const e of songs) {
        songUl.innerHTML += `<li><img class="invert" src="music.svg" alt=""><span class="songname">${e}</span><img class="invert" src="play.svg" alt=""></li>`;        
    }

    
    //Make an array of the song list
    Array.from(document.querySelector(".leftsonglist").getElementsByTagName("li")).forEach(ele=>{
        //ele will get songs one by one
        ele.addEventListener("click",()=>{
            let track = ele.querySelector(".songname").innerHTML.trim();

            if(track === currentTrack){
                if(isPlaying){
                    currentSong.pause();
                    ele.lastElementChild.src='play.svg'
                    isPlaying = false;
                }
                else{
                    currentSong.play();
                    ele.lastElementChild.src = 'pause.svg'
                    isPlaying = true;
                }
                updateMainPlay();
                return;
            }
            


            //adding target class to clicked song
            currentTarget = document.querySelector(".leftsonglist .target");
            if (currentTarget) {
                currentTarget.classList.remove("target");
                currentTarget.lastElementChild.src = 'play.svg'
            } 

            musicPlay(track);
            let a = document.querySelector(".playersongname");
            a.innerHTML = track;

            // Add the 'target' class to the currently clicked song
            ele.classList.add("target");
            ele.lastElementChild.src = 'pause.svg'
            currentTrack = track;
            currentTarget = ele;
            isPlaying = true;
            updateMainPlay();
        })
    })

}

const updateMainPlay = () => {
    document.querySelector("#mainplay").src = isPlaying ? "pause.svg" : "play.svg";
};


const musicPlay=(track)=>{
    currentSong.src = `/songs/${currFolder}/${track}`;
    currentSong.play();
    isPlaying = true;
    currentTrack = track;
    mainplay.src = "pause.svg"
}

async function displayAll(){
    let a = await fetch("/songs/");
    let atext = a.text();

    let artistcont = document.querySelector(".artistscont")

    let div = document.createElement("div");
    div.innerHTML = await atext;


    let allanchors = Array.from(div.getElementsByTagName("a"))
    for (let index = 0; index < allanchors.length; index++) {
        const e = allanchors[index];
        if(e.href.includes('/songs/')){
            let folder = e.href.split('/').slice(-2)[0];

            let folderresponse = await fetch(`/songs/${folder}/info.json`);
            let folderinfo = await folderresponse.json();

            let cardhtml = `<div data-folder="${folder}" class="card">
                            <div class="poster">
                                <img src="/songs/${folder}/cover.jpg" alt="">
                            </div>
                            <div class="carddown">
                                <span class="cardhead">${folderinfo.title}</span>
                                <span class="cardtxt">${folderinfo.desc}</span>
                            </div>
                            <div class="hoverplay">
                                <img src="hoverplay.svg" alt="">
                            </div>
                        </div>`;
            if(folder.startsWith("mood")){
                continue;
            }
            else{
                artistcont.innerHTML += cardhtml;
            }
        }
        
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async ele =>{
            //currentTarget = either image or any other component is clicked the parent element will be selected
            await getSongs(ele.currentTarget.dataset.folder);
            //default 
            // ig songs array is empty
            if(songs.length > 0){
                document.querySelector(".playersongname").innerHTML = songs[0]
                musicPlay(songs[0])
            }
            
        })
    })

}

async function main() {
    await displayAll();
    await getSongs("All");

    mainplay.addEventListener("click",()=>{
        if(!currentSong.paused){
            currentSong.pause();
            mainplay.src = "play.svg"
            if(currentTarget){
                currentTarget.lastElementChild.src = "play.svg"
            }
            isPlaying = false;
        }
        else{
            currentSong.play();
            mainplay.src = "pause.svg"
            if(currentTarget){
                currentTarget.lastElementChild.src = "pause.svg"
            }
            isPlaying = true;
        }
        updateMainPlay();
    })

    currentSong.addEventListener("timeupdate",()=>{
        let crnttime = currentSong.currentTime;
        let songdur = currentSong.duration;
        document.querySelector(".durr").innerHTML = `${formatTime(crnttime)}/${formatTime(songdur)}`
        document.getElementById("songprog").value = (crnttime / songdur) * 100 ;
    })

    document.querySelector(".seekbar").addEventListener("click",e=>{
        // getBoundingClientRect().width will get the width of the bar clicked
        // the offset X means the x axis position clicked / the width of bar
        let prog = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.getElementById("songprog").value = prog ;
        currentSong.currentTime = (currentSong.duration * prog)/100;
    })


    // let nxt = document.getElementById("nxt");
    nxt.addEventListener("click",()=>{
        console.log(currentSong.src)
        let currentSrc = currentSong.src.split('/').pop().replaceAll('%20', ' ');
        let crntindex = songs.indexOf(currentSrc);
        let nxtindex = crntindex + 1;
        if (nxtindex == -1 || nxtindex == songs.length) {
            nxtindex = 0;
        }
        let nextTrack = songs[nxtindex];
        musicPlay(nextTrack);
        document.querySelector(".playersongname").innerHTML = nextTrack;
        if (currentTarget) {
            currentTarget.classList.remove("target");
            currentTarget.lastElementChild.src = 'play.svg';
        }
        let newTarget = Array.from(document.querySelectorAll(".leftsonglist .songname")).find(ele => ele.innerHTML.trim() === nextTrack).parentElement;
        newTarget.classList.add("target");
        newTarget.lastElementChild.src = 'pause.svg';
        currentTrack = nextTrack;
        currentTarget = newTarget;
        isPlaying = true;
        updateMainPlay();
    })

    prv.addEventListener("click",()=>{
        console.log(currentSong.src)
        let currentSrc = currentSong.src.split('/').pop().replaceAll('%20', ' ');
        let crntindex = songs.indexOf(currentSrc);
        let prvindex = crntindex - 1;
        if(prvindex < 0){
            prvindex = songs.length - 1;
            
        }
        let prvTrack = songs[prvindex];
        musicPlay(prvTrack);
        if(currentTarget){
            currentTarget.classList.remove("target");
            currentTarget.lastElementChild.src = "play.svg"
        }
        //prvTrack = songs[prvindex]
        //newtarget = all songs list
        //.find(ele => ele.innerHTML.trim()) will go through all songs and check the matching card without extra spaces
        let newTarget = Array.from(document.querySelectorAll(".leftsonglist .songname")).find(ele => ele.innerHTML.trim() === prvTrack).parentElement;
        document.querySelector(".playersongname").innerHTML = prvTrack
        newTarget.classList.add("target")
        newTarget.src = "pause.svg";
        currentTrack = prvTrack;
        currentTarget = newTarget;
        isPlaying = true;
        updateMainPlay();
    })







    // Seekbar edit for Touch devices

    document.getElementById("songprog").addEventListener("input", (e) => {
        // Update song's current time based on seekbar's value
        let prog = e.target.value;
        currentSong.currentTime = (currentSong.duration * prog) / 100;
        document.querySelector(".durr").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    });

    document.querySelector(".seekbar").addEventListener("touchstart", (e) => {
        // Call updateSeekbar with the x position of the touch
        updateSeekbar(e.touches[0].clientX);
        e.preventDefault();
    });

    document.querySelector(".seekbar").addEventListener("touchmove", (e) => {
        // Call updateSeekbar with the x position of the touch
        updateSeekbar(e.touches[0].clientX);
        e.preventDefault();
    });

    // Added the `updateSeekbar` function
    const updateSeekbar = (x) => {
        const seekbarWidth = document.querySelector(".seekbar").getBoundingClientRect().width;
        const clickX = x - document.querySelector(".seekbar").getBoundingClientRect().left;
        const progress = (clickX / seekbarWidth) * 100;
        document.getElementById("songprog").value = progress;
        currentSong.currentTime = (currentSong.duration * progress) / 100;
        document.querySelector(".durr").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    };

    // Seekbar edit for touch devices ends









    vol.addEventListener("change",e=>{
        currentSong.volume = e.target.value / 100;
        let v = e.target.value;
        if(v != 0 && v <= 49 ){
            speaker.src = "midvol.svg"
        } 
        else if(v == 0){
            speaker.src = "mute.svg"
        }
        else{
            speaker.src = "speaker.svg"
        }
        
    })

    

    speaker.addEventListener("click",()=>{
        
        if(speaker.src.includes("mute.svg")){
            console.log(pv*100)
            currentSong.volume = pv;
            vol.value = pv*100;
            if(pv >= 49){
                speaker.src = "midvol.svg"
            }
            else{
                speaker.src = "speaker.svg"
            }

        }
        else{
            pv = currentSong.volume;
            speaker.src = "mute.svg"
            currentSong.volume = 0;
            vol.value = 0;
        }
    })

    document.querySelector(".thlines").addEventListener("click",()=>{
        document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".cross").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-500px";
    })

}  


main();


function gotohome(){
    window.location.href = "index.html";
}

function gotoabout(){
    window.location.href = "about.html";
}

function gotofeedback(){
    window.location.href = "feedback.html";
}

function gotoartists(){
    window.location.href = "artists.html";
}