//@ts-nocheck
import { Model, modelLoaded } from "$lib/model/model";
import { ShipWater } from "$lib/special_effect/ship_water";
import { WoodPiece } from "$lib/special_effect/wood_piece";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

const KEYBOARD = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    SPACE: 32,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13,
    ESC: 27,
    SHIFT: 16,
}



export class Ship{

    /**
     * @type {number}
     */
    linearDamping = 1; // 线性阻尼,速度衰减程度

    /**
     * @type {number}
     */
    angularDamping = 10000000; // 角阻尼,速度衰减程度

    /**
     * @type {number}
     */
    speed=3;//船移动的速度

    /**
    * @param {BABYLON.Scene} scene 
    */
    constructor(scene,gameoverFunc){
        if(!scene){
            console.error('scene is required');
            return;
        }
        this.scene = scene;

        if(!gameoverFunc){
            console.error('gameoverFunc is required');
            return;
        }
        this.gameoverFunc = gameoverFunc;
    }

    async loadShip(){
        this.ship_model=new Model(this.scene,"ship","0","ship",new BABYLON.Vector3(0,-300,20),null,null,{enable: true,mass: 5,friction: 1,restitution:0});
        await this.ship_model.load();

        if(modelLoaded["ship"]==null){
            console.error("ship_model is null")
            return;
        }
        this.ship=modelLoaded["ship"].mesh.visibility=0;
        this.ship=modelLoaded["ship"].clone(new BABYLON.Vector3(0,4,50),null,null);
        this.ship.mesh.visibility=1;
    

        //给船上下浮动的动画
        this.frameRate=10
        const xSlide = new BABYLON.Animation("xSlide", "position.y", this.frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const keyFrames = []; 
        keyFrames.push({
            frame: 0,
            value: 5
        });
        keyFrames.push({
            frame: this.frameRate,
            value: 4.3
        });
        keyFrames.push({
            frame: 2 * this.frameRate,
            value: 5
        });
        xSlide.setKeys(keyFrames);
        this.scene.beginDirectAnimation(this.ship.mesh, [xSlide], 0, 2 * this.frameRate, true);
        let timeoutId = null;
        let playingWoodPiece=false;

        //注册碰撞回调函数
        this.ship.physicsAggregate.body.setCollisionCallbackEnabled(true);
        this.collisionObservable=this.ship.physicsAggregate.body.getCollisionObservable();
        if(this.collisionObservable == null){
            console.warn('创建碰撞观察量失败');
        }else{
            this.collisionObserver=this.collisionObservable.add((collision)=>{

                //如果存在该计时器,并且发生了新的碰撞,那就清除这个计时器
                if (timeoutId !== null) {
                    clearTimeout(timeoutId);
                }

                let collider = collision.collidedAgainst;
                
                if(collider == null){
                    console.warn('未检测到碰撞体');
                    return;
                }
                let transformNode = collider.transformNode;
                if(transformNode == null){
                    console.warn('未检测到碰撞体的变换节点');
                    return;
                }

                if(playingWoodPiece==false){
                    playingWoodPiece=true;
                    let clone_wood_piece=this.wood_piece?.particleSystem?.clone("clone_particle",this.ship.mesh.position);
                    clone_wood_piece?.start();
                    setTimeout(() => {
                        clone_wood_piece.stop();
                    }, 100);
                    setTimeout(() => {
                        clone_wood_piece.dispose();
                    }, 1000);
                }

                if(this.ship.mesh.position.z>65){
                    console.log("gameover");
                    this.gameoverFunc();
                }

                // 设置一个新的定时器，在指定的延迟后执行resetDirection函数
                //这样在100ms内如果再次发生碰撞就不会重复调用导致卡顿
                timeoutId = setTimeout(() => {
                    this.resetDirection();
                    playingWoodPiece=false;
                    timeoutId = null;
                }, 100); 
            })
        }
        
        this.water_se=new ShipWater(this.scene,this.ship.mesh);
        this.wood_piece=new WoodPiece(this.scene);
    }

    //启用输入
    enableInput(){

        this.ship.physicsAggregate.body.setLinearDamping(this.linearDamping);
        this.ship.physicsAggregate.body.setAngularDamping(this.angularDamping);

        // 获取渲染画布焦点
        this.scene.getEngine().getRenderingCanvas().focus();

        //创建设备资源管理器
        if (!this.deviceSourceManager) {
            this.deviceSourceManager = new BABYLON.DeviceSourceManager(this.scene.getEngine());
            if (!this.deviceSourceManager) {
                console.error("Failed to create device source manager");
                return false;
            }
        }

        if(!this.ship){
            console.error('ship is required!');
            return;
        }

        if(!this.ship.mesh){
            console.error('ship.mesh is required!');
            return;
        }

        let keyboardListener=async()=>{

            let keyboardDevice = this.deviceSourceManager.getDeviceSource(BABYLON.DeviceType.Keyboard);

            if(keyboardDevice){
                // WASD、方向键控制移动
                if(keyboardDevice.getInput(KEYBOARD.W) == 1 || keyboardDevice.getInput(KEYBOARD.UP) == 1){
                    if(this.ship.mesh.position.z>10){
                        this.ship.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(0, 0, -this.speed*1));
                    }
                } else if(keyboardDevice.getInput(KEYBOARD.S) == 1 || keyboardDevice.getInput(KEYBOARD.DOWN) == 1){
                    if(this.ship.mesh.position.z<55){
                        this.water_se?.stop();
                        this.ship.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(0, 0, this.speed*2));
                    }
                }else if(keyboardDevice.getInput(KEYBOARD.D) == 1 || keyboardDevice.getInput(KEYBOARD.RIGHT) == 1){
                    if(this.ship.mesh.position.x<30){
                        this.ship.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(this.speed*3, 0, 0));
                    }
                }else if(keyboardDevice.getInput(KEYBOARD.A) == 1 || keyboardDevice.getInput(KEYBOARD.LEFT) == 1){
                    if(this.ship.mesh.position.x>-30){
                        this.ship.physicsAggregate.body.setLinearVelocity(new BABYLON.Vector3(-this.speed*3, 0, 0));
                    }
                }
                else if(keyboardDevice.getInput(KEYBOARD.SPACE) == 1){
                    console.log(this.ship.mesh.position);
                }

                let v=this.ship.physicsAggregate.body.getLinearVelocity();
                if(v.z<1){
                    this.water_se?.start();
                }
                if(v.z<-2.5){
                    this.water_se?.fast();
                }
                if(v.z>-1){
                    this.water_se?.reset();
                }
            }
        }

        this.scene?.registerBeforeRender(keyboardListener)
    }

    //重新设定船的方向
    resetDirection(){
        if(!this.ship){
            console.error('ship is required!');
            return;
        }

        if(!this.ship.mesh){
            console.error('ship.mesh has not been created!');
            return;
        }

        if(!this.scene){
            console.error('scene is required!');
            return;
        }

        //重置方向
        let rotationAnimation = new BABYLON.Animation("rotation", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let startFrame = 0;
        let endFrame = 30;
        let keys = [
            {
                frame: startFrame,
                value: this.ship.mesh.rotationQuaternion
            },
            {
                frame: endFrame,
                value: BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, 0)
            }
        ]
        rotationAnimation.setKeys(keys);
        this.ship.mesh.animations.push(rotationAnimation);
        this.scene.beginAnimation(this.ship.mesh, startFrame, endFrame, false, 1,()=>{

        });

        //重置位置
        const xSlide = new BABYLON.Animation("xSlide", "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const keyFrames = []; 
        keyFrames.push({
            frame: 0,
            value: this.ship.mesh.position.y
        });
        keyFrames.push({
            frame: 30,
            value: 4
        });
        xSlide.setKeys(keyFrames);
        this.scene.beginDirectAnimation(this.ship.mesh, [xSlide], 0, 30, false,1,()=>{
            //给船上下浮动的动画
            this.frameRate=10
            const xSlide = new BABYLON.Animation("xSlide", "position.y", this.frameRate, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            const keyFrames = []; 
            keyFrames.push({
                frame: 0,
                value: 4
            });
            keyFrames.push({
                frame: this.frameRate,
                value: 4.7
            });
            keyFrames.push({
                frame: 2 * this.frameRate,
                value: 4
            });
            xSlide.setKeys(keyFrames);
            this.scene.beginDirectAnimation(this.ship.mesh, [xSlide], 0, 2 * this.frameRate, true);
        });

    }

}