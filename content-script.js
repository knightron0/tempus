let config = {
    heatmap: true,
    normalMarker: false,
    density: 1,
    commentView: true,
    primaryColor: [255, 179, 71],
    liveCommentView: true
};
let videoId = "", commentsTime = {}, freq = {}, commentsResponse = "", commentsReceived = false, videoDuration = -1;

function editContent(content){
    const splitContent = content.split(" ");
    let charCount = 0, ans = "";
    for (let i= 0; i < splitContent.length; i++){
        if(charCount + splitContent[i].length > 150){
            break;
        }
        charCount += splitContent[i].length+1;
        ans += splitContent[i] + ' ';
    }
    ans = ans.substring(0, ans.length-1);
    return ans;
}

function makeCommentDiv(user, content, timestamp, id, isLive, parity, replies){
    const commentContainer = document.createElement('div');
    commentContainer.style.padding = "10px";
    commentContainer.style.fontSize = "13px";
    commentContainer.style.fontFamily = "Roboto";
    if (parity == 1) {
        commentContainer.style.backgroundColor = "#1E1E1E";
    }
    if (isLive) {
        commentContainer.className = timestamp.toString();
    }
    const username = document.createElement('div');
    username.style.float = "left";
    username.style.color = "#999999";
    username.style.display = "inline";
    username.style.fontWeight = "bold";
    username.style.lineHeight = "16px";
    username.innerHTML = user.toString();
    const contentContainer = document.createElement('div');
    contentContainer.style.color = "white";
    contentContainer.style.overflowWrap = "break-word";
    contentContainer.style.display = "inline";
    contentContainer.style.marginLeft = "8px";
    contentContainer.style.whiteSpace = "pre-wrap";
    contentContainer.style.lineHeight = "16px";
    contentContainer.id = (isLive ? (id.toString() + timestamp.toString() + "Live") : (id.toString() + timestamp.toString()));
    if (content.length > 150) {
        // showless element
        const showLess = document.createElement('a');
        showLess.id = id.toString() + (isLive ? ("_aLiveLess") : ("_aLess"));
        showLess.style.color = "#ABABAA";
        showLess.style.cursor = "pointer";
        showLess.style.fontWeight = "bold";
        showLess.innerHTML = "Show less";
        // readmore element
        const readMore = document.createElement('a');
        readMore.id = id.toString() + (isLive ? ("_aLive") : ("_a"));
        readMore.style.color = "#ABABAA";
        readMore.style.cursor = "pointer";
        readMore.style.fontWeight = "bold";
        readMore.innerHTML = "Read more";
        // setting up content container
        contentContainer.innerHTML = editContent(content) + " ...";
        contentContainer.appendChild(readMore);
        // onclick functions
        readMore.onclick = function(){
            const x = document.getElementById((id.toString() + timestamp.toString() + (isLive ? "Live" : "")));
            x.innerHTML = content +  "\n";
            x.appendChild(showLess);
        }
        showLess.onclick = function(){
            const x = document.getElementById((id.toString() + timestamp.toString() + (isLive ? "Live" : "")));
            x.innerHTML = editContent(content) + " ...";
            x.appendChild(readMore);
        }
    } else {
        contentContainer.innerHTML = content;
    }
    
    // Drop-down arrow for replies
    const toggleArrow = document.createElement('span');
    toggleArrow.style.cursor = "pointer";
    toggleArrow.style.marginLeft = "5px";
    toggleArrow.style.color = "#ABABAA";
    toggleArrow.innerHTML = "▼";
    toggleArrow.onclick = () => {
        repliesContainer.style.display = repliesContainer.style.display === "none" ? "block" : "none";
        toggleArrow.innerHTML = repliesContainer.style.display === "none" ? "▼" : "▲";
        replyCountText.style.display = replyCountText.style.display === "none" ? "inline" : "none";
    };

    // Reply count
    const replyCountText = document.createElement('span');
    if (replies.length == 1) {
        replyCountText.innerHTML = `${replies.length} reply`;
    } else {
        replyCountText.innerHTML = `${replies.length} replies`;
    }
    replyCountText.style.color = "#ABABAA";
    replyCountText.style.fontSize = "12px";
    replyCountText.style.marginLeft = "5px";

    replyCountText.onclick = () => {
        repliesContainer.style.display = repliesContainer.style.display === "none" ? "block" : "none";
        toggleArrow.innerHTML = repliesContainer.style.display === "none" ? "▼" : "▲";
        replyCountText.style.display = replyCountText.style.display === "none" ? "inline" : "none";
    };

    // Container for replies
    const repliesContainer = document.createElement('div');
    repliesContainer.style.display = "none";
    repliesContainer.style.marginTop = "8px";
    repliesContainer.style.paddingLeft = "15px";
    repliesContainer.style.borderLeft = "2px solid #555";

    // Populate replies
    replies.forEach(reply => {
        const replyDiv = document.createElement('div');
        replyDiv.style.marginBottom = "5px";
        replyDiv.style.color = "#CCCCCC";

        const replyUser = document.createElement('span');
        replyUser.style.fontWeight = "bold";
        replyUser.style.color = "#999999";
        replyUser.innerText = reply.user + " ";

        const replyText = document.createElement('span');
        replyText.innerText = reply.text;

        replyDiv.appendChild(replyUser);
        replyDiv.appendChild(replyText);
        repliesContainer.appendChild(replyDiv);
    });

    commentContainer.appendChild(username);
    commentContainer.appendChild(contentContainer);
    if (replies.length > 0) {
        commentContainer.appendChild(toggleArrow);
        commentContainer.appendChild(replyCountText);
        commentContainer.appendChild(repliesContainer);
    }
    return commentContainer;
}

function makePanel(ifLive){
    let allPanels = document.getElementById("secondary-inner"), panelContainer = document.createElement("div");
    panelContainer.id = (ifLive ? "liveCommentView" : "commentView");
    panelContainer.style.backgroundColor = "black";
    panelContainer.style.maxHeight = "400px";
    panelContainer.style.marginBottom = "10px";
    panelContainer.style.borderRadius = "2px";
    panelContainer.style.display = "none";
    if (ifLive && config.liveCommentView) {
        panelContainer.style.display = "block";
    }
    panelContainer.style.border = "1px solid #313031"
    // building the header div
    let headerHtml = "";
    if (ifLive) {
        headerHtml = `
        <div id="panelHeader" style="position: relative; width:100%; height: 60px; background-color: #1D1D1D; border-radius: 2px 2px 0px 0px;">
            <div style="float:left; font-size: 16px; color:white; padding-top: 5%; padding-bottom:5%; padding-left:16px; font-family: 'Roboto';">Comments Replay</div>
            <button id="liveCommentPanelButton" style="position: relative; border:none; float:right; top: 15%; background-color: transparent; outline: none; color: white; font-size: 35px; margin-right: 2%; cursor:pointer;">×</button>
        </div>`
    } else {
        headerHtml = `
        <div id="panelHeader" style="position: relative; width:100%; height: 60px; background-color: #1D1D1D; border-radius: 2px 2px 0px 0px;">
            <div style="float:left; font-size: 16px; color:white; padding-top: 5%; padding-bottom:5%; padding-left:16px; font-family: 'Roboto';">Comments</div>
            <div id="timestampView" style="position: relative; float:left; background-color: #24283A;font-size: 16px; color: #3EA6FF; top: 30%; margin-left: 2%; padding: 2px 5px 2px 5px; border-radius: 3px;">1:15:30</div>
            <button id="commentPanelButton" style="position: relative; border:none; float:right; top: 15%; background-color: transparent; outline: none; color: white; font-size: 35px; margin-right: 2%; cursor:pointer;">×</button>
        </div>`
    }
    const placeholderURL = chrome.runtime.getURL('assets/placeholder.png');
    panelContainer.innerHTML = headerHtml;
    // building the content div
    const contentHtml = (ifLive ? `<div id="livePanelContent" style="position: relative; width:100%; height: 340px; overflow-y: auto;"><img id="placeholderImg" src='` + placeholderURL + `' style="width:40%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity:70%; display: block; user-select: none; -webkit-user-drag: none;"></img></div>`: `<div id="panelContent" style="position: relative; width:100%; max-height: 340px; overflow-y: auto;"></div>`);
    panelContainer.innerHTML += contentHtml;
    allPanels.insertBefore(panelContainer, allPanels.firstChild);
}

function getSeconds(timestamp){
	let tm = timestamp.split(":");
	let num = 0, curr = tm.length-1;
	for(let i = 0; i < tm.length; i++){
		tm[i] = parseInt(tm[i]);
		num += (tm[i]*(60**(curr)));
		curr--;
	}
	return num;
}

function getStamp(seconds){
    const hours = Math.floor(seconds/3600), mins = Math.floor((seconds%3600)/60),secs = ((seconds%3600)%60);
    if(hours == 0){
        return (secs < 10) ? (mins.toString() + ":0" + secs.toString()) : (mins.toString() + ":" + secs.toString());
    } else {
        return hours.toString() + ":" + ((mins < 10) ? ("0" + mins.toString()): (mins.toString())) + ":" + ((secs < 10) ? ("0" + secs.toString()): (secs.toString()))
    }
}

function makeRGBA(mxFreq, currFreq){
	let val = 0.25 + ((currFreq/mxFreq)*0.75);
    if(currFreq == 0){
        val = 0.00;
    }
	let res = "rgba("+config.primaryColor[0].toString()+","+config.primaryColor[1].toString()+","+config.primaryColor[2].toString()+"," + val.toString() + ")";
	return res;
}

function removeClass(c){
    let divs = document.getElementsByClassName(c);
    if(divs == undefined) {
        return false;
    }
    while(divs[0]){
        divs[0].parentNode.removeChild(divs[0]);
    }
    return true;
}

function onClickMarker(timestamp){
    const vid = document.getElementsByClassName("video-stream html5-main-video")[0];
    vid.currentTime = timestamp;
    if(config.commentView){
        document.getElementById("commentView").style.display = "block";
        document.getElementById("timestampView").innerHTML = (config.density === 1) ? getStamp(timestamp) : getStamp(timestamp) + " — " + getStamp(timestamp+config.density-1);
        document.getElementById("panelContent").innerHTML = "";
        for(let j = timestamp; j < timestamp+config.density; j++){
            if(j in commentsTime){
                for(let i = 0; i < commentsTime[j].length; i++){
                    let divCommentView = makeCommentDiv(commentsTime[j][i][1], commentsTime[j][i][0], -1, commentsTime[j][i][2], false, i&1, commentsTime[timestamp][i][3]);
                    document.getElementById("panelContent").appendChild(divCommentView);
                }
            }
        }
    }
}

function makeMarkers(response, mxHeight, ifHeatmap){
    const container = document.getElementsByClassName("ytp-chrome-controls"), totalSeconds = videoDuration;
    const w = (container[0].getBoundingClientRect()["width"])/totalSeconds;
    let mx = 0, keyframeAnimation = "@keyframes hoverOnMarker { from {height: "+ mxHeight.toString() + "px;} to {height: "+ (mxHeight*2).toString() + "px;} }"
    let cssHover = (ifHeatmap ? ".heatmapBar" : ".normalMarker") + ":hover { animation-name: hoverOnMarker; animation-duration: 0.1s; animation-fill-mode: forwards; transform:scale(1.5); background:"+makeRGBA(1, 1)+"!important;}";
    let style = document.createElement('style');
    if(style.styleSheet){
        style.styleSheet.cssText = keyframeAnimation + cssHover;
    } else {
        style.appendChild(document.createTextNode(keyframeAnimation));
        style.appendChild(document.createTextNode(cssHover));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
    for(let i = 0; i <= totalSeconds; i += config.density){
        let freqTotal = 0;
        for(let j = i; j < i+config.density; j++){
            freqTotal += (j in freq) ? freq[j] : 0;
        }
        mx = Math.max(freqTotal, mx);
    }
    for(let i = 0; i <= totalSeconds; i += config.density){
        let freqNum = 0;
        for(let j = i; j < i+config.density; j++){
            freqNum += (j in freq) ? freq[j] : 0;
        }
        if(!freqNum){
            continue;
        }
        const num = i, bar = document.createElement("div");
        bar.style.position = "absolute";
        bar.style.width = (w*config.density).toString()+"px";
        bar.style.height = mxHeight.toString() + "px";
        // bar.style.top = (-mxHeight).toString() + "px";
        bar.style.background = (ifHeatmap ? makeRGBA(mx, freqNum) : makeRGBA(1, 1));
        bar.style.borderRadius = "0% 0% 3px 3px";
        bar.style.left = (w*num).toString()+"px";
        bar.style.cursor = "pointer";
        bar.className = (ifHeatmap ? "heatmapBar" : "normalMarker");
        bar.id = num.toString();
        bar.addEventListener('click', function() {
            onClickMarker(num);
        });
        document.getElementsByClassName("ytp-chrome-controls")[0].appendChild(bar);
    }
}

function clearAllElements(){
    commentsTime = {};
    commentsResponse = "";
    videoId = "";
    videoDuration = -1;
    commentsReceived = false;
    removeClass("heatmapBar");
    removeClass("normalMarker");
    if(document.getElementById("commentView") != undefined){
        document.getElementById("commentView").remove();
    }
    if(document.getElementById("liveCommentView") != undefined){
        document.getElementById("liveCommentView").remove();
    }
}

function toggleClass(c){
	let divs = document.getElementsByClassName(c);
	for(let i = 0;i<divs.length;i++){
        divs[i].style.visibility = (divs[i].style.visibility == "hidden") ? "visible" : "hidden";
        divs[i].style.display = (divs[i].style.display == "none") ? "block" : "none";
    }
}

function rerender(){
    removeClass("heatmapBar");
    removeClass("normalMarker");
    makeMarkers(commentsResponse, 10, false);
    makeMarkers(commentsResponse, 10, true);
    if(!config.heatmap) toggleClass("heatmapBar");
    if(!config.normalMarker) toggleClass("normalMarker");
}

function initialize(response){
    freq = {};
    for(let i = 0;i<response.length;i++){
        const num = getSeconds(response[i]["time"]);
        response[i]["text"] = response[i]["text"].replace(/\n\n+/g, '\n\n');
        freq[num] = (num in freq) ? freq[num]+1 : 1;
    }
	makeMarkers(response, 10, true);
    makeMarkers(response, 10, false);
    if(!config.heatmap) toggleClass("heatmapBar");
    if(!config.normalMarker) toggleClass("normalMarker");
    commentsTime = {};
    for(let i = 0;i<response.length;i++){
        let num = getSeconds(response[i]["time"]);
        if(num in commentsTime){
            commentsTime[num].push([response[i]["text"], response[i]["user"], response[i]["id"], response[i]["replies"]]);
        } else {
            commentsTime[num] = [[response[i]["text"], response[i]["user"], response[i]["id"], response[i]["replies"]]];
        }
    }
    commentsResponse = response;
    commentsReceived = true;
    makePanel(false);
    makePanel(true);
    buttonClose = document.getElementById('commentPanelButton');
    buttonClose.addEventListener('click', function(){
        document.getElementById("commentView").style.display = "none";
    });
    buttonClose = document.getElementById('liveCommentPanelButton');
    buttonClose.addEventListener('click', function(){
        document.getElementById("liveCommentView").style.display = "none";
        config.liveCommentView = false;
        chrome.storage.local.set({'liveCommentView': config.liveCommentView}, function() {});
    });
}

chrome.storage.local.get(['heatmap', 'normalMarker', 'density', 'commentView', 'primaryColor', 'liveCommentView'], function(result) {
    config.heatmap = result.heatmap;
    config.normalMarker = result.normalMarker;
    config.density = result.density;
    config.commentView = result.commentView;
    config.primaryColor = result.primaryColor;
    config.liveCommentView = result.liveCommentView;
});

chrome.runtime.sendMessage({getComments: "True"}, function(response) {
    freq = {};
    clearAllElements();
    videoId = response["videoId"];
    videoDuration = response["videoDuration"];
    response = response["comments"];
    initialize(response);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.clearElements){
            clearAllElements();
            sendResponse({status: true});
        }
        if(request.tabUpdated){
            clearAllElements();
            videoId = request.videoId;
            videoDuration = request.videoDuration;
            initialize(request.comments);
            sendResponse({status: true});
        }
        if(request.toggleHeatmap){
            toggleClass("heatmapBar");
            config.heatmap = !config.heatmap;
            chrome.storage.local.set({'heatmap': config.heatmap}, function() {});
            sendResponse({status: true});
        }
        if(request.toggleMarkers){
            toggleClass("normalMarker");
            config.normalMarker = !config.normalMarker;
            chrome.storage.local.set({'normalMarker': config.normalMarker}, function() {});
            sendResponse({status: true});
        }
        if(request.densityChange){
            config.density = parseInt(request.densityValue);
            rerender();
            chrome.storage.local.set({'density': config.density}, function() {});
            sendResponse({status: true});
        }
        if(request.primaryColorChange){
            config.primaryColor = request.colorValue;
            rerender();
            chrome.storage.local.set({'primaryColor': config.primaryColor}, function() {});
            sendResponse({status: true});
        }
        if(request.toggleComments){
            config.commentView = !config.commentView;
            chrome.storage.local.set({'commentView': config.commentView}, function() {});
            sendResponse({status: true});
        }
        if(request.toggleLiveComments){
            config.liveCommentView = !config.liveCommentView;
            if(config.liveCommentView){
                document.getElementById("liveCommentView").style.display = "block";
            } else {
                document.getElementById("liveCommentView").style.display = "none";
            }
            chrome.storage.local.set({'liveCommentView': config.liveCommentView}, function() {});
            sendResponse({status: true});
        }
        if(request.retrieveStatus){
            if(commentsReceived){
                sendResponse({loadingComments: false, nonzero: (commentsResponse!="")});
            } else {
                sendResponse({loadingComments: true, nonzero: false});
            }
        }
        return true;
    }
);

// Tracks the last currentTimestamp processed during the previous ontimeupdate event
let prevTimestamp = -1;

const vid = document.getElementsByClassName("video-stream html5-main-video")[0];
vid.ontimeupdate = function() {
    const liveContent = document.getElementById("livePanelContent");
    const currentTimestamp = Math.floor(vid.currentTime);

    if (liveContent && currentTimestamp < prevTimestamp) {
        // Handle backwards scrubbing
        // Remove comment divs that have timestamps after the currentTimestamp
        const comments = liveContent.getElementsByTagName('div');
        for (let i = comments.length - 1; i >= 0; i--) {
            const commentTimestamp = parseInt(comments[i].className);
            if (commentTimestamp > currentTimestamp) {
                liveContent.removeChild(comments[i]);
            }
        }
    }

    if(liveContent != undefined && (liveContent.getElementsByTagName('div').length === 0 || liveContent.lastElementChild.className != currentTimestamp.toString()) && config.liveCommentView){
        let prevTime = -1;
        if (liveContent.getElementsByTagName('div').length !== 0) {
            prevTime = parseInt(liveContent.lastElementChild.className);
        }
        for (let timestamp = prevTime + 1; timestamp < currentTimestamp; timestamp++) {
            if(timestamp in commentsTime){
                for(let i = 0; i < commentsTime[timestamp].length; i++){
                    const existingElement = document.getElementById(commentsTime[timestamp][i][2] + timestamp.toString() + "Live");
                    if ((existingElement != undefined) && (existingElement.parentElement != undefined)) {
                        existingElement.parentElement.remove();
                    }
                    const placeholderImg = document.getElementById("placeholderImg");
                    if (placeholderImg != undefined) {
                        placeholderImg.style.display = 'none';
                    }
                    divCommentView = makeCommentDiv(commentsTime[timestamp][i][1], commentsTime[timestamp][i][0], timestamp, commentsTime[timestamp][i][2], true, liveContent.getElementsByTagName('div').length & 1, commentsTime[timestamp][i][3]);
                    liveContent.appendChild(divCommentView);
                    liveContent.scrollTop = liveContent.scrollHeight;
                }
            }
        }
    }
    // Update prevTimestamp at the end
    prevTimestamp = currentTimestamp;
};

let resizeObserver = new ResizeObserver(() => {
    if(commentsResponse != ""){
        rerender();
    }
});
resizeObserver.observe(document.getElementsByClassName("ytp-progress-bar-container")[0]);
