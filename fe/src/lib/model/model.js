import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";

//存放已经加载好的模型
export let modelLoaded={
    "ship":null,
    "stone":null,
    "wood":null,
}

export let modelClone={
    "ship":[],
    "stone":[],
    "wood":[],
}

export class Model{

    num = 0;

    /**
     * @type {string}
     */
    id = "";

    /**
     * @type {string}
     */
    name = "";

    /**
     * @type {BABYLON.Scene | undefined}
     */
    scene;

    /**
     * @type {BABYLON.Vector3}
     */
    position = new BABYLON.Vector3(0, 1, 0);

    /**
     * @type {BABYLON.Vector3}
     */
    rotation = new BABYLON.Vector3(0, 0, 0);

    /**
     * @type {BABYLON.Vector3}
     */
    scaling = new BABYLON.Vector3(1, 1, 1);

    /**
     * @type {BABYLON.PhysicsAggregate | undefined}
     */
    physicsAggregate;

    physicsOptions = {
        enable: true,
        mass: 1,
        friction: 0,
    }

    /**
     * @param {BABYLON.Scene} scene
     * @param {string} modelName
     * @param {string} id
     * @param {string} name
     * @param {BABYLON.Vector3 | null} position
     * @param {BABYLON.Vector3 | null} rotation
     * @param {BABYLON.Vector3 | null} scaling
     * @param {Object | null} physicsOptions
     */
    constructor(scene,modelName,id,name,position,rotation,scaling,physicsOptions){
        if(!scene){
            console.warn('scene is required');
            return;
        }
        this.scene = scene;

        if(!modelName){
            console.warn('modelName is required');
            return;
        }
        this.modelName = modelName;

        this.id = id || "";
        this.name = name || "";
        this.position = position || new BABYLON.Vector3(0, 1, 0);
        this.rotation = rotation || new BABYLON.Vector3(0, 0, 0);
        this.scaling = scaling || new BABYLON.Vector3(1, 1, 1);
        this.physicsOptions = physicsOptions || {
            enable: true,
            mass: 1,
            friction: 0,
        };
    }

    //载入模型
    async load(){
        if(!this.scene){
            console.warn('scene is required');
            return;
        }

        //检查模型是否已经载入
        if(modelLoaded[this.modelName]!=null){
            console.log("model "+this.modelName+" is loaded");
            return;
        }

        let loadedModel = await BABYLON.SceneLoader.ImportMeshAsync('', "/model/", this.modelName+".glb", this.scene);
        if(!loadedModel){
            console.error('Failed to load model(' + this.modelName + ')');
            return;
        }

        // 获取模型
        this.mesh = loadedModel.meshes[1];
        if(!this.mesh){
            console.error('Failed to get mesh(model:' + this.modelName + ')');
            return;
        }

        // 设置模型属性
        if(this.mesh.name !== ""){
            this.mesh.name = this.name;
        }

        if(this.id !== ""){
            this.mesh.id = this.id;
        }

        this.mesh.position = this.position;
        this.mesh.rotation = this.rotation;
        this.mesh.scaling = this.scaling;

        if(this.physicsOptions.enable){
            this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh, BABYLON.PhysicsShapeType.BOX, this.physicsOptions, this.scene);
            if(!this.physicsAggregate){
                console.error('Failed to create physics aggregate for model(' + this.modelName + ')');
            }

            // 取消物理前置, 可以自定义物体的物理属性 
            this.physicsAggregate.body.disablePreStep = false;
        }

        modelLoaded[this.modelName]=this;
    }

    // 隐藏模型
    hide(){
        if(!this.mesh){
            console.warn('mesh has not been loaded');
            return;
        }

        this.mesh.setEnabled(false);
    }

    // 显示模型
    show(){
        if(!this.mesh){
            console.warn('mesh has not been loaded');
            return;
        }

        this.mesh.setEnabled(true);

    }

        /**
     * 
     * @param {BABYLON.Vector3} position 
     * @param {BABYLON.Vector3} rotation 
     * @param {BABYLON.Vector3} scaling 
     * @returns {Model | null}
     */
    clone(position, rotation, scaling){
        if(!this.scene){
            console.warn('scene is required');
            return null;
        }

        if(!this.mesh){
            console.warn('mesh has not been loaded');
            return null;
        }

        let newMesh = this.mesh.clone();
        if(!newMesh){
            console.error('Failed to clone mesh(' + this.name + ')');
            return null;
        }

        let newID = this.num++;
        let newName = this.name;


        // 创建一个新的模型对象
        let newModel = new Model(this.scene, this.modelName, newID,newName, position, rotation, scaling, this.physicsOptions);

        // 设置新模型的网格体
        newMesh.id = newID+'';

        newMesh.name = newName;

        if(position){
            newMesh.position = position;
        }

        if(rotation){
            newMesh.rotation = rotation;
        }

        if(scaling){
            newMesh.scaling = scaling;
        }

        newModel.mesh = newMesh;

        // 如果父本模型有物理属性，那么克隆的模型也需要有物理属性
        if(this.physicsOptions.enable){
            let newPhysicsAggregate = new BABYLON.PhysicsAggregate(newMesh, BABYLON.PhysicsShapeType.BOX, this.physicsOptions, this.scene);
            if(!newPhysicsAggregate){
                console.error('Failed to create physics aggregate for model(' + this.name + ')');
            }
            
            // 取消物理引擎前置, 使物理引擎可以在每一帧中更新物理状态
            newPhysicsAggregate.body.disablePreStep = false;

            newModel.physicsAggregate = newPhysicsAggregate;
        }

        return newModel;
    }

    /**
     * @returns {boolean}
     */
    dispose(){
        if(!this.mesh){
            console.warn('mesh has not been loaded');
            return false;
        }
 
        this.mesh.dispose();

        if(this.physicsAggregate){
            this.physicsAggregate.dispose();
        }   

        return true;
    }

}