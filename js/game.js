// ROAD MANIAC
// YOU HAVE BOMB STRAPPED TO YOUR CAR AND YOU HAVE TO AVOID POLICE AND OTHER CARS

function generate_attribute_template(that, attrName, defaultValue){
  if(!that.hasAttribute(attrName)){
    that.setAttribute(attrName, defaultValue)
  }
  return that.getAttribute(attrName)
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const lerp = (start_val, end_val, pct) => (start_val + (end_val - start_val)) * pct;
const invLerp = (start_val, end_val, pct) => (pct-start_val)/(end_val-start_val);

const frameRate = 1000/60;

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

class Game extends HTMLElement{
  constructor(){
    super();
  }
  get status(){
    return generate_attribute_template(this, "status", "playing")
  }
  set status(val){
    this.setAttribute("status", val)
    if(val == "lost"){

    }
  }
}

class Speedometer extends HTMLElement{
  constructor(){
    super();
  }
  updateSpeed(value){
    let speedDegrees = value;
    this.speedPointer.style.transform = `rotate(${speedDegrees}deg)`;
  }

  updateSpeedCap(value){
    let capDegrees = value;
    this.capPointer.style.transform = `rotate(${capDegrees}deg)`
  }

  connectedCallback(){
    this.innerHTML = "<speedo-meter-background></speedo-meter-background><speedo-meter-foreground><speedo-meter-pointer></speedo-meter-pointer><speedo-meter-cap-pointer></speedo-meter-cap-pointer></speedo-meter-foreground>"
    this.speedPointer = this.querySelector("speedo-meter-pointer")
    this.capPointer = this.querySelector("speedo-meter-cap-pointer")
  }
}

class PlayerCar extends HTMLElement{
  constructor(){
    super();
    this.game = document.querySelector("pixel-cars")
    this.lastUpdate = Date.now();
  }

  get speedCap(){
    return parseFloat(generate_attribute_template(this, "speed-cap", 20))
  }

  set speedCap(value){
    value = parseFloat(value)
    if(value >= 19000){
      //alert("WON!")
    }
    this.setAttribute('speed-cap', value)
    this.speedometer.updateSpeedCap(value)
  }

  get speed(){
    return parseFloat(generate_attribute_template(this, "speed", 30))
  }

  get bombTimer(){
    return generate_attribute_template(this, "bomb-timer", "false")
  }

  set bombTimer(val){
    this.setAttribute("bomb-timer", val)
    this.bombIndicator.updateAlarm(val); 
  }

  set speed(value){
    value = clamp(parseFloat(value), 0, 270)
    if(value < this.speedCap){
      this.bombTimer = true
    }
    if(value > this.speedCap){
      this.bombTimer = false
    }
    this.setAttribute('speed', value)
    this.topPosition += value;
    this.speedometer.updateSpeed(value)
  }

  set position(value){
    value = parseInt(value)
    this.style.left = value/10 + "em";
    this.setAttribute('position', value)
  }

  set topPosition(value){
    value = parseInt(value)
    document.querySelector('main-road').style.backgroundPositionY = value/10 + 'px'
    this.setAttribute('topPosition', value)
  }

  get topPosition(){
    return parseInt(generate_attribute_template(this, "topPosition", 0))
  }

  get position(){
    return parseInt(generate_attribute_template(this, "position", 0))
  }
  
  explode(){
    this.game.status = "lost"
  }

  mainLoop(){
    this.now = Date.now();
    this.deltaTime = (this.now - this.lastUpdate) / frameRate;
    console.log(this.deltaTime)
    this.lastUpdate = this.now;

    this.speedCap+=0.01*this.deltaTime;
    this.speed-=0.05*this.deltaTime*(0.015*this.speed);
    if(keyState.includes("w") || keyState.includes("ArrowUp")){
      this.speed+=0.15*this.deltaTime//erp( this.speed, this.speed+16, 0.5);
      this.speedometer.animate([
        {
          transform: "scale(1.1)"
        }
      ], {duration: 1000})
    }else{
      this.speedometer.animate([
        {transform: "scale(1.0)"}
      ],{duration:1000})

    }
    if(keyState.includes("s") || keyState.includes("ArrowUp")){
      this.speed-=0.2*this.deltaTime;
      this.speedometer.animate([
        {
          transform: "scale(0.9)"
        }
      ], {duration: 1000})
    }
    else{
      this.speedometer.animate([
        {transform: "scale(1.0)"}
      ],{duration:1000})
    }
    if(keyState.includes("d") || keyState.includes("ArrowRight")){
      this.position+=0.05* this.speed;
      this.classList.add("turnRight")
    }else{
      this.classList.remove("turnRight")
    }
    if(keyState.includes("a") || keyState.includes("ArrowLeft")){
      this.position-=0.05*this.speed;
      this.classList.add("turnLeft")

    }else{
      this.classList.remove("turnLeft")
    }


  }

  connectedCallback(){
    this.speedometer = document.querySelector("speedo-meter");
    this.bombIndicator = document.querySelector("bomb-indicator")
    setInterval(()=>{this.mainLoop()}, 1);
  }
}

 class BombIndicator extends HTMLElement{
  constructor(){
    super();
    this.bombTimeout = undefined;
    this.player = document.querySelector('player-car')
  }
  updateAlarm(val){
    if(val){
      this.classList.add("alarm")
    }
    else{
      this.classList.remove("alarm")
      clearTimeout(this.bombTimeout)
    }
    if( val && typeof this.bombTimeout === "undefined"){
      this.bombTimeout = setTimeout(()=>{this.classList.remove("alarm");this.classList.add("exploded");this.player.explode();}, 4000)
    }
    if(!val && typeof this.bombTimeout === "number"){
      clearTimeout(this.bombTimeout);
      this.bombTimeout = undefined
    }
  }
}

window.customElements.define('player-car', PlayerCar)
window.customElements.define('speedo-meter', Speedometer)
window.customElements.define("bomb-indicator", BombIndicator)
window.customElements.define('pixel-cars', Game)
