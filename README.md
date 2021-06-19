# Sakura Player

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
const { SakuraPlayer } = require('@sakuraapp/player')
const player = new SakuraPlayer()

player.find().then(() => {
    player.play()
    player.pause()
    
    player.playing = true // alternative to player.play()
    
    player.seek(120) // time in seconds
    player.currentTime = 120 // alternative to player.seek()
    
    console.log(player.duration)

    player.volume = 0.5 // value between 0 and 1

    console.log(player.textTracks)
    console.log(player.audioTracks) // this is unsupported on the default HTML5 player

    console.log(player.textTrack) // current text track
    console.log(player.audioTrack) // current audio track

    player.setTextTrack(player.textTracks[0].id)
    player.setAudioTrack(player.audioTracks[0].id)

    player.textTrack = player.textTracks[0] // alternative to player.setTextTrack()
    player.audioTrack = player.audioTracks[0] // alternative to player.setAudioTrack()
})

player.on('ready', () => console.log('ready'))

// To stop searching if a video was not found:
player.stop()

// Please call this method if the player is no longer needed to prevent memory leaks
player.destroy()
```
## TODO
1. Unit Tests
2. Audio support
3. Wider support
4. Built-in timeout