import React, { Component } from "react";
import { GiWarPick, GiStoneCrafting } from "react-icons/gi";
import { getRanHex } from "./util";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedItem: 0,
      pickLevel: 0,
      inventory: [],
    };

    this.position = { x: 0.012, y: 0.012 };
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
    // this.radius = 0.01;
    this.screenWindowWidth = 0.05;

    this.trees = [
      { x: 0.1, y: 0.1, health: 1, id: "12314" },
      { x: 0.2, y: 0.3, health: 1, id: "12214" },
      { x: 0.5, y: 0.5, health: 1, id: "12114" },
      { x: 0.8, y: 0.4, health: 1, id: "12014" },
    ];
    this.rocks = [
      { x: 0.12, y: 0.07, health: 1, id: "34636" },
      { x: 0.2, y: 0.35, health: 1, id: "56456" },
      { x: 0.49, y: 0.51, health: 1, id: "35254" },
      { x: 0.89, y: 0.2, health: 1, id: "96765" },
    ];
    this.myBlocks = [{ x: 0.51, y: 0.51, health: 1, id: "15646", hit: 0 }];

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
      setInterval(this.renderFrame, 1000 / 60);
    };
  }

  renderFrame() {
    this.updateState();
    this.renderUser();
    this.renderItems();
    this.updateMinimap();
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

    for (let rock of this.rocks) {
      let backgroundX = rock.x * imageWidth;
      let backgroundY = rock.y * imageHeight;
      let canvasX = this.position.x * imageWidth;
      let canvasY = this.position.y * imageHeight;
      let topLeftX = canvasX - screenWindow / 2;
      let topLeftY = canvasY - screenWindow / 2;
      let a = -((topLeftX - backgroundX) / screenWindow) * canvas.width;
      let b = -((topLeftY - backgroundY) / screenWindow) * canvas.height;

      ctx.beginPath();
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = "grey";
      ctx.arc(a, b, this.radius * 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = "grey";
      ctx.fill();
    }

    for (let tree of this.trees) {
      let backgroundX = tree.x * imageWidth;
      let backgroundY = tree.y * imageHeight;
      let canvasX = this.position.x * imageWidth;
      let canvasY = this.position.y * imageHeight;
      let topLeftX = canvasX - screenWindow / 2;
      let topLeftY = canvasY - screenWindow / 2;
      let a = -((topLeftX - backgroundX) / screenWindow) * canvas.width;
      let b = -((topLeftY - backgroundY) / screenWindow) * canvas.height;

      ctx.beginPath();
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      // ctx.shadowColor = "green";
      ctx.arc(a, b, this.radius * 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = "green";
      ctx.fill();
    }

    for (const [index, block] of this.myBlocks.entries()) {
      let backgroundX = block.x * imageWidth;
      let backgroundY = block.y * imageHeight;
      let canvasX = this.position.x * imageWidth;
      let canvasY = this.position.y * imageHeight;

      // check if tree in bounds
      let topLeftX = canvasX - screenWindow / 2;
      let topLeftY = canvasY - screenWindow / 2;

      let a = -((topLeftX - backgroundX) / screenWindow) * canvas.width;
      let b = -((topLeftY - backgroundY) / screenWindow) * canvas.height;

      ctx.beginPath();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.arc(a, b, this.radius, 0, 2 * Math.PI, false);

      ctx.fillStyle = block.hit > 0 ? "red" : "black";
      this.myBlocks[index].hit -= 1;

      ctx.fill();
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
      0.5 * canvas.width + this.radius * normAX * 1.5,
      0.5 * canvas.height + this.radius * normAY * 1.5,
      this.radius * 0.3,
      0,
      2 * Math.PI,
      false
    );
    ctx.fill();

    if (this.state.selectedItem > 1) {
      ctx.beginPath();
      ctx.arc(
        // abs position on canvas
        (0.5 + (0.0025 / this.screenWindowWidth) * unitX) * canvas.width,
        (0.5 + (0.0025 / this.screenWindowWidth) * unitY) * canvas.height,
        // (0.5 + 0.09 * unitX) * canvas.width,
        // (0.5 + 0.09 * unitY) * canvas.height,
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

    this.myBlocks.push({
      // %position relative to image
      x: this.position.x + 0.0025 * unitX,
      y: this.position.y + 0.0025 * unitY,
      // x: this.position.x + 0.03 * 0.15 * unitX,
      // y: this.position.y + 0.03 * 0.15 * unitY,
      // x: this.position.x + 0.03 * 0.3 * unitX,
      // y: this.position.y + 0.03 * 0.3 * unitY,
      health: 1,
      id: id,
      hit: 0,
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

    for (let block of this.myBlocks) {
      // compute hitbox
      let topLeftX = block.x - 0.0025 / 2;
      let topLeftY = block.y - 0.0025 / 2;
      let bottomRightX = block.x + 0.0025 / 2;
      let bottomRightY = block.y + 0.0025 / 2;

      if (
        targetX > topLeftX &&
        targetX < bottomRightX &&
        targetY > topLeftY &&
        targetY < bottomRightY
      ) {
        var targetIndex = this.myBlocks.findIndex((x) => x.id == block.id);
        this.myBlocks[targetIndex].hit = 5;
        this.myBlocks[targetIndex].health -= 0.4;

        if (this.myBlocks[targetIndex].health < 0) {
          this.myBlocks.splice(targetIndex, 1);
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
          this.setState({
            selectedItem: index,
          });
        }}
      >
        {index === 0 ? (
          <GiWarPick />
        ) : index === 1 ? (
          <GiStoneCrafting />
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
