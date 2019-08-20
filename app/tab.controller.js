const loadWorklet = async () => {
  await CSS.animationWorklet.addModule('tab.animator.js')

  const tabs       = document.querySelector('.material-tabs')

  const indicator  = tabs.querySelector('.tab-indicator')
  const header     = tabs.querySelector('header')
  const contents   = tabs.querySelector('section')

  contents.scrollTo(0,0) // force snap on load

  const scrollTimeline = new ScrollTimeline({ 
    scrollSource: contents, 
    orientation: 'inline', 
    timeRange:    contents.scrollWidth - contents.clientWidth,
  })

  const tabItems = contents.querySelectorAll('article')
  const navItems = header.querySelectorAll('button')

  const effect = new KeyframeEffect(indicator,
    [
      {transform: 'translateX(0)'}, 
      {transform: 'translateX(100%)'},
    ],
    { 
      duration: 100, 
      iterations: Infinity, 
      fill: "both",
    },
  )
    
  // Pass offset left as an option but once we support start and end
  // scroll offset in ScrollTimeline we can get rid of this.
  const animation = new WorkletAnimation('current-tab',
    effect,
    scrollTimeline,
    {
      offset: 0, 
      width:  navItems[0].clientWidth,
    }
  )
  
  animation.play()
}


if (!CSS.animationWorklet) {
  console.warn('Missing CSS.animationWorklet. To enable scroll effect please load in HTTPS and enable flag chrome://flags/#enable-experimental-web-platform-features')
  document.body.innerHTML = 'Missing <code>CSS.animationWorklet</code>. <br/> To enable demo please enable Chrome flag chrome://flags/#enable-experimental-web-platform-features and load on HTTPS'
}
else {
  console.log('Loading animation worklet')
  loadWorklet()
}
