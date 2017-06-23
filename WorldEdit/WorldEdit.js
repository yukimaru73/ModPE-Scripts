"use strict";
//-++->ModPE Hook Functions<-++-//
function modTick(){
	TileEdit.doTask();
}

function useItem(){

}

//-++->Functions of This Mod<-++-//
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

		var TILE;
		for (var i = 0; i <= TILES_PER_TICK; i++) {
			if (BUFFER.length === 0) break;
			TILE = BUFFER.shift();
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

		this.ready_to_do = () => {
			TileEdit.addTasks(this);
		};
	};
});

var CreateObject = new (function () {
	this.line = (Xs, Xe, Zs, Ze, Ys, Ye, ID, DATA) => {
		var TASK = new TileEdit.Task();
		var dX = Xe - Xs,
			dZ = Ze - Zs,
			dY = Ye - Ys;

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

	this.circle_empty = (Xc, Zc, Yc, R, ELLIPTICITY_X, ELLIPTICITY_Z, ID, DATA) => {
		var TASK = new TileEdit.Task();
		var Rx = R * ELLIPTICITY_X,
			Rz = R * ELLIPTICITY_Z;

		for (var dX = -Rx, dZ; x <= Rx; dX++) {
			dZ = Math.round(Math.sqrt((Math.pow(R, 2) - Math.pow(dX / ELLIPTICITY_X, 2)) * Math.pow(ELLIPTICITY_Z, 2)));
			TASK.addTask(Xc + dX, Yc, Zc + dZ, ID, DATA);
			TASK.addTask(Xc + dX, Yc, Zc - dZ, ID, DATA);
		}
		return TASK;
	};

	this.circle_filled = (Xc, Zc, Yc, R, ELLIPTICITY_X, ELLIPTICITY_Z, ID, DATA) => {
		var TASK = new TileEdit.Task();
		var Rx = R * ELLIPTICITY_X,
			Rz = R * ELLIPTICITY_Z;

		for (var dX = -Rx; dX <= Rx; dX++) {
			for (var dZ = -Rx; dZ <= Rx; dZ++) {
				if ((Math.pow(dX / ELLIPTICITY_X, 2) + Math.pow(dZ / ELLIPTICITY_Z, 2)) <= Math.pow(R, 2))
					TASK.addTask(Xc + Math.round(dX), Yc, Zc + Math.round(dZ), ID, DATA);//needs speed check
			}
		}
	};

	this.sphere_empty = (Xc, Zc, Yc, R, ELLIPTICITY_X, ELLIPTICITY_Z, ELLIPTICITY_Y, ID, DATA) => {
		var TASK = new TileEdit.Task();
		var Rx = R * ELLIPTICITY_X,
			Rz = R * ELLIPTICITY_Z,
			Ry = R * ELLIPTICITY_Y;

		var dZ;
		for (var dY = -Ry; dY <= Ry; dY++) {
			for (var dX = -Rx; dX <= Rx; dX++) {
				dZ = Math.round(Math.sqrt(Math.pow(R, 2) - Math.pow(dX / ELLIPTICITY_X, 2) - Math.pow(dY / ELLIPTICITY_Y, 2)) * Math.pow(ELLIPTICITY_Z, 2));
				TASK.addTask(Xc + dX, Yc + dY, Zc + dZ, ID, DATA);
				TASK.addTask(Xc + dX, Yc + dY, Zc - dZ, ID, DATA);
			}
		}

	};

	this.sphere_filled = (Xc, Zc, Yc, R, ELLIPTICITY_X, ELLIPTICITY_Z, ELLIPTICITY_Y, ID, DATA) => {

	}

	this.cube_empty = (Xs, Zs, Ys, Xe, Ze, Ye, ID, DATA) => {
		var TASK=new TileEdit.Task();
		var Xss,Xee,Zss,Zee,Yss,Yee;
		Xss=Xs<Xe?(Xee=Xe,Xs):(Xee=Xs,Xe),
		Yss=Ys<Ye?(Yee=Ye,Ys):(Yee=Ys,Ye),
		Zee=Zs<Ze?(Zee=Ze,Zs):(Zee=Zs,Ze);
		
		for(var dX=Xss;dX<=Xee;dX++){
			for(var dZ=Zss;dZ<=Zee;dZ++){
				TASK.addTask(dX,Yss,dZ,ID,DATA);
				TASK.addTask(dX,Yss,dZ,ID,DATA);
				for(var dY=Yss+1;dY<=Yee-1;Y++){
					if(dX===Xss||dX===Xee||dZ===Zss||dZ===Zee)
						TASK.addTask(dX,dY,dZ,ID,DATA);
				}
			}
		}
	};

	this.cube_filled=(Xs, Zs, Ys, Xe, Ze, Ye, ID, DATA)=>{
		var TASK=new TileEdit.Task();
		var Xss,Xee,Zss,Zee,Yss,Yee;
		Xss=Xs<Xe?(Xee=Xe,Xs):(Xee=Xs,Xe),
		Yss=Ys<Ye?(Yee=Ye,Ys):(Yee=Ys,Ye),
		Zee=Zs<Ze?(Zee=Ze,Zs):(Zee=Zs,Ze);
		
		for(var dX=Xss;dX<=Xee;dX++){
			for(var dZ=Zss;dZ<=Zee;dZ++){
				for(var dY=Yss;dY<=Yee;dY++){
					TASK.addTask(dX,dY,dZ,ID,DATA);
				}
			}
		}
	};
});

var MISC = new (function () {
	this.cloneObject = function cloneObject(obj) {
		var rtn;
		switch (MISC.typeOf(obj)) {
			case "array":
				rtn = [];
				for (var i = 0; i < obj.length;) {
					NewArray.push(cloneObject(obj[i]));
				}
				break;

			case "object":
				rtn = {};
				for (var key in obj) {
					if (object.hasOwnProperty(key)) {
						var element = object[key];
						NewObject[key] = cloneObject(element);
					}
				}
				break;

			default:
				rtn = obj;
				break;

		}
		return rtn;
	};

	this.typeOf = (obj) => {
		var toString = Object.prototype.toString;
		return toString.call(obj).slice(8, -1).toLowerCase();
	};
});



var GUI = new (function () {
	const MATCH_PARENT = android.widget.RelativeLayout.LayoutParams.MATCH_PARENT;
	const WRAP_CONTENT = android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT;

	const getCtx = () => com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
	const getWidth = () => getCtx().getWindowManager().getDefaultDisplay().getWidth();
	const getHeight = () => getCtx().getWindowManager().getDefaultDisplay().getHeight();
	const getDecorView = () => getCtx().getWindow().getDecorView();

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
	});

	this.MainMenu = new (function () {
		this.layout = new LinearLayout(getCtx());
	});
});