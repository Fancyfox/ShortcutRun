import Planks from "./Planks";

export class StaticDataManager {
    public static getPlanksRecord(id?: string) {
        //Laya.loader.load()
        let plankTmpl = Planks["Planks"]["0"];
        
        if (!plankTmpl) {
            console.trace();
            return;
        }
        if (id) {
            return plankTmpl[id];
        }

        return plankTmpl;
    }
}