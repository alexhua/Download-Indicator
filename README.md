# Elegant Download Indicator

This is a Chrome extension demo that dynamically renders animations on the extension icon.  

## Features

- Indicate download status with icon animations  
- Smooth transition animations 
- Fade-out effect for animations  
- Dynamic management of the extension icon  

## Development

The animation is implemented using the JavaScript Canvas 2D API.

You could create custom icon animations by extending **BaseAnimation** and implement the **render** function in `Animation.js`.  

Adjust constants in `Constants.js` to fine-tune the animations.  

## Todo

- Add support for rendering image resources to the canvas  

## Test

Download and save a file from the web to see the animation in action.  

## Screenshot

![Screenshot](demo.webp)

## License

This demo is licensed under the BSD 3-Clause License.