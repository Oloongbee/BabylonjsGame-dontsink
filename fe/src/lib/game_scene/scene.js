//@ts-nocheck
import { BarrierManager } from "$lib/barrier/barrier_manager";
import { Ship } from "$lib/ship/ship";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import HavokPhysics from "@babylonjs/havok";
import { WaterMaterial } from "@babylonjs/materials"
export async function CreateScene() {

    //获取要渲染的画布
    let renderCanvas = document.getElementById("renderCanvas");
    if (!renderCanvas || renderCanvas == null) {
      console.error("could not find 'renderCanvas' dom element");
    }

    //创建渲染引擎
    let engine = new BABYLON.Engine(
        renderCanvas,
        true,
        { antialias: true, deterministicLockstep: true, lockstepMaxSteps: 120 },
        true,
    );
    if (engine == null) {
        console.error("create engine failed");
        return;
    }

    //创建havok插件
    let hkInstance = await HavokPhysics();
    if (!hkInstance) {
      console.error("HavokInstance create failed!");
      return;
    }
    let hkPhysicsPlugin = new BABYLON.HavokPlugin(true, hkInstance);
    if (!hkPhysicsPlugin) {
      console.error("HavokPlugin create failed!");
      return;
    }
    hkPhysicsPlugin.setTimeStep(1 / 60);

    let game_scene=new GameScene(engine,hkPhysicsPlugin,renderCanvas);
    await game_scene.load();
    await game_scene.render();
}

class GameScene{

    /**
     * @type {BABYLON.Engine | null}
     */
    engine = null;

    /**
     * @type {BABYLON.Scene | null}
     */
    scene = null;

    /**
     * @type {BABYLON.HavokPlugin | null}
     */
    hkPhysicsPlugin = null;

    /**
     * @param {BABYLON.Engine} engine
     * @param {BABYLON.HavokPlugin} hkPhysicsPlugin
     * @param {HTMLCanvasElement} renderCanvas
     */
    constructor(engine,hkPhysicsPlugin,renderCanvas){
        if(!engine){
            console.error('GameScene: engine is required');
            return;
        }
        this.engine = engine;

        if(!renderCanvas){
            console.error('GameScene: renderCanvas is required');
            return;
        }
        this.renderCanvas=renderCanvas;

        if(hkPhysicsPlugin){
            this.hkPhysicsPlugin = hkPhysicsPlugin;
        }

        this.scene = new BABYLON.Scene(this.engine);

        //模型是右手坐标系,场景必须也使用右手坐标系
        this.scene.useRightHandedSystem = true;

        if(this.hkPhysicsPlugin){
            let enablePhysicsOK = this.scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), this.hkPhysicsPlugin);
            if(!enablePhysicsOK){
                console.error("enable Physics failed!");
            }
        }

        this.camera = new BABYLON.ArcRotateCamera("camera", Math.PI/2, Math.PI/5, 1, new BABYLON.Vector3(0, 60, 80), this.scene);
        this.camera.rotation=new BABYLON.Vector3(Math.PI/8,0,Math.PI)
        // this.camera.attachControl(renderCanvas, true);

        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
        this.light.intensity = 1

        // 天空盒
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:5000.0}, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/skybox/", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        
        this.ground = BABYLON.MeshBuilder.CreateBox("ground", { size:200,height:3}, this.scene);
        this.ground.position.y = -10;
        this.ground.rotation=new BABYLON.Vector3(0,Math.PI/2,0);
        let ground_aggregate = new BABYLON.PhysicsAggregate(
            this.ground,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0, restitution: 0, friction: 0 },
            this.scene
        );

        this.water = new WaterMaterial("water", this.scene, new BABYLON.Vector2(512, 512));
        this.water.backFaceCulling = false;
        this.water.bumpTexture = new BABYLON.Texture("/wave/wave.jpg", this.scene);
        this.water.windForce = -30;
        this.water.waveHeight = 1.7;
        this.water.bumpHeight = 0.1;
        this.water.windDirection = new BABYLON.Vector2(0, 1);
        this.water.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
        this.water.colorBlendFactor = 0.0;
        this.water.addToRenderList(skybox);
        this. ground.material = this.water;
    }

    async load(){
        this.guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        //创建最高分UI
        this.trophy = new GUI.Image("trophy", "/score.png");
        this.trophy.width = "50px";
        this.trophy.height = "50px";
        this.trophy.left = "-45%";
        this.trophy.top = "-45%";
        this.trophy.fontSize="1%"
        this.guiTexture.addControl(this.trophy);
        
        // 创建最高分文字
        this.highestScoreText = new GUI.TextBlock();
        this.highestScoreText.text = "1111111"; // 初始化最高分为0
        this.highestScoreText.color = "white";
        this.highestScoreText.fontSize = "4%";
        this.highestScoreText.left = "-40%"; // 奖杯图片右边
        this.highestScoreText.top = "-45%";
        this.guiTexture.addControl(this.highestScoreText);

        //创建暂停提示UI
        this.backgroundRect = new GUI.Rectangle();
        this.backgroundRect.width = "100%";
        this.backgroundRect.height = "100%";
        this.backgroundRect.background = "rgba(0, 0, 0, 0.4)"; // 半透明的黑色背景
        this.guiTexture.addControl(this.backgroundRect);
        const text = new GUI.TextBlock();
        text.text = "点击屏幕任意处回到游戏";
        text.color = "white";
        text.fontSize = "5%";
        text.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        text.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.backgroundRect.addControl(text);
        this.backgroundRect.isVisible=false;

        // 创建开始UI
        this.maskRect = new GUI.Rectangle();
        this.maskRect.width = "100%";
        this.maskRect.height = "100%";
        this.maskRect.background = "rgba(0, 0, 0, 0.4)"; // 半透明的黑色背景
        this.maskRect.alpha=0.6;
        this.guiTexture.addControl(this.maskRect);
        this.startButton = GUI.Button.CreateSimpleButton("startButton", "");
        this.startButton.width = "100%";
        this.startButton.height = "100%";
        this.startButton.color = "rgba(0, 0, 0, 0)";
        this.startButton.background = "rgba(0, 0, 0, 0)";
        this.startButton.left = "0%"; 
        this.startButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.startButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.startButton.zIndex=100;
        this.maskRect.addControl(this.startButton);
        this.startButton.onPointerUpObservable.add(() => {
            this.gameStart();
            this.maskRect.isVisible=false;
        });
        var text_gamestart = new GUI.TextBlock();
        text_gamestart.text = "不要沉没";
        text_gamestart.color = "white";
        text_gamestart.fontSize = "15%";
        text_gamestart.top = "-30%"; // 调整文字的垂直位置
        text_gamestart.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        text_gamestart.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.maskRect.addControl(text_gamestart);
        var buttonText = new GUI.TextBlock();
        buttonText.text = "点击屏幕任意处开始游戏";
        buttonText.color = "white";
        buttonText.fontSize = "5%"; // 设置字体大小
        buttonText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        buttonText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.startButton.addControl(buttonText);

        //创建游戏结束UI
        this.maskRect_gameover = new GUI.Rectangle();
        this.maskRect_gameover.width = "100%";
        this.maskRect_gameover.height = "100%";
        this.maskRect_gameover.background = "rgba(0, 0, 0, 1)"; // 半透明的黑色背景
        this.guiTexture.addControl(this.maskRect_gameover);
        var text_gameover = new GUI.TextBlock();
        text_gameover.text = "船沉了";
        text_gameover.color = "white";
        text_gameover.fontSize = "15%";
        text_gameover.top = "-30%"; // 调整文字的垂直位置
        text_gameover.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        text_gameover.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.maskRect_gameover.addControl(text_gameover);
        this.restartButton = GUI.Button.CreateSimpleButton("restartButton", "");
        this.restartButton.width = "100%";
        this.restartButton.height = "100%";
        this.restartButton.color = "rgba(0, 0, 0, 0)";
        this.restartButton.background = "rgba(0, 0, 0, 0)";
        this.restartButton.left = "0%"; 
        this.restartButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.restartButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.restartButton.zIndex=100;
        this.maskRect_gameover.addControl(this.restartButton);
        this.restartButton.onPointerUpObservable.add(() => {
            this.gameStart();
            this.maskRect_gameover.isVisible=false;;
        });
        var buttonText_gameover = new GUI.TextBlock();
        buttonText_gameover.text = "点击屏幕任意处开始游戏";
        buttonText_gameover.color = "white";
        buttonText_gameover.fontSize = "5%"; // 设置字体大小
        buttonText_gameover.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        buttonText_gameover.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.restartButton.addControl(buttonText_gameover);
        this.maskRect_gameover.isVisible=false;

        //创建玩家船
        this.ship=new Ship(this.scene,this.gameOver);
        await this.ship.loadShip();
        this.ship.enableInput();

        //创建障碍物生成器
        this.barrierManager=new BarrierManager(this.scene,this.water,this.guiTexture);
        await this.barrierManager.init();
        this.barrierManager.generator();
        window.addEventListener('blur', ()=>this.pause());
        window.addEventListener('focus', ()=>this.resume());
        this.updateHighestScore();

    }

    gameStart(){
        this.barrierManager?.resetGenerator();
        this.barrierManager?.startGenerator();
        this.updateHighestScore();
    }

    //使用箭头函数避免出现上下文问题
    gameOver=()=>{

        //更新最高分
        this.updateHighestScore();
        
        this.barrierManager?.resetGenerator();
        this.ship.ship.mesh.position=new BABYLON.Vector3(0,4,50);
        this.ship.ship.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(0, 0, 0))

        // 淡入遮罩的动画函数
        this.fadeInMask = () => {
            this.maskRect_gameover.isVisible = true; // 确保遮罩可见
            this.restartButton.isVisible=false;
            var animation = new BABYLON.Animation("fadeIn", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            var keys = [];
            keys.push({
                frame: 0,
                value: 1 
            });
            keys.push({
                frame: 180,
                value: 0.8
            });
            keys.push({
                frame: 240,
                value: 0.4 
            });
            animation.setKeys(keys);
            this.maskRect_gameover.animations = [];
            this.maskRect_gameover.animations.push(animation);
            this.scene.beginAnimation(this.maskRect_gameover, 0, 240, false,1,()=>{
                this.restartButton.alpha=1;
                this.restartButton.isVisible=true;
            });
        };
        this.fadeInMask();
    }


    //执行场景渲染函数
    async render(){
        if(!this.engine){
            console.error('render: engine is required');
            return;
        }

        if(!this.scene){
            console.error('render: scene is required');
            return;
        }
        let divFps = document.getElementById("fps");
        window.pause=false;
        let stopFrame=2;

        this.engine.runRenderLoop(async() => {

            //由于渲染暂停UI需要一帧,所以不能立刻停止渲染循环
            //通过stopFrame多数两帧再进行暂停
            //即使很快的切换,也能确保有一帧的时间渲染UI
            //除非你在两条命令执行的间隔时间内完成由暂停->开始->暂停的切换操作
            if(window.pause&&stopFrame>0){
                stopFrame-=1;
            }

            if(!window.pause||stopFrame>0){
                this.scene.render();
            }

            if((stopFrame<0||stopFrame==0)&&!window.pause){
                stopFrame=2;
            }

            this.barrierManager.fps=this.engine.getFps()
        
            divFps.innerHTML = this.engine.getFps().toFixed() + " fps";
        });

        // 如果屏幕大小改变，重新渲染
        window.addEventListener("resize", () => {
            this.engine?.resize();
        });
    }

    //暂停游戏
    pause(){
        if(this.backgroundRect){
            this.backgroundRect.isVisible=true;
        }
        window.pause=true;

    }

    //恢复游戏
    resume(){
        if(this.backgroundRect){
            this.backgroundRect.isVisible=false;
        }
        window.pause=false;
    }

    updateHighestScore(){

        let cookieScore=this.getHighestScore();

        if(cookieScore==null){
            cookieScore=0;
        }

        //获取当前的分数
        let nowScore=this.barrierManager.currentTime;

        //如果高于历史分数,则更新历史分数
        if(cookieScore<nowScore){
            setCookie("highestScore",nowScore);
            this.highestScoreText.text = nowScore.toString();
        }else{
            this.highestScoreText.text = cookieScore.toString();
        }
    }

    getHighestScore(){
        let cookieScore=null;

        //获取cookie中记录的最高分
        let cookieScoreStr=getCookie("highestScore");
        if(cookieScoreStr==null){
            cookieScore=0
        }else{
            cookieScore=parseInt(cookieScoreStr);
        }

        return cookieScore;
    }
}


//网页cookie设置
function setCookie(name, value, days){
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

//网页cookie获取
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

