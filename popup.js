function isValidHex(str) {
    return str.match(/^#[a-f0-9]{6}$/i) !== null;
}

function hexToRGB(str){
    var ans = [0, 0, 0];
    var splt = [str[0] + str[1], str[2] + str[3], str[4] + str[5]];
    for(var i = 0; i < 3; i++){
        ans[i] = parseInt(splt[i], 16);
    }
    return ans;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(!(/^https:\/\/www\.youtube\.com\/watch/.test(tabs[0].url))){
            document.getElementById("settings").style.display = "none";
            document.getElementById("loadingComments").style.display = "none";
            document.getElementById("otherURL").style.display = "block";
            document.getElementById("noComments").style.display = "none";
            document.body.style.height = "55px";
        } else {
            chrome.tabs.sendMessage(tabs[0].id, {retrieveStatus: true}, function(response) {
                if(response.loadingComments){
                    document.getElementById("settings").style.display = "none";
                    document.getElementById("loadingComments").style.display = "block";
                    document.getElementById("otherURL").style.display = "none";
                    document.getElementById("noComments").style.display = "none";
                    document.body.style.height = "40px";
                } else {
                    if(response.nonzero){
                        document.getElementById("settings").style.display = "block";
                        document.getElementById("loadingComments").style.display = "none";
                        document.getElementById("otherURL").style.display = "none";
                        document.getElementById("noComments").style.display = "none";
                        document.body.style.height = "350px";
                    } else {
                        document.getElementById("settings").style.display = "none";
                        document.getElementById("loadingComments").style.display = "none";
                        document.getElementById("otherURL").style.display = "none";
                        document.getElementById("noComments").style.display = "block";
                        document.body.style.height = "55px";
                    }
                }
            });
        }
    });
    var toggleHeatmap = document.getElementById('toggleHeatmap');
    toggleHeatmap.addEventListener('click', function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {toggleHeatmap: true, value: tabs[0].id}, function(response) {});
        });
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {toggleMarkers: true}, function(response) {});
        });
    });
    var saveButton = document.getElementById("saveButton");
    saveButton.addEventListener('click', function(){
        const selectedHex = document.getElementById("hexInput").value;
        if(!isValidHex("#"+selectedHex)){
            document.getElementById("hexInput").value = "";
        } else {
            document.getElementById("colorPreview").style.backgroundColor = "#"+selectedHex;
            document.getElementById("hexInput").placeholder = selectedHex
            const rgbVal = hexToRGB(selectedHex);
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {primaryColorChange: true, colorValue: rgbVal}, function(response) {});
            });
        }
    })
    var toggleComments = document.getElementById("toggleComments");
    toggleComments.addEventListener('click', function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {toggleComments: true}, function(response) {});
        });
    })
    var toggleLiveComments = document.getElementById("toggleLiveComments");
    toggleLiveComments.addEventListener('click', function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {toggleLiveComments: true}, function(response) {});
        });
    })
    var slider = document.getElementById("densitySlider");
    var output = document.getElementById("valueDisplay");
    slider.oninput = function() {
        output.innerHTML = this.value.toString() + ((this.value == 1) ? " second" : " seconds");
        const val = this.value.toString()
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {densityChange: true, densityValue: val}, function(response) {});
        });
    }

    // Retrieve and display saved API key, if available
    chrome.storage.local.get(['apiKey'], function(result) {
        let savedApiKey = result.apiKey
        if (savedApiKey) {
            chrome.storage.local.get(['originalApiKey'], function(result) {
                const originalApiKey = result.originalApiKey
                if (savedApiKey === originalApiKey) {
                    document.getElementById('apiKeyInput').value = ''; // Keep input field blank
                } else {
                    document.getElementById('apiKeyInput').value = savedApiKey;
                }
            })
        }
    });

    // Retrieve the current toggle state on load
    chrome.storage.local.get(['useCustomApiKey'], (result) => {
        document.getElementById('toggleApiKey').checked = result.useCustomApiKey || false;
    });

    // Event listener for toggle switch to save state
    document.getElementById('toggleApiKey').addEventListener('change', (event) => {
        const useCustomApiKey = event.target.checked;
        
        if (useCustomApiKey) {
            const apiKey = document.getElementById('apiKeyInput').value;
            if (apiKey) {
                chrome.storage.local.set({ 'useCustomApiKey': useCustomApiKey });
                chrome.storage.local.set({ 'apiKey': apiKey }, function() {
                    alert('API Key saved successfully!');
                });
            } else {
                alert('Please enter a valid API Key.');
                event.target.checked = false;
            }
        } else {
            chrome.storage.local.set({ 'useCustomApiKey': useCustomApiKey });
            // Retrieve the original API key from storage
            chrome.storage.local.get(['originalApiKey'], function(result) {
                const originalApiKey = result.originalApiKey
                chrome.storage.local.set({ 'apiKey': originalApiKey }, function() {
                    document.getElementById('apiKeyInput').value = ''; // Keep input field blank after reset
                    alert('API Key reset!');
                });
            });
        }
    });
});

window.onload = function() {
    chrome.storage.local.get(['heatmap', 'normalMarker', 'density', 'commentView', 'primaryColor', 'liveCommentView'], function(result) {
        document.getElementById('toggleHeatmap').checked = result.heatmap;
        document.getElementById("densitySlider").value = result.density;
        document.getElementById("valueDisplay").innerHTML = result.density.toString() + ((result.density == 1) ? " second" : " seconds");
        document.getElementById("toggleComments").checked = result.commentView;
        var changedHex = rgbToHex(result.primaryColor[0],result.primaryColor[1],result.primaryColor[2]);
        document.getElementById("colorPreview").style.backgroundColor = "#" + changedHex;
        document.getElementById("hexInput").placeholder = changedHex;
        document.getElementById("toggleLiveComments").checked = result.liveCommentView
    });
}

