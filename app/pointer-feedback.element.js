const STYLES = `
  :host {
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow: hidden;
    z-index: -1;
    contain: layout;
    --ink-ripple_accent-color: hsl(0,0%,80%);
    --ink-ripple_scale-speed: 300ms;
    --ink-ripple_transparency-speed: 200ms;
  }

  :host::before {
    position: absolute;
    display: block;
    content: '';
    border-radius: 50%;
    background: var(--ink-ripple_accent-color);
    opacity: 0;
    transform: scale(0);
  }

  :host([animatable])::before {
    transition: opacity var(--ink-ripple_transparency-speed) linear, transform var(--ink-ripple_scale-speed) linear;
  }

  :host([mouseup][animatable])::before {
    transition: opacity .4s linear, transform .2s linear;
  }

  :host([mousedown])::before {
    opacity: 1;
    transform: scale(1);
  }

  :host([mouseup]:not([mousedown]))::before {
    opacity: 0;
    transform: scale(1);
  }

  :host([hidden]) {
    display: none;
  }
`
// todo: test getting boundingrect once, and only once
class PointerFeedback extends HTMLElement {

  constructor() {
    super()

    this.attachShadow({
      mode: 'open'
    })

    this.shadowRoot
      .appendChild(PointerFeedback.template.cloneNode(true))

    this.styles   = this.shadowRoot.querySelector('style')
    this.cssAdded = false
  }

  static get template() {
    if (this.$fragment) 
      return this.$fragment

    const $fragment     = document.createDocumentFragment()
    let $styles         = document.createElement('style')
    $styles.innerHTML   = STYLES

    $fragment.appendChild($styles)

    this.$fragment = $fragment

    return $fragment
  }

  set animatable(val) {
    val
      ? this.setAttribute('animatable', '')
      : this.removeAttribute('animatable')
  }

  set mousedown(val) {
    val
      ? this.setAttribute('mousedown', '')
      : this.removeAttribute('mousedown')
  }

  set mouseup(val) {
    val
      ? this.setAttribute('mouseup', '')
      : this.removeAttribute('mouseup')
  }

  set disabled(val) {
    val
      ? this.setAttribute('disabled', '')
      : this.removeAttribute('disabled')
  }

  get mouseup()   { return this.hasAttribute('mouseup') }
  get mousedown() { return this.hasAttribute('mousedown') }
  get disabled()  { return this.hasAttribute('disabled') }

  connectedCallback() {
    this.addEventListener('mousedown', ({offsetX, offsetY}) => {
      if (this.disabled) return
      this._triggerRippleIn(offsetX, offsetY)
    })

    document.documentElement.addEventListener('mouseup', e => {
      if (this.disabled) return
      this._triggerRippleOut()
    })

    this.parentElement.style.overflow   = 'hidden' // todo: try matching parent border radius
    this.parentElement.style.willChange = 'transform'
  }

  simulateRipple(x = false, y = false) {
    if (!x || !y) {
      const rect = this.getBoundingClientRect()
      x = rect.width / 2
      y = rect.height / 2
    }

    this._triggerRippleIn(x, y)

    this.addEventListener('transitionend', e => {
      if (e.propertyName === 'transform')
        this._triggerRippleOut()
    })
  }

  _fadeOut() {
    this.mousedown = false

    requestAnimationFrame(() => {
      this.addEventListener('transitionend', this._transitionOutEnd)
    })
  }

  _removeCSS() {
    this.styles.sheet.deleteRule(0)
    this.cssAdded = false
  }

  _reset() {
    this.animatable = false
    this.mousedown = false
    this.mouseup = false

    this.removeEventListener('transitionend', this._transitionOutEnd)
    this.removeEventListener('transitionend', this._transitionInEnd)

    if (this.cssAdded) this._removeCSS()

    this.transitionInOver   = false
    this.transitionOutOver  = false
  }

  _transitionInEnd(evt) {
    if (evt.pseudoElement) {
      if (evt.propertyName === 'transform' && !this.transitionInOver) {
        this.removeEventListener('transitionend', this._transitionInEnd)

        this.transitionInOver = true

        if (this.mouseup) this._fadeOut()
      }
    }
  }

  _transitionOutEnd(evt) {
    if (evt.pseudoElement && evt.propertyName === 'opacity') {
      this.transitionOutOver = true
      this._reset()
    }
  }

  _positionPseduoElement(x, y) {
    let { height, width } = this.getBoundingClientRect()

    const largest = Math.max(height, width)

    width   = largest * 2 + (largest / 2)
    height  = largest * 2 + (largest / 2)

    const xPos  = x - (width / 2)
    const yPos  = y - (height / 2)

    let speed = largest

    if (speed > 700) speed = 700
    if (speed < 300) speed = 300

    this.styles.sheet.insertRule(`
      :host:before {
        left:   ${xPos}px;
        top:    ${yPos}px;
        width:  ${width}px;
        height: ${height}px;
        --ink-ripple_scale-speed: ${speed}ms;
        --ink-ripple_transparency-speed: ${speed / 3}ms;
      }
    `, 0)

    this.cssAdded = true
  }

  _triggerRippleIn(offsetX, offsetY) {
    this._reset()
    this._positionPseduoElement(offsetX, offsetY)

    requestAnimationFrame(() => {
      this.addEventListener('transitionend', this._transitionInEnd)
      this.animatable   = true
      this.mousedown    = true
    })
  }

  _triggerRippleOut() {
    if (this.transitionOutOver || !this.mousedown) 
      return

    this.mouseup = true

    if (this.transitionInOver) 
      this._fadeOut()
  }

}

customElements.define('pointer-feedback', PointerFeedback)