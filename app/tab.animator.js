registerAnimator('current-tab', class {
  constructor({count, width}) {
    this._offset   = 0
    this._sections = count
    this._width    = width
  }

  animate(currentTime, effect) {
    const delta = Math.abs(currentTime - this._offset)
    
    // bug, at 1 we disable the animation!
    const progress = Math.min(delta / (this._width * this._sections), 0.999)

    effect.localTime = progress * 100
  }
})