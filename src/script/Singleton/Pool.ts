import GameDefine from "./GameDefine";

export default class Pool {
    private static _instance: Pool;
    public static get instance() {
        if (!this._instance) this._instance = new Pool();
        return this._instance;
    }
    private plankHand_array: Array<Laya.Sprite3D> = [];
    private plankRoad_array: Array<Laya.Sprite3D> = [];
    private effect_map = new Map<string, Laya.Sprite3D[]>();
    /**初始化方块的大小 */
    private cube_scale: Laya.Vector3 = new Laya.Vector3(1, 1, 1);
    public getPlank_hand(parent: Laya.Sprite3D, pos: Laya.Vector3): Laya.Sprite3D {

        let cube: Laya.Sprite3D
        if (this.plankHand_array.length <= 0) {
            let prefab = Laya.loader.getRes(GameDefine.prefabRoot + "plank_hand.lh");
            cube = Laya.Sprite3D.instantiate(prefab, parent, true) as Laya.Sprite3D;
        } else {
            cube = this.plankHand_array.pop();
            parent.addChild(cube);
        }

        cube.transform.position = pos;
        cube.active = true;
        return cube;
    }
    /**
     * 获取玩家方块
     * @param parent 父物体
     * @param pos 世界坐标
     */
    public getPlank_road(parent: Laya.Sprite3D, pos: Laya.Vector3): Laya.Sprite3D {
        let cube: Laya.Sprite3D
        if (this.plankRoad_array.length <= 0) {
            let prefab = Laya.loader.getRes(GameDefine.prefabRoot + "plank_road.lh");
            cube = Laya.Sprite3D.instantiate(prefab, parent, true) as Laya.Sprite3D;
        } else {
            cube = this.plankRoad_array.pop();
            parent.addChild(cube);
        }
        cube.transform.position = pos;
        // cube.transform.setWorldLossyScale(this.cube_scale);
        cube.active = true;
        return cube;
    }

    /**
     * 存储玩家方块
     * @param cube 玩家方块
     */
    public reversePlankHandCube(cube: Laya.Sprite3D) {
        cube.active = false;
        cube.removeSelf();
        this.plankHand_array.push(cube);
    }

    public reversePlankRoadCube(cube: Laya.Sprite3D) {
        cube.active = false;
        cube.removeSelf();
        this.plankRoad_array.push(cube);
    }



    /**清空对象池 */
    public clearPool() {
        let len1: number = this.plankRoad_array.length;
        for (let i = 0; i < len1; i++) {
            let cube = this.plankRoad_array.pop();
            if (cube) {
                cube.removeSelf();
                cube.destroy();
            }
        }
        let len2: number = this.plankHand_array.length;
        for (let i = 0; i < len2; i++) {
            let cube = this.plankHand_array.pop();
            if (cube) {
                cube.removeSelf();
                cube.destroy();
            }
        }

        this.plankHand_array.length = 0;
        this.plankRoad_array.length = 0;;
    }


}