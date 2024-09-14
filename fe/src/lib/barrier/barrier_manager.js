//@ts-nocheck
import { Model, modelClone, modelLoaded } from "$lib/model/model";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import "@babylonjs/loaders";

let flashTime=60;

const barrierArray=["stone","wood"];

//障碍物生成管理器,用于障碍物的生成,分数的计算
export class BarrierManager{
    /**
     * @type {number}
     */
    minSpawnX = -45; //障碍物生成的最小X

    /**
     * @type {number}
     */
    maxSpawnX = 45; // 障碍物生成的最大X

    /**
     * @type {number}
     */
    barrierWidth = 4; // 障碍物生成的最小宽度

    /**
     * @type {number}
     */
    barrierHeight = 8; // 障碍物生成的最小高度

    /**
     * @type {number}
     */
    minGapSize = 3; // 玩家最小通过的缝隙大小

    /**
     * @type {number}
     */
    maxGapSize = 10; // 玩家最大通过的缝隙大小

    /**
     * @type {number}
     */
    speed = 20; //当前移动速度

    /**
     * @type {boolean}
     */
    isSpawn = false; //是否执行生成

    /**
     * @type {number}
     */
    currentTime = 0; // 当前时间，以秒为单位

    /**
     * @type {number}
     */
    fps = 60; // 帧数，用于计算时间

    /**
     * @type {number}
     */
    fpsCounter = 60; // 当前帧，用于计算时间

    /**
     * @type {boolean}
     */
    gaming=false; //是否正在游戏

    /**
    * @param {BABYLON.Scene} scene 
    */
    constructor(scene,water,guiTexture){
        if(!scene){
            console.error('scene is required');
            return;
        }
        this.scene = scene;

        if(!water){
            console.error('water is required');
            return;
        }

        this.water=water;
        this.guiTexture=guiTexture;

        //设置垃圾回收计时器
        this.disposeManagerFunc=setInterval(() => {
            this.disposeManager();
        }, 5000);
    }

    async init(){
        if(modelLoaded["stone"]==null){
            this.stone_model=new Model(this.scene,"stone","0","stone",new BABYLON.Vector3(0,-300,20),null,null,{enable: true,mass: 1000,friction: 10,});
            await this.stone_model.load();
    
            if(modelLoaded["stone"]==null){
                console.error("stone_model is null")
                return;
            }
            this.stone_model=modelLoaded["stone"].mesh.visibility=0;
        }

        if(modelLoaded["wood"]==null){
            this.stone_model=new Model(this.scene,"wood","0","wood",new BABYLON.Vector3(0,-300,30),null,null,{enable: true,mass: 1000,friction: 10,});
            await this.stone_model.load();
    
            if(modelLoaded["wood"]==null){
                console.error("wood_model is null")
                return;
            }
            this.stone_model=modelLoaded["wood"].mesh.visibility=0;
        }

        //设置分数UI
        this.timerText = new GUI.TextBlock();
        this.timerText.zIndex=-1000;
        this.timerText.text = "00"; // 初始化时间
        this.timerText.color = "white";
        this.timerText.top = "-45%";
        this.timerText.fontSize = "5%"; // 设置字体大小
        this.timerText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.timerText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.guiTexture.addControl(this.timerText);
        this.scene?.registerBeforeRender(()=>{
            this.fpsCounter-=1;
            if(this.fpsCounter<=0&&this.gaming){
                this.fpsCounter=this.fps/10;
                this.currentTime++; // 增加时间
                if(this.timerText){
                    this.timerText.text = this.currentTime.toString().padStart(2, "0");
                }
            }
        })
        this.timerText.isVisible=false;
    }

    //障碍物具体生成逻辑
    generateBarrier(){
        this.gapSize=this.getRandomInt(this.minGapSize,this.maxGapSize);
        this.gapStart = Math.random() * (this.maxSpawnX - this.minSpawnX - this.barrierWidth - this.gapSize) + this.minSpawnX;
        let rotation_angular=this.getRandomInt(1,10);
        let barrier_choice=barrierArray[this.getRandomInt(0,1)];
        let barrier=modelLoaded[barrier_choice].clone(new BABYLON.Vector3(this.gapStart,4.5,-80),new BABYLON.Vector3(0,Math.PI/rotation_angular,0),null);
        modelClone[barrier_choice].push(barrier);
        barrier.physicsAggregate.body.setAngularDamping(10000);
        barrier.mesh.visibility=1;
        barrier.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(0, 0, this.speed));
    }

    //障碍物生成器
    generator(){
        this.scene?.registerBeforeRender(()=>{
            if(this.isSpawn){
                let speedIncrease=0.001;
                this.speed+=speedIncrease;
                this.water.windForce=-this.speed*3;
                if(this.spawnTime==null){
                    this.heightSpacing=this.getRandomInt(this.barrierHeight,15);
                    this.spawnTime=this.heightSpacing/this.speed*60
                }
                this.spawnTime-=1
    
                if(this.spawnTime<=0){
                    this.heightSpacing=this.getRandomInt(this.barrierHeight,15);
                    this.spawnTime=this.heightSpacing/this.speed*60
                    this.generateBarrier();
                }
            }


        })
    }

    startGenerator(){
        this.isSpawn=true;
        this.gaming=true;
        this.timerText.isVisible=true;
    }

    stopGenerator(){
        this.isSpawn=false;
        this.gaming=false;
    }

    resetGenerator(){

        //停止继续生成障碍物
        this.isSpawn=false;

        //停止计时
        this.gaming=false;

        //隐藏分数面板
        this.timerText.isVisible=false;

        //重置分数(计时)
        this.currentTime=0;
        this.fpsCounter=60;
        this.timerText.text = this.currentTime.toString().padStart(2, "0");
        
        //将地图中生成的障碍物全部清除
        modelClone["stone"].forEach(stone=>{
            stone.dispose();
        })
        modelClone["stone"]=[];

        modelClone["wood"].forEach(wood=>{
            wood.dispose();
        })
        modelClone["wood"]=[];

        this.speed=20;
        this.water.windForce=-this.speed*3;
    }

    //处理模型的销毁问题
    disposeManager(){
        modelClone["stone"].forEach(stone=>{
            if(stone.mesh.position.z>100){
                stone.dispose();
                modelClone["stone"]=modelClone["stone"].filter(item => item.mesh.id != stone.mesh.id);
            }else if(stone.mesh.position.y<0){
                stone.dispose();
                modelClone["stone"]=modelClone["stone"].filter(item => item.mesh.id != stone.mesh.id);
            }
        })
        modelClone["wood"].forEach(wood=>{
            if(wood.mesh.position.z>100){
                wood.dispose();
                modelClone["wood"]=modelClone["wood"].filter(item => item.mesh.id != wood.mesh.id);
            }else if(wood.mesh.position.y<0){
                wood.dispose();
                modelClone["wood"]=modelClone["wood"].filter(item => item.mesh.id != wood.mesh.id);
            }
        })
    }


    //生成随机整数
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}