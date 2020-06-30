'use strict';
let start = document.getElementById('btnStart');
let stop = document.getElementById('btnStop');
const userId = "8";
const token = "aksjhfdskj12184y3847@123";

const pcRecording = {};
var localstream;
const socket = io('https://msc2.fireants.vip:1006');

let canvas = new fabric.Canvas('canvas');
let canvasFrame = document.getElementById('canvas');
let stream = canvasFrame.captureStream(30)

let video = document.getElementById('videoSource');
let videoTarget = document.getElementById('videoTarget');
videoTarget.srcObject = stream;
var rect = new fabric.Rect({
    left: 0,
    top: 0,
    fill: 'red',
    width: 15,
    height: 15
  });

canvas.add(rect);


const videoSource = new fabric.Image(video, {
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center',
    objectCaching: false,
  });



stop.style.display = 'none'
// Register
let body = {
    "userId": userId.toString(),
    "token": token
}

$.ajax({
    beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("userid", userId.toString());
        xhrObj.setRequestHeader("token", token);
    },
    url: "https://msc2.fireants.vip:1006/v0/subscribers",
    type: "POST",
    data: JSON.stringify(body),
    success: function (data) { alert('data: ' + JSON.stringify(data)); },
    contentType: "application/json",
    dataType: 'json'
});

function onOfferPresenter(error, offerSdp) {
    if (error) {
        console.log('onOfferPresenter', error);
        return
    }
    /*
    Dong goi ban tin gui len Server
     */

    let data = {
        userId: userId,
        token: token,
        sdp: offerSdp,
        option1: "Option1 chua co du lieu",
        option2: "Option2 chua co du lieu",
        option3: "Option3 chua co du lieu",
    }
    // Send socket to Server to create call
    console.log('onOfferPresenter send server:', data);
    socket.emit('P_STARTRECORDING', data);
}


function onIceCandidate(candidate) {
    // Send the candidate to the remote peer

    let data = {
        userId: userId,
        token: token,
        candidate: candidate
    }
    console.log('onIceCandidate send to server:', data);
    socket.emit('P_CANDIDATE', data);


    console.log('onIceCandidate: tu gen candidate', candidate);
    if (pcRecording.listCandidate == undefined) pcRecording.listCandidate = [];
    if (candidate) {
        pcRecording.listCandidate.push(candidate); // Luu cac candidate lai
    } else {
        pcRecording.candidate = 1;
    }


}

socket.on('U_OFFERSDP', (data) => {
    // Su kien xu ly offer SDP tu server tra ve
    try {
        console.log('U_OFFERSDP:', data)
        if (data && data.sdp && pcRecording && pcRecording.pc) { // Neu 2 doi tuong khac undefined

            pcRecording.pc.processAnswer(data.sdp);
        }
    } catch (e) {
        console.log('[U_OFFERSDP]:', e);
    }
})
socket.on('U_CANDIDATE', (data) => {
    // Su kien xu ly khi nhan duoc candidate
    try {
        console.log('U_CANDIDATE:', data)
        if (data && data.candidate && pcRecording && pcRecording.pc) { // Neu 2 doi tuong khac undefined

            if (data.candidate) {

                pcRecording.pc.addIceCandidate(data.candidate)
            } else {
                pcRecording.pc.addIceCandidate('')

            }
        }
    } catch (e) {
        console.log('[U_CANDIDATE] exception:', e);
    }
})

let media = {
    audio: true,
    video: true
}



navigator.mediaDevices.getUserMedia(media).then(function (mediaStreamObj) {
    



    start.addEventListener('click', function (ev) {
        video.srcObject = mediaStreamObj
        // video.play()


        canvas.add(videoSource);
        videoSource.getElement().play();
        videoTarget.play()
        
        

        if (stream) {
            localstream = stream;
        }

        let options = {
            videoStream: localstream,
            onicecandidate: onIceCandidate
        }
        let webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
            if (error) {
                console.log('Error when create webRTCPeer:', error);
                return;
            }
            this.generateOffer(onOfferPresenter);
        });
        pcRecording.pc = webRtcPeer;

        start.style.display = 'none'
        stop.style.display = null
    })

    stop.addEventListener('click', function (ev) {
        video.srcObject = null
        stop.style.display = 'none'
        start.style.display = null

    })


}).catch(function (err) {
    console.log(err.name, err.message)
})

$("#app-video ").hide()

$("#libButton").click(function () {
    $("#app-video ").slideToggle()
})