importScripts('config.js');

function getId(fullUrl){
	let videoId = fullUrl.split('v=')[1];
	let ampersandPosition = videoId.indexOf('&');
	if(ampersandPosition != -1) {
		videoId = videoId.substring(0, ampersandPosition);
	}
	return videoId
}

function getStamp(seconds){
    const hours = Math.floor(seconds/3600), mins = Math.floor((seconds%3600)/60),secs = ((seconds%3600)%60);
    if(hours == 0){
        return mins.toString() + "%3A";
    } else {
        return hours.toString() + "%3A" + ((mins < 10) ? ("0" + mins.toString()): (mins.toString())) + "%3A";
    }
}

function getSeconds(duration){
	let arr = [], curr = duration[0], ans = 0;
	for(let i = 1;i<duration.length;i++){
		if((/[a-zA-Z]/).test(duration[i]) === (/[a-zA-Z]/).test(duration[i-1])){
			curr += duration[i];
		} else {
			arr.push(curr);
			curr = duration[i];
		}
	}
	arr.push(curr);
	for(let i = arr.length-2;i>=0;i-=2){
		if((/[a-zA-Z]/).test(arr[i] === false)){
			if(arr[i+1] == 'S'){
				ans += parseInt(arr[i]);
			} else if(arr[i+1] == 'M'){
				ans += parseInt(arr[i])*60;
			} else if(arr[i+1] == 'H'){
				ans += parseInt(arr[i])*3600;
			}
		}
	}
	return ans;
}

function getDuration(vId, apiKey){
	return new Promise((resolve, reject) => {
		let url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" + vId + "&fields=items(contentDetails(duration))&key=" + apiKey.toString();
		fetch(url).then(r => r.text()).then(r => {
			let response = JSON.parse(r);
			resolve(getSeconds(response["items"][0]["contentDetails"]["duration"]));
		});
	});
}

function makeUrl(videoId, apiKey, pageToken){
	const fields = "&fields=items%28snippet%2FtopLevelComment%2Fsnippet%2FtextOriginal%2Csnippet%2FtopLevelComment%2Fsnippet%2FauthorDisplayName%2Csnippet%2FtopLevelComment%2Fid%2Creplies%2Fcomments%28snippet%2FtextOriginal%2Csnippet%2FauthorDisplayName%29%29%2CnextPageToken";
	let url = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&videoId=";
	url += videoId.toString() + "&maxResults=100" + fields + "&key=" + apiKey.toString();
	if(pageToken != -1){
		url += "&pageToken=" + pageToken.toString();
	}
	return url;
}

function filterComments(comments){
	const res = []
	for(var i = 0;i<comments.length;i++){
		let textContent = comments[i]["snippet"]["topLevelComment"]["snippet"]["textOriginal"];
		let user = comments[i]["snippet"]["topLevelComment"]["snippet"]["authorDisplayName"];
		let commentId = comments[i]["snippet"]["topLevelComment"]["id"].trim();
		const allStamps = textContent.match(/[0-9]{0,2}:{0,1}[0-9]{0,2}:[0-9][0-9]\s+/g);
		let replies = getReplies(comments[i]);
		if(allStamps != null){
			const splitContent = textContent.split(new RegExp(/[0-9]{0,2}:{0,1}[0-9]{0,2}:[0-9][0-9]\s+/g));
			for(var j = 0;j<allStamps.length;j++){
				if(splitContent[j] == "" || splitContent[j][splitContent[j].length-1] == " "){
					const timeStamp = {"time": allStamps[j].trim(), "text": textContent, "user": user, "id": commentId, "replies": replies};
					res.push(timeStamp);
				}
			}
		}
	}
	return res;
}

function getReplies(comment) {
	const replies = []
	if (comment["replies"] && comment["replies"]["comments"]) {
		let replyComments = comment["replies"]["comments"];
		for(var i = 0; i < replyComments.length; i++) { 
			replies.push({"text": replyComments[i]["snippet"]["textOriginal"], "user": replyComments[i]["snippet"]["authorDisplayName"]})
		}
	}
	return replies;
}

function fetchComments(vId, apiKey, pageToken){
	return new Promise((resolve, reject) => {
		fetch(makeUrl(vId, apiKey, pageToken)).then(r => r.text()).then(r => {
			let final = JSON.parse(r);
			if(!("nextPageToken" in final)){
				resolve(final["items"]);
			} else {
				fetchComments(vId, apiKey, final["nextPageToken"]).then(r => {
					resolve(final["items"].concat(r));
				});
			}
		});
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  	let url = sender.tab.url;
  	let vId = getId(url);
	// Retrieve API key from storage, then use it in the API calls
    chrome.storage.local.get(['apiKey'], function(result) {
		const apiKey = result.apiKey || config.API_KEY; // Fallback to config.API_KEY if not set
		if(request.getComments === "True"){
			getDuration(vId, apiKey).then(s => {
				fetchComments(vId, apiKey, -1).then(result => {
					sendResponse({"comments": filterComments(result), "videoId": vId, "videoDuration": s-1});
				});
			})
		}
	});
    return true;
});

chrome.runtime.onInstalled.addListener(function() {
	// Remove in case had own key but re-installing the extension on same device.
	chrome.storage.local.remove(['apiKey'],function() {
		var error = chrome.runtime.lastError;
		if (error) {
			console.error(error);
		}
	})

	chrome.storage.local.set({'heatmap': true, 'normalMarker': false, 'density': 1, 'commentView': true, 'primaryColor': [255, 179, 71], 'liveCommentView': true}, function() {
		console.log("Default values set!");
	});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.url){
		const apiKey = config.API_KEY;
		if(/^https:\/\/www\.youtube\.com\/watch/.test(tab.url)){
			if(tab.active){
				let url = tab.url;
				let vId = getId(url);
				chrome.tabs.sendMessage(tabId, {clearElements: true}, function(response) {
					response = response || {}
					if(response.status){
						getDuration(vId, apiKey).then(s => {
							fetchComments(vId, apiKey, -1).then(result => {
								chrome.tabs.sendMessage(tabId, {tabUpdated: true, comments: filterComments(result), videoId: vId, videoDuration: s-1}, function(response) {});
							});
						});
					} else {
						chrome.tabs.executeScript(tabId, {file: "content-script.js"});
					}
				});
			}
        }
	}
	return true;
});


