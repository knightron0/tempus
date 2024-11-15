Tempus  [![GitHub license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/knightron0/tempus/blob/main/LICENSE) [![WebStore release](https://img.shields.io/badge/install-here-brightgreen)](https://chrome.google.com/webstore/detail/tempus/bpdhbpeecmmglmkjfmigehaebpndmceh)
===============

Tempus allows you to manage and view YouTube comments with timestamps efficiently.

<a href="https://www.producthunt.com/posts/tempus-3?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tempus-3" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=309266&theme=dark" alt="Tempus - A tool to efficiently view YouTube comments with timestamps | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

https://user-images.githubusercontent.com/37767310/129518303-bb97b0eb-93bf-4be1-92c7-0c35cb09babf.mp4


# Features 
- 🔖 View concentration of comments using opacity of displayed markers.
- ⌛ View comments containing a particular timestamp.
- ⏩ While playing the video, view comments with timestamps like a live chat replay.
- ⚙️ Customize the primary colour, block size of the markers.
 
# Usage 
Install and enable Tempus from the Chrome Web Store [here](https://chrome.google.com/webstore/detail/tempus/bpdhbpeecmmglmkjfmigehaebpndmceh)! 

To use Tempus, just make sure the extension has been installed and enabled in your browser. Then, you can head to any YouTube video, where the extension will collect timestamps from the comments and display them under the video progress bar. 

The settings, which are accessible through the Tempus icon on the top-right of your browser, allow you to:
- 📏 Configure the block size of the marker `default: 1` (value can range between 1 and 20 seconds)
- 📊 Toggle HeatMap markers `default: enabled`
- ⏩ Toggle the comment live replay `default: disabled`
- 🖱️ Toggle the marker on-click comment view `default: enabled`
- 🎨 Configure the primary colour for markers `default: #ffb347` ![#ffb347](https://via.placeholder.com/15/ffb347/000000?text=+)

# Contributing 
1. Clone the repository. 
2. Create a new file ```config.js``` at the same level as the ```background.js``` file and add the following to it: 
```js
let config = {
    // Replace [YOUR_API_KEY] with your YouTube API key.
    "API_KEY": "[YOUR_API_KEY]"
};
```
3. Head to ```chrome://extensions``` and turn the developer mode on.
4. Click on ```Load Unpacked``` and select the cloned repository. 
5. Enjoy!

All contributions are welcome! You can add functionality, fix bugs, or make any other improvements. When you're done, [submit a pull request](https://github.com/knightron0/tempus/pulls)!

# Entering An API Key
You can use your own YouTube API key with Tempus. 

1. Sign into [Google Cloud Console](https://console.cloud.google.com/) with your Google account and create a project.
2. Go to the [Enabled APIs page](https://console.cloud.google.com/apis/enabled) and select the project. Search for the [YouTube Data v3 API](https://console.cloud.google.com/apis/api/youtube.googleapis.com/) and enable it.
3. In the [Credentials page](https://console.cloud.google.com/apis/credentials), select the API Key option. Save and copy the secret key.
4. Open the extension and paste in your key. Toggle on to use the key.

# License
The code is licensed under the MIT license.
