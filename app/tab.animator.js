registerAnimator('current-tab', class {
  constructor({count, width}) {
    this._offset   = 0
    this._sections = count
    this._width    = width
  }

  animate(currentTime, effect) {
    const scrollOffset = currentTime
    const delta = Math.abs(scrollOffset - this._offset)
    
    // bug, at 1 we disable the animation!
    const progress = Math.min(delta / (this._width * this._sections), 0.999)

    if (progress > 0 && progress < 1)
      console.log(`Article active at ${scrollOffset} with (${this._offset}, ${this._width}) => ${progress}`)

    effect.localTime = progress * 100
  }
})