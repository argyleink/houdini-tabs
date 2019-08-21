const loadWorklet = async () => {
  await CSS.animationWorklet.addModule('tab.animator.js')

  const tabs       = document.querySelector('.material-tabs')
  const indicator  = tabs.querySelector('.tab-indicator')
  const section    = tabs.querySelector('section')
  const articles   = section.querySelectorAll('article')
  
  const curTabOptions = {
    count: articles.length - 1,
    width: section.clientWidth,
  }

  const scrollTimeline = new ScrollTimeline({ 
    scrollSource: section, 
    orientation: 'inline', 
    timeRange:    section.scrollWidth - section.clientWidth,
  })

  const effect = new KeyframeEffect(indicator,
    [
      {transform: 'translateX(0)'}, 
      {transform: `translateX(${curTabOptions.count}00%)`},
    ],
    { 
      duration:   100, 
      iterations: Infinity, 
      fill:       'both',
    },
  )
    
  const animation = new WorkletAnimation('current-tab',
    effect,
    scrollTimeline,
    curTabOptions,
  )
  
  animation.play()
}

const listen = () =>
  document.querySelectorAll('.material-tabs > header > button')
    .forEach(node =>
      node.addEventListener('click', tab_clicked))

const tab_clicked = e => {
  const index = [...e.target.parentElement.children].indexOf(e.target)
  const tab_article = document.querySelector(`.material-tabs > section > article:nth-child(${index + 1})`)

  document.querySelector(`.material-tabs > section`)
    .scrollTo({
      top:      0,
      left:     tab_article.offsetLeft,
      behavior: 'smooth',
    })
}

listen()

if (!CSS.animationWorklet) {
  console.warn('Missing CSS.animationWorklet. To enable scroll effect please load in HTTPS and enable flag chrome://flags/#enable-experimental-web-platform-features')
  document.body.innerHTML = 'Missing <code>CSS.animationWorklet</code>. <br/> To enable demo please enable Chrome flag chrome://flags/#enable-experimental-web-platform-features and load on HTTPS'
}
else {
  console.log('Loading animation worklet')
  loadWorklet()
}
