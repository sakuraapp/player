# @sakuraapp/player

This library is a player-agnostic abstraction that allows you to control media players on different websites.

## Notes
* This library is fully compatible with browser extensions. You may not be able to use it without them, if your target player is inside nested frames then you would need to inject it into the correct frame.
* Audio support is not yet implemented.

## Usage

### Installation
Install the dependency
```
npm install @sakuraapp/player
```

### Example
```js
const { Player } = require('@sakuraapp/player')
const player = new Player()

player.find().then(() => {
    player.play()
    player.pause()
    
    player.playing = true // alternative to player.play()
    
    player.seek(120) // time in seconds
    player.currentTime = 120 // alternative to player.seek()
    
    console.log(player.duration)

    player.volume = 0.5 // value between 0 and 1

    console.log(player.getCaptions())
})
```
To stop searching if a video was not found:
```js
player.destroy()
```
## TODO
1. Unit Tests
2. Audio support
3. Wider support
4. Built-in timeout