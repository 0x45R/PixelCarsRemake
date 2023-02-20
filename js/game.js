// ROAD MANIAC

function generate_attribute_template(that, attrName, defaultValue){
  if(!that.hasAttribute(attrName)){
    that.setAttribute(attrName, defaultValue)
  }
  return that.getAttribute(attrName)
}

var keyState = []

document.addEventListener('keydown', (e)=>{
  if(!keyState.includes(e.key)){
    keyState.push(e.key);
  }  
})

document.addEventListener("keyup", (e)=>{
  let keyIndex = keyState.indexOf(e.key)
  keyState.splice(keyIndex, 1);
})

class PlayerCar extends HTMLElement{
  constructor(){
    super();
  }

  get speed(){
    return parseInt(generate_attribute_template(this, "speed", 0))
  }

  set speed(value){
    value = parseInt(value)
    this.setAttribute('speed', value)
  }

  set position(value){
    value = parseInt(value)
    this.style.left = value/10 + "em";
    this.setAttribute('position', value)
  }

  get position(){
    return parseInt(generate_attribute_template(this, "position", 0))
  }
   
  mainLoop(){
    console.log(keyState)
    if(keyState.includes("d") || keyState.includes("ArrowRight")){
      this.position+=5;
    }
    if(keyState.includes("a") || keyState.includes("ArrowLeft")){
      this.position-=5;
    }
  }

  connectedCallback(){
    setInterval(()=>{this.mainLoop()}, 6)



  }
}

window.customElements.define('player-car', PlayerCar)
