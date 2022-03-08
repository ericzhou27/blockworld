import React, { Component } from "react";
import { GiWarPick, GiStoneCrafting } from "react-icons/gi";
import { getRanHex } from "./util";
import "./App.css";
import Seed from "./server/seed"

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedItem: 0,
      pickLevel: 0,
      inventory: [],

      wood: 0,
      rock: 0,
    };

    this.position = { x: 0.5, y: 0.5 };
    this.mouse = { x: 0, y: 0 };
    this.keyState = {
      w: false,
      s: false,
      a: false,
      d: false,
    };

    this.canvasRef = React.createRef();
    this.miniMapRef = React.createRef();

    this.image = new Image();
    this.speed = 0.00025;
    this.radius = 0;
    this.screenWindowWidth = 0.05;
    this.animState = 0;

    this.objects = [
      { x: 0.5, y: 0.5, health: 1, id: "12114", hit: 0, type: "tree" },
      { x: 0.51, y: 0.49, health: 1, id: "12112", hit: 0, type: "tree" },
      { x: 0.49, y: 0.51, health: 1, id: "35254", hit: 0, type: "rock" },
      { x: 0.48, y: 0.5, health: 1, id: "35252", hit: 0, type: "rock" },
      { x: 0.51, y: 0.51, health: 1, id: "15646", hit: 0, type: "block" },
    ];

    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
    this.renderFrame = this.renderFrame.bind(this);
    this.updateState = this.updateState.bind(this);
    this.renderUser = this.renderUser.bind(this);
    this.renderItems = this.renderItems.bind(this);
    this.handleMouse = this.handleMouse.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePlace = this.handlePlace.bind(this);
    this.handleBreak = this.handleBreak.bind(this);
    this.updateMinimap = this.updateMinimap.bind(this);
    this.renderTool = this.renderTool.bind(this);
  }

  componentDidMount() {
    Seed();
    let canvas = this.canvasRef.current;
    let minimap = this.miniMapRef.current;
    let ctx = canvas.getContext("2d");

    canvas.width = Math.min(window.innerWidth, window.innerHeight) * 0.95;
    canvas.height = Math.min(window.innerWidth, window.innerHeight) * 0.95;
    minimap.width = canvas.width * 0.15;
    minimap.height = canvas.height * 0.15;

    this.image.src = require("./assets/grid.png");
    // "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max";
    // this.image.crossOrigin = "Anonymous";

    document.addEventListener("keydown", this.keyDown);
    document.addEventListener("keyup", this.keyUp);
    canvas.addEventListener("mousemove", this.handleMouse);
    canvas.addEventListener("click", this.handleClick);

    this.image.onload = () => {
      this.radius = Math.min(this.image.width, this.image.height) * 0.01;
      console.log("RADIUS - ", this.radius);
      // setInterval(this.renderFrame, 1000 / 30);
      // setInterval(this.renderFrame, 1000 / 60);
      this.renderFrame();
    };
  }

  renderFrame() {
    this.updateState();
    this.renderUser();
    this.renderItems();
    this.updateMinimap();

    requestAnimationFrame(this.renderFrame);
  }

  updateState() {
    let canvas = this.canvasRef.current;
    let keyState = this.keyState;
    let rawX = 0;
    let rawY = 0;

    // compute directional vector based on keystate
    if (keyState.w) rawY -= 1;
    if (keyState.s) rawY += 1;
    if (keyState.a) rawX -= 1;
    if (keyState.d) rawX += 1;

    let new_x = this.position.x + rawX * this.speed;
    let new_y = this.position.y + rawY * this.speed;

    this.position.x = Math.min(
      Math.max(0 + (this.radius * 0.1) / this.image.width, new_x),
      1 - (this.radius * 0.1) / this.image.width
      // Math.max(0 + this.radius / this.image.width, new_x),
      // 1 - this.radius / this.image.width
    );
    this.position.y = Math.min(
      // Math.max(0 + this.radius / this.image.height, new_y),
      // 1 - this.radius / this.image.height
      Math.max(0 + (this.radius * 0.1) / this.image.height, new_y),
      1 - (this.radius * 0.1) / this.image.height
    );
  }

  updateMinimap() {
    let minimap = this.miniMapRef.current;
    let mCtx = minimap.getContext("2d");

    mCtx.clearRect(0, 0, minimap.width, minimap.height);

    mCtx.beginPath();
    mCtx.shadowBlur = 16;
    mCtx.shadowOffsetX = 0;
    mCtx.shadowOffsetY = 0;
    mCtx.shadowColor = "gold";
    mCtx.arc(
      this.position.x * minimap.width,
      this.position.y * minimap.height,
      this.radius / 10,
      0,
      2 * Math.PI,
      false
    );
    mCtx.fillStyle = "gold";
    mCtx.fill();
    mCtx.closePath();
  }

  renderItems() {
    let canvas = this.canvasRef.current;
    let ctx = canvas.getContext("2d");
    let imageHeight = this.image.height;
    let imageWidth = this.image.width;
    const screenWindow =
      Math.min(imageHeight, imageWidth) * this.screenWindowWidth;

    for (const [index, object] of this.objects.entries()) {
      let backgroundX = object.x * imageWidth;
      let backgroundY = object.y * imageHeight;
      let canvasX = this.position.x * imageWidth;
      let canvasY = this.position.y * imageHeight;
      let topLeftX = canvasX - screenWindow / 2;
      let topLeftY = canvasY - screenWindow / 2;
      let a = -((topLeftX - backgroundX) / screenWindow) * canvas.width;
      let b = -((topLeftY - backgroundY) / screenWindow) * canvas.height;
      let type = object.type;
      let displacementX = [0, 5, 10, 5, 0, -5, -10, -5, 0];

      ctx.beginPath();
      if (type === "tree") {
        let curHit = this.objects[index].hit;
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.arc(
          a + displacementX[curHit],
          b,
          this.radius * 3,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = object.hit > 0 ? "red" : "green";
        if (curHit > 0) this.objects[index].hit -= 1;
        ctx.fill();
      } else if (type === "rock") {
        let curHit = this.objects[index].hit;
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "grey";
        ctx.arc(
          a + displacementX[curHit],
          b,
          this.radius * 2,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = object.hit > 0 ? "red" : "grey";
        if (this.objects[index].hit > 0) this.objects[index].hit -= 1;
        ctx.fill();
      } else if (type === "block") {
        let curHit = this.objects[index].hit;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.arc(
          a + displacementX[curHit] / 2,
          b,
          this.radius,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = object.hit > 0 ? "red" : "black";
        if (this.objects[index].hit > 0) this.objects[index].hit -= 1;
        ctx.fill();
      }
      ctx.closePath();
    }
  }

  renderUser() {
    let canvas = this.canvasRef.current;
    let ctx = canvas.getContext("2d");
    let image = this.image;
    let imageHeight = this.image.height;
    let imageWidth = this.image.width;
    const screenWindow =
      Math.min(imageHeight, imageWidth) * this.screenWindowWidth;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw background
    ctx.drawImage(
      image,
      this.position.x * image.width - screenWindow / 2,
      this.position.y * image.height - screenWindow / 2,
      screenWindow,
      screenWindow,
      0,
      0,
      canvas.width,
      canvas.height
    );

    let rawX = this.mouse.x - window.innerWidth * 0.5;
    let rawY = this.mouse.y - window.innerHeight * 0.5;
    let unitX = rawX / Math.sqrt(rawX ** 2 + rawY ** 2);
    let unitY = rawY / Math.sqrt(rawX ** 2 + rawY ** 2);

    let normAX = unitX - unitY * 0.8;
    let normAY = unitY + unitX * 0.8;
    let normBX = unitX + unitY * 0.8;
    let normBY = unitY - unitX * 0.8;
    normAX = normAX / Math.sqrt(normAX ** 2 + normAY ** 2);
    normAY = normAY / Math.sqrt(normAX ** 2 + normAY ** 2);
    normBX = normBX / Math.sqrt(normBX ** 2 + normBY ** 2);
    normBY = normBY / Math.sqrt(normBX ** 2 + normBY ** 2);

    // draw user
    ctx.beginPath();
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = "gold";
    ctx.arc(
      0.5 * canvas.width,
      0.5 * canvas.height,
      this.radius,
      0,
      2 * Math.PI,
      false
    );
    ctx.fillStyle = "gold";
    ctx.fill();
    ctx.closePath();

    let displacementX = [0, 5, 10, 5, 0, -5, -10, -5, 0];

    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.arc(
      0.5 * canvas.width + this.radius * normBX * 1.5,
      0.5 * canvas.height + this.radius * normBY * 1.5,
      this.radius * 0.3,
      0,
      2 * Math.PI,
      false
    );
    ctx.arc(
      0.5 * canvas.width +
        this.radius * normAX * 1.5 +
        normAX * displacementX[this.animState],
      0.5 * canvas.height +
        this.radius * normAY * 1.5 +
        normAY * displacementX[this.animState],
      this.radius * 0.3,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();

    if (this.animState > 0) this.animState -= 1;
    if (this.state.selectedItem > 1) {
      ctx.beginPath();
      ctx.arc(
        // abs position on canvas
        (0.5 + (0.0025 / this.screenWindowWidth) * unitX) * canvas.width,
        (0.5 + (0.0025 / this.screenWindowWidth) * unitY) * canvas.height,
        this.radius,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();
      ctx.closePath();
    }
  }

  handlePlace(e) {
    let rawX = this.mouse.x - window.innerWidth * 0.5;
    let rawY = this.mouse.y - window.innerHeight * 0.5;
    let unitX = rawX / Math.sqrt(rawX ** 2 + rawY ** 2);
    let unitY = rawY / Math.sqrt(rawX ** 2 + rawY ** 2);
    let id = getRanHex(16);
    console.log("ID - ", id);

    this.objects.push({
      // %position relative to image
      x: this.position.x + 0.0025 * unitX,
      y: this.position.y + 0.0025 * unitY,
      health: 1,
      id: id,
      hit: 0,
      type: "block",
    });
  }

  handleBreak(e) {
    const hitRadius = 0.002;
    let canvas = this.canvasRef.current;
    let ctx = canvas.getContext("2d");
    let rawX = this.mouse.x - window.innerWidth * 0.5;
    let rawY = this.mouse.y - window.innerHeight * 0.5;
    let unitX = rawX / Math.sqrt(rawX ** 2 + rawY ** 2);
    let unitY = rawY / Math.sqrt(rawX ** 2 + rawY ** 2);
    let targetX = this.position.x + hitRadius * unitX;
    let targetY = this.position.y + hitRadius * unitY;

    // raycast from current position - loop over all elements stored
    // and see if you hit any. If you hit, decrement its hp by 1/4
    // if it's hp is 0, delete it from the array locally and delete the doc.
    // if item is block, delete. If tree or ore, give items.

    this.animState = 7;

    // for (let block of this.myBlocks) {
    for (let block of this.objects) {
      // compute hitbox
      let type = block.type;
      let hit = block.hit;
      const relRad = 0.0025;
      let topLeftX, topLeftY, bottomRightX, bottomRightY;

      if (type === "block") {
        topLeftX = block.x - relRad / 2;
        topLeftY = block.y - relRad / 2;
        bottomRightX = block.x + relRad / 2;
        bottomRightY = block.y + relRad / 2;
      } else if (type === "tree") {
        topLeftX = block.x - (3 * relRad) / 2;
        topLeftY = block.y - (3 * relRad) / 2;
        bottomRightX = block.x + (3 * relRad) / 2;
        bottomRightY = block.y + (3 * relRad) / 2;
      } else if (type === "rock") {
        topLeftX = block.x - (2 * relRad) / 2;
        topLeftY = block.y - (2 * relRad) / 2;
        bottomRightX = block.x + (2 * relRad) / 2;
        bottomRightY = block.y + (2 * relRad) / 2;
      }

      if (
        targetX > topLeftX &&
        targetX < bottomRightX &&
        targetY > topLeftY &&
        targetY < bottomRightY &&
        hit === 0
      ) {
        // console.log("HIT DETECTED - ", block);

        if (type === "tree") {
          this.setState({
            wood: this.state.wood + 1,
          });
        } else if (type === "rock") {
          this.setState({
            rock: this.state.rock + 1,
          });
        }

        var targetIndex = this.objects.findIndex((x) => x.id == block.id);
        this.objects[targetIndex].hit = 7;
        this.objects[targetIndex].health -= 0.1;

        if (this.objects[targetIndex].health < 0) {
          this.objects.splice(targetIndex, 1);
        }
        break;
      }
    }
  }

  handleClick(e) {
    if (this.state.selectedItem === 0) {
      this.handleBreak(e);
    } else {
      this.handlePlace(e);
    }
  }

  handleMouse(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  keyUp(e) {
    switch (e.key) {
      case "s":
        this.keyState.s = false;
        break;
      case "w":
        this.keyState.w = false;
        break;
      case "d":
        this.keyState.d = false;
        break;
      case "a":
        this.keyState.a = false;
        break;
      default:
        break;
    }
  }

  keyDown(e) {
    switch (e.key) {
      case "s":
        this.keyState.s = true;
        break;
      case "w":
        this.keyState.w = true;
        break;
      case "d":
        this.keyState.d = true;
        break;
      case "a":
        this.keyState.a = true;
        break;
      default:
        break;
    }
  }

  renderTool(index) {
    let className =
      index === 0 ? "toolEndLeft" : index === 7 ? "toolEndRight" : "tool";

    if (index === this.state.selectedItem) {
      className += " selectedTool";
    }

    return (
      <div
        class={className}
        onClick={() => {
          console.log("INDEX - ", index);
          if (index !== 1) {
            this.setState({
              selectedItem: index,
            });
          }
        }}
      >
        {index === 0 ? (
          <GiWarPick />
        ) : index === 1 ? (
          <GiStoneCrafting />
        ) : index === 2 ? (
          <div class="noselect">{this.state.wood}</div>
        ) : index === 3 ? (
          <div class="noselect">{this.state.rock}</div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  render() {
    return (
      <div className="pageContainer">
        <div class="gameContainer">
          <canvas
            className="gameCanvas"
            ref={this.canvasRef}
            id="gameCanvas"
          ></canvas>

          <canvas
            className="minimap"
            ref={this.miniMapRef}
            id="minimap"
          ></canvas>

          <div class="toolBar">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((value) => {
              return this.renderTool(value);
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
