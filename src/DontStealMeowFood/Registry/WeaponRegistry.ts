import Registry from "../../Wolfie2D/Registry/Registries/Registry";
import ResourceManager from "../../Wolfie2D/ResourceManager/ResourceManager";
// import Slice from "../GameSystems/items/WeaponTypes/Slice";
import WeaponType from "../GameSystems/items/WeaponTypes/WeaponType";
import Yoyo2 from "../GameSystems/Items/WeaponTypes/Yoyo2";

export default class WeaponTemplateRegistry extends Registry<WeaponConstructor> {
    
    public preload(): void {
        const rm = ResourceManager.getInstance();

        // Load sprites
        // rm.image("pistol", "hw4_assets/sprites/pistol.png");
        // rm.image("knife", "hw4_assets/sprites/knife.png");
        // rm.image("laserGun", "hw4_assets/sprites/laserGun.png")

        // Load spritesheets
        // rm.spritesheet("slice", "hw4_assets/spritesheets/slice.json");

        // Register default types
        // this.registerItem("slice", Slice);
        this.registerItem("yoyo",Yoyo2);
    }

    // We don't need this for this assignment
    public registerAndPreloadItem(key: string): void {}

    public registerItem(key: string, constr: WeaponConstructor): void {
        this.add(key, constr);
    }
}

type WeaponConstructor = new (...args: any) => WeaponType;