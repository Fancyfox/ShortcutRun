export default class ES extends Laya.EventDispatcher {
    private static _instance:ES;
    public static get instance(){
        !this._instance && (this._instance = new ES());
        return this._instance;
    }

    public static on_pass_level = 'on_pass_level';
    public static on_fail_level = 'on_fail_level';
    public static on_clear_scene = 'on_clear_scene';
    public static on_level_loaded = 'on_level_loaded';

    
    public static on_game_ready='on_game_ready';
    public static on_game_start='on_game_start';
     public static on_back_home='on_back_home';
     public static on_game_reset='on_game_reset';
     public static on_show_tip='on_show_tip';

     public static msg_draw_end='msg_draw_end';
     public static msg_be_discovered='msg_be_discovered';
     public static msg_be_freezed='msg_be_freezed';
     public static msg_off_trap='msg_off_trap';
     public static msg_switch_enter='msg_switch_enter';
     public static msg_hit_enemy='msg_hit_enemy';
     public static msg_camera_move='msg_camera_move';
     public static msg_save_princess='msg_save_princess';
     
     
    
}