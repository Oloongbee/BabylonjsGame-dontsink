import * as BABYLON from "@babylonjs/core";
export class ShipWater{
    constructor(scene,ship_mesh){

        if(!scene){
            console.warn('scene is required');
            return;
        }
        this.scene = scene;

        this.position=new BABYLON.Vector3(0,0,-2.0);

        this.position_behind_right=new BABYLON.Vector3(0.4,0,1.2);
        this.position_behind_left=new BABYLON.Vector3(-0.4,0,1.2);

        this.sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1, segments: 2}, scene);
        this.sphere1.visibility=0;
        this.rotation=new BABYLON.Vector3(0,Math.PI/7,0);
        this.sphere1.rotation=this.rotation;
        this.sphere1.position=this.position;
        this.sphere1.parent=ship_mesh;

        this.sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1, segments: 2}, scene);
        this.sphere2.visibility=0;
        this.rotation=new BABYLON.Vector3(0,-Math.PI/7,0);
        this.sphere2.rotation=this.rotation;
        this.sphere2.position=this.position;
        this.sphere2.parent=ship_mesh;

        this.sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1, segments: 2}, scene);
        this.sphere3.visibility=0;
        this.sphere3.rotation=new BABYLON.Vector3(0,0,0);
        this.sphere3.position=this.position_behind_right;
        this.sphere3.parent=ship_mesh;

        this.sphere4= BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:1, segments: 2}, scene);
        this.sphere4.visibility=0;
        this.sphere4.rotation=new BABYLON.Vector3(0,0,0);
        this.sphere4.position=this.position_behind_left;
        this.sphere4.parent=ship_mesh;

        this.minLifeTime=0.3;
        this.maxLifeTime=0.5;
        this.minLifeTime_behind=0.5;
        this.maxLifeTime_behind=1;
        this.minSize=0.05;
        this.maxSize=0.1
        this.minPower=5;
        this.maxPower=8;
        this.minPower_behind=3;
        this.maxPower_behind=4;

        this.particleSystem1 = new BABYLON.ParticleSystem("particles", 2000, scene);
        this.particleSystem1.particleTexture = new BABYLON.Texture("/flare.png", scene);
        this.particleSystem1.emitter = this.sphere1;
        this.particleSystem1.color1 = new BABYLON.Color4(0.99, 0.99, 0.99);
        this.particleSystem1.color2 = new BABYLON.Color4(0.62, 0.7, 0.84);
        this.particleSystem1.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        this.particleSystem1.minSize = this.minSize;
        this.particleSystem1.maxSize = this.maxSize;
        this.particleSystem1.minLifeTime = this.minLifeTime;
        this.particleSystem1.maxLifeTime = this.maxLifeTime;
        this.particleSystem1.emitRate = 2000;
        this.particleSystem1.createDirectedSphereEmitter(0.1, new BABYLON.Vector3(0, 0.1, 2), new BABYLON.Vector3(0.2, 0, 0));
        this.particleSystem1.minEmitPower = this.minPower;
        this.particleSystem1.maxEmitPower = this.maxPower;
        this.particleSystem1.updateSpeed = 0.005;

        this.particleSystem2 = new BABYLON.ParticleSystem("particles", 2000, scene);
        this.particleSystem2.particleTexture = new BABYLON.Texture("/flare.png", scene);
        this.particleSystem2.emitter = this.sphere2;
        this.particleSystem2.color1 = new BABYLON.Color4(0.99, 0.99, 0.99);
        this.particleSystem2.color2 = new BABYLON.Color4(0.62, 0.7, 0.84);
        this.particleSystem2.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        this.particleSystem2.minSize = this.minSize;
        this.particleSystem2.maxSize = this.maxSize;
        this.particleSystem2.minLifeTime = this.minLifeTime;
        this.particleSystem2.maxLifeTime = this.maxLifeTime;
        this.particleSystem2.emitRate = 2000;
        this.particleSystem2.createDirectedSphereEmitter(0.1, new BABYLON.Vector3(0, 0.1, 2), new BABYLON.Vector3(-0.2, 0, 0));
        this.particleSystem2.minEmitPower = this.minPower;
        this.particleSystem2.maxEmitPower = this.maxPower;
        this.particleSystem2.updateSpeed = 0.005;

        this.particleSystem3 = new BABYLON.ParticleSystem("particles", 100, scene);
        this.particleSystem3.particleTexture = new BABYLON.Texture("/flare.png", scene);
        this.particleSystem3.emitter = this.sphere3;
        this.particleSystem3.color1 = new BABYLON.Color4(0.99, 0.99, 0.99);
        this.particleSystem3.color2 = new BABYLON.Color4(0.62, 0.7, 0.84);
        this.particleSystem3.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        this.particleSystem3.minSize = this.minSize;
        this.particleSystem3.maxSize = this.maxSize;
        this.particleSystem3.minLifeTime = this.minLifeTime_behind;
        this.particleSystem3.maxLifeTime = this.maxLifeTime_behind;
        this.particleSystem3.emitRate = 2000;
        this.particleSystem3.createDirectedSphereEmitter(0.1, new BABYLON.Vector3(0, 0.1, 3), new BABYLON.Vector3(0.2, 0, 0));
        this.particleSystem3.minEmitPower = this.minPower_behind;
        this.particleSystem3.maxEmitPower = this.maxPower_behind;
        this.particleSystem3.updateSpeed = 0.005;

        this.particleSystem4 = new BABYLON.ParticleSystem("particles", 100, scene);
        this.particleSystem4.particleTexture = new BABYLON.Texture("/flare.png", scene);
        this.particleSystem4.emitter = this.sphere4;
        this.particleSystem4.color1 = new BABYLON.Color4(0.99, 0.99, 0.99);
        this.particleSystem4.color2 = new BABYLON.Color4(0.62, 0.7, 0.84);
        this.particleSystem4.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        this.particleSystem4.minSize = this.minSize;
        this.particleSystem4.maxSize = this.maxSize;
        this.particleSystem4.minLifeTime = this.minLifeTime_behind;
        this.particleSystem4.maxLifeTime = this.maxLifeTime_behind;
        this.particleSystem4.emitRate = 2000;
        this.particleSystem4.createDirectedSphereEmitter(0.1, new BABYLON.Vector3(0, 0.1, 3), new BABYLON.Vector3(-0.2, 0, 0));
        this.particleSystem4.minEmitPower = this.minPower_behind;
        this.particleSystem4.maxEmitPower = this.maxPower_behind;
        this.particleSystem4.updateSpeed = 0.005;
    
        this.particleSystem1.start();
        this.particleSystem2.start();
        this.particleSystem3.start();
        this.particleSystem4.start();
    }

    stop(){
        this.particleSystem1.stop();
        this.particleSystem2.stop();
    }

    start(){
        this.particleSystem1.start();
        this.particleSystem2.start();
        this.particleSystem3.start();
        this.particleSystem4.start();
    }

    fast(){
        this.sphere1.position=new BABYLON.Vector3(0,0,-2.1);;
        this.sphere1.rotation=new BABYLON.Vector3(0,Math.PI/5,0);
        this.particleSystem1.minEmitPower = 7;
        this.particleSystem1.maxEmitPower = 10;
        this.sphere2.position=new BABYLON.Vector3(0,0,-2.1);;
        this.sphere2.rotation=new BABYLON.Vector3(0,-Math.PI/5,0);
        this.particleSystem2.minEmitPower = 7;
        this.particleSystem2.maxEmitPower = 10;
    }

    reset(){
        this.sphere1.position=this.position;;
        this.sphere1.rotation=new BABYLON.Vector3(0,Math.PI/7,0);
        this.particleSystem1.minEmitPower = this.minPower;
        this.particleSystem1.maxEmitPower = this.maxPower;
        this.sphere2.position=this.position;
        this.sphere2.rotation=new BABYLON.Vector3(0,-Math.PI/7,0);
        this.particleSystem2.minEmitPower = this.minPower;
        this.particleSystem2.maxEmitPower = this.maxPower;
    }

    dispose(){
        this.sphere1.dispose();
        this.sphere2.dispose();
        this.sphere3.dispose();
        this.sphere4.dispose();
        this.particleSystem1.dispose();
        this.particleSystem2.dispose();
        this.particleSystem3.dispose();
        this.particleSystem4.dispose();
    }
}