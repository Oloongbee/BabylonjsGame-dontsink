import * as BABYLON from "@babylonjs/core";
export class WoodPiece{
    constructor(scene){
        if(!scene){
            console.warn('scene is required');
            return;
        }
        this.scene = scene;

        this.particleSystem = new BABYLON.ParticleSystem("woodenbox_broken", 200, this.scene);
        this.particleSystem.particleTexture = new BABYLON.Texture("/wood_piece.png", this.scene);
        this.particleSystem.emitter = BABYLON.Vector3.Zero();
        this.particleSystem.color1 = new BABYLON.Color4(0.90, 0.34, 0.01);
        this.particleSystem.color2 = new BABYLON.Color4(0.84, 0.52, 0.02);
        this.particleSystem.colorDead = new BABYLON.Color4(0.3, 0.25, 0.0, 0.00);
        this.particleSystem.minSize = 0.5;
        this.particleSystem.maxSize = 1;
        this.particleSystem.minLifeTime = 0.1;
        this.particleSystem.maxLifeTime = 0.5;
        this.particleSystem.emitRate = 3000;
        this.particleSystem.createSphereEmitter(2);
        this.particleSystem.addVelocityGradient(0, 150, 170);
        this.particleSystem.addVelocityGradient(0.05, 15, 20);
        this.particleSystem.addVelocityGradient(1.0, 1, 1);
        this.particleSystem.updateSpeed = 0.001;
        this.particleSystem.minAngularSpeed = 1;
        this.particleSystem.maxAngularSpeed = 200;
        this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD
    }
}