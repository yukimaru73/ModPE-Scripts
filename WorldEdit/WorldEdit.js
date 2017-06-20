var TileEdit = new (function () {
    var TASKS = [];
    var DONE_TASKS = [];
    var TILES_PER_TICK = 32;

    var BUFFER = [];

    this.doTask = () => {//this will work in modTick hook
        var TASK_AMOUNT = TASKS.length;
        var BUF_AMOUNT = BUFFER.length;
        if (TASK_AMOUNT === 0) return;

        if (BUF_AMOUNT === 0) {
            BUFFER = MISC.cloneObject(TASKS[0].getTask());
        }
        for (var i = 0; i < 33; i++) {
            if (BUFFER.length === 0) break;
            var TILE = BUFFER.shift();
            Level.setTlie(TILE.X, TILE.Y, TILE.Z, TILE.ID, TILE.DATA);

        }

    };

    this.addTasks = (Task) => {
        TASKS.push(Task);
    };

    this.Task = function () {
        var TASK = [];
        this.addTask = (x, y, z, id, data) => {
            TASK.push({
                "X": x,
                "Y": y,
                "Z": z,
                "ID": id,
                "DATA": data
            });
        };

        this.getTask = () => {
            return TASK;
        };
    };
});

var CreateObject = new (function () {
    this.line = (Xs, Xe, Zs, Ze, Ys, Ye, ID, DATA) => {
        var dX = Xe - Xs,
            dZ = Ze - Zs,
            dY = Ye - Ys;

        var TASK = new TileEdit.Task();
        if (dX > dZ) {
            if (dX > dY) {//dX is max
                var sY = dY / dX,
                    sZ = dZ / dX;

                var dcY, dcZ;
                for (var dcX = Xs; dcX <= Xe; dcX++) {
                    dcY = Math.round(sY * dcX + Ys);
                    dcZ = Math.round(sZ * dcX + Zs);
                    TASK.addTask(dcX, dcY, dcZ, ID, DATA);
                }
            } else {//dY is max
                var sX = dX / dY,
                    sZ = dZ / dY;

                var dcX, dcZ;
                for (var dcY = Ys; dcY <= Ye; dcY++) {
                    dcX = Math.round(sX * dcY + Xs);
                    dcZ = Math.round(sZ * dcY + Zs);
                    TASK.addTask(dcX, dcY, dcZ, ID, DATA);
                }
            }
        } else {
            if (dZ > dY) {//dZ is max
                var sX = dX / dZ,
                    sY = dY / dZ;

                var dcX, dcY;
                for (var dcZ = Zs; dcZ <= Ze; dcZ++) {
                    dcX = Math.round(sX * dcZ + Xs);
                    dcY = Math.round(sY * dcZ + Ys);
                    TASK.addTask(dcX, dcY, dcZ, ID, DATA);
                }
            } else {//dY is max
                var sX = dX / dY,
                    sZ = dZ / dY;

                var dcX, dcZ;
                for (var dcY = Ys; dcY <= Ye; dcY++) {
                    dcX = Math.round(sX * dcY + Xs);
                    dcZ = Math.round(sZ * dcY + Zs);
                    TASK.addTask(dcX, dcY, dcZ, ID, DATA);
                }
            }
        }
        TileEdit.addTasks(TASK);
    };

    this.circle_empty = (Xc, Yc, Zc, R, ELLIPTICITY_X, ELLIPTICITY_Z, ID, DATA) => {
        var TASK = new TileEdit.Task();
        
            
        var abs_dz;
        for (var dx = -R; dx <= R; dx++) {
            abs_dz = Math.round(Math.sqrt(Math.pow(R, 2) - Math.pow(dx, 2)));
            TASK.addTask(Xc + dx, Yc, Zc + abs_dz, ID, DATA);
            TASK.addTask(Xc + dx, Yc, Zc - abs_dz, ID, DATA);
        }
    };

    this.circle_filled = (Xc, Yc, Zc, R, ID, DATA) => {
        var TASK = new TileEdit.Task();
        for (var dX = -R; dX <= R; dX++) {
            for (var dZ = -R; dZ <= R; dZ++) {
                if ((Math.pow(dX, 2) + Math.pow(dZ, 2)) <= R)
                    TASK.addTask(Xc + Math.round(dX), Yc, Zc + Math.round(dZ), ID, DATA);
            }
        }
    };

    this.sphere_empty = () => {

    };

    this.sphere_filled = () => {

    }

    this.cube_empty = () => {

    };

    this.cube_filled = () => {

    };
});

var MISC = new (function () {
    this.cloneObject = function cloneObject(obj) {
        switch (MISC.typeOf(obj)) {
            case "array":
                var NewArray = [];
                for (var i = 0; i < obj.length;) {
                    NewArray.push(cloneObject(obj[i]));
                }
                return NewArray;
                break;

            case "object":
                var NewObject = {};
                for (var key in obj) {
                    if (object.hasOwnProperty(key)) {
                        var element = object[key];
                        NewObject[key] = cloneObject(element);
                    }
                }
                return NewObject;
                break;

            default:
                return obj;
                break;

        }
    };

    this.typeOf = (obj) => {
        var toString = Object.prototype.toString;
        return toString.call(obj).slice(8, -1).toLowerCase();
    };
});

var GUI = new (function () {
    const MATCH_PARENT = android.widget.RelativeLayout.LayoutParams.MATCH_PARENT;
    const WRAP_CONTENT = android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT;

    const getCtx = () => com.mojang.minecraftpe.MainActivity.currentMainActivity.get;
    const getWidth = () => getCtx().getWindowManager().getDefaultDisplay().getWidth;
    const getHeight = () => getCtx().getWindowManager().getDefaultDisplay().getHeight;
    const getDecorView = () => getCtx().getWindow().getDecorView;

    const AlertDialog = android.app.AlertDialog;
    const Button = android.widget.Button;
    const Color = android.graphics.Color;
    const CheckBox = android.widget.CheckBox;
    const EditText = android.widget.EditText;
    const Gravity = android.view.Gravity;
    const LinearLayout = android.widget.LinearLayout;
    const OnClickListener = android.view.View.OnClickListener;
    const PopupWindow = android.widget.PopupWindow;
    const Runnable = java.lang.Runnable;
    const ScrollView = android.widget.ScrollView;
    const SeekBar = android.widget.SeekBar;
    const TextView = android.widget.TextView;

    this.MainPopupWindow = new (function () {
        this.layout = new LinearLayout(getCtx());
        this.popupWindow = null;
        this.show = () => {
            var LAYOUT = this.layout;
            var POPUPWINDOW = this.popupWindow;

            if (POPUPWINDOW !== null) return;

            POPUPWINDOW = new PopupWindow(
                LAYOUT,
                getWidth(),
                getHeight()
            );
            getCtx().runOnUiThread(new Runnable({
                run: function () {
                    try {
                        POPUPWINDOW.showAtLocation(getDecorView(), Gravity.LEFT | Gravity.TOP, 0, 0);
                    } catch (e) {
                        print(e);
                    }
                }

            }));
        };
        this.hide = () => {
            var LAYOUT = this.layout;
            var POPUPWINDOW = this.popupWindow;

            if (POPUPWINDOW === null) return;
            getCtx().runOnUiThread(new Runnable({
                run: function () {
                    POPUPWINDOW.dismiss();
                    POPUPWINDOW = null;
                }
            }));
        };

        this.Children = new (function () {
            this.Header = new (function () {

            });
            this.Content = new (function () {

            });

        });
    }());

    this.MainMenu = new (function () {
        this.layout = new LinearLayout(getCtx());
    });
}());