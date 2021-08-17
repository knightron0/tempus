Tempus  [![GitHub license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/knightron0/tempus/blob/main/LICENSE) [![WebStore release](https://img.shields.io/badge/install-here-brightgreen)](https://www.youtube.com/watch?v=5gX7_4qrazA) 
===============

Tempus allows you to manage and view YouTube comments with timestamps efficiently.

https://user-images.githubusercontent.com/37767310/129518303-bb97b0eb-93bf-4be1-92c7-0c35cb09babf.mp4


# Features 
1. View the concentration of comments using opacity of displayed markers.
2. View comments containing a particular timestamp.
3. While playing the video, view comments with timestamps like a live chat replay.
4. Customize the primary colour, block size of the markers.
 
# Usage 
Install and enable Tempus from the Chrome Web Store [here](https://www.youtube.com/watch?v=5gX7_4qrazA)! 

To use Tempus, just make sure the extension has been installed and enabled in your browser. Then, you can head to any YouTube video, where the extension will collect timestamps from the comments and display them under the video progress bar. 

The settings, which are accessible through the Tempus icon on the top-right of your browser, allow you to:
1. Configure the block size of the marker `default: 1` (value can range between 1 and 20 seconds)
2. Toggle HeatMap markers `default: enabled`
3. Toggle the comment live replay `default: disabled`
4. Toggle the marker on-click commment view `default: enabled`
5. Configure the primary colour for markers `default: #ffb347` ![#ffb347](https://via.placeholder.com/15/ffb347/000000?text=+)

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

# License
The code is licensed under the MIT license.
