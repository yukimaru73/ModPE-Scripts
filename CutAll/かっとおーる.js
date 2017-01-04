"use strict";

const ctx = ()=>com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

const Button = android.widget.Button;
const CheckBox = android.widget.CheckBox;
const Color = android.graphics.Color;
const ColorDrawable = android.graphics.drawable.ColorDrawable;
const EditText = android.widget.EditText;
const LayoutParams = android.view.ViewGroup.LayoutParams;
const LinearLayout = android.widget.LinearLayout;
const PopupWindow = android.widget.PopupWindow;
const Runnable = java.lang.Runnable;
const ScrollView = android.widget.ScrollView;
const SeekBar = android.widget.SeekBar;
const Switch = android.widget.Switch;
const TextView = android.widget.TextView;
const ToggleButton = android.widget.ToggleButton;
const OnClickListener = android.view.View.OnClickListener;
const OnLongClickListener = android.view.View.OnLongClickListener;
const OnSeekBarChangeListener = android.widget.SeekBar.OnSeekBarChangeListener;

const GUIConst = {
	Height: ctx().getWindowManager().getDefaultDisplay().getHeight(),
	Width: ctx().getWindowManager().getDefaultDisplay().getWidth(),
	density: ctx().getResources().getDisplayMetrics().density,
	DecorView: ctx().getWindow().getDecorView(),
	WRAP_CONTENT: android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT,
	MATCH_PARENT: android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
};

let blocks = {
	searched: [],
	log: [],
	logForLeave: [],
	leave: []
};

let Constants = {
	logMax: 256,
	leaveMax: 256,
	axeid: [258, 271, 275, 279, 286],
	logid: [17, 162],
	fortune: {
		"normal": [1/20,1/16,1/12,1/10],
		"jungle": [1/40,1/36,1/32,1/24],
		"apple": [1/200,1/180,1/160,1/140]
	},
	rand: []
}

let ViewIDs = [];

function modTick(){
	if(Constants.rand.length<Constants.leaveMax*2){
		Constants.rand.push(Math.random());
	}
}

function newLevel(hL) {
	GUI.ToggleButton.show();
}

function leaveGame() {
	GUI.ToggleButton.dismiss();
	GUI.Menu.dismiss();
}

function destroyBlock(x, y, z, s) {
	let st = new Date();
	if(!findViewByID("ToggleButton").isChecked()) return;
	const iid = Player.getCarriedItem();
	const bid = Level.getTile(x, y, z);
	if (checkArray(iid, Constants.axeid)) return;
	if (checkArray(bid, Constants.logid)) return;
	const bdm = Level.getData(x, y, z);
	const idm = Player.getCarriedItemData();
	const imdm = Item.getMaxDamage(iid);
	const iddm = (imdm - idm);
	const ssid = Player.getSelectedSlotId();

	searchLog(x, y, z, bid, bdm % 4, 4);
	let lgt = blocks.log.length;
	if (lgt > 0) {
		let cnt = lgt < Constants.logMax ? lgt : (clientMessage("CutAllリミッター作動"), Constants.logMax);
		if (iddm < cnt) {
			clientMessage("耐久値不足のため一括破壊しませんでした");
			return;
		}
		clientMessage(lgt);
		Level.dropItem(x + 0.5, y, z + 0.5, 0.75, bid, cnt, bdm);
		for (let i = cnt; i--;) {
			let pos = blocks.log[i];
			Level.setTile(pos[0], pos[1], pos[2], 0, 0);
		}
		blocks.log.length = 0;
		blocks.searched.length=0;
		setDefaultEnchantItem(ssid, iid, idm + cnt);
	}
	let et = new Date();
	clientMessage("Time(ms): " + (et - st));
}

function searchLeave(x,y,z,id,ddm){
	let lgt=blocks.logForLeave.length;
	if(lgt===0) return;
	ctx().runOnUiThread(
		function(){
			try{
				
			}catch(e){
				print(e);
			}
		}
	);
}

function destroyLeave(){
	let lgt=blocks.leave.length;
	if(lgt===0) return;
	ctx().runOnUiThread(
		function(){
			try{
				for(let i=lgt;i--;){
					let pos=blocks.leave[i];
					Level.setTile(pos[0],pos[1],pos[2],0,0);
				}
				blocks.leave.length=0;
			}catch(e){
				print(e);
			}
		}
	);
}

function mathSaplingAndApple(cnt,fortuneLevel,isOak,isJungle){
	if(fortuneLevel>3) fortuneLevel=3;
	let prob=isJungle? Constants.fortune.jungle[fortuneLevel] : Constants.fortune.normal[fortuneLevel];
	let damount=[0,0];
	for(let i=cnt;i--;){
		if(Constants.rand[0]<prob) damount[0]++;
		if(isOak){
			if(Constants.rand[0]<(1/(200-20*fortuneLevel))) damount[1]++;
		}
		Constants.rand.splice(0,1);
	}
	return damount;
}

function setDefaultEnchantItem(ssid, id, dm) {
	let enc = Player.getEnchantments(ssid);
	Player.setInventorySlot(ssid, id, 1, dm);
	if (enc.length === 0) return;
	for (let i in enc) {
		Player.enchant(ssid, enc[i]["type"], enc[i]["level"]);
	}
}
function checkEnchant(type) {
	let enc = Player.getEnchantments(Player.getSelectedSlotId());
	for (let i = enc.length; i--;) {
		if (enc[i]["type"] === type) return enc[i]["level"]
	}
	return null;
}

function existsLoginArray(ctt, arr) {
	const x=ctt[0];
	const y=ctt[1];
	const z=ctt[2];
	for (let i = arr.length; i--;) {
		let pos=arr[i];
		if(y!==pos[1]) continue;
		if(x!==pos[0]) continue;
		if(z!==pos[2]) continue;
		return true;
	}
	return false;
	
}

function checkArray(ctt, arr) {
	for (let i = arr.length; i--;) {
		if (arr[i] === ctt) return false;
	}
	return true;
}

function searchLog(x, y, z, id, ddm, pos) {
	blocks.log.push([x,y,z]);
	blocks.logForLeave.push([x,y,z]);
	let dx, dy, dz, rpos, npos;
	switch (pos) {
		case 0:
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i > 1 && k > 1) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 1://k=-1
			dz = z - 1;
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					rpos=[dx, dy, dz];
					if (existsLoginArray(rpos, blocks.log)) continue;
					if (Level.getTile(dx, dy, dz) !== id) continue;
					if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
					npos = (i + 1) + j * 9;
					searchLog(dx, dy, dz, id, ddm, npos);
				}
			}
		break;
		case 2:
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i < 1 && k > 1) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 3://i=-1
			dx = x - 1;
			for (let j = 0; j < 2; j++) {
				dy = y + j;
				for (let k = -1; k < 2; k++) {
					dz = z + k;
					rpos=[dx, dy, dz];
					if (existsLoginArray(rpos, blocks.log)) continue;
					if (Level.getTile(dx, dy, dz) !== id) continue;
					if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
					npos = j * 9 + (k + 1) * 3;
					searchLog(dx, dy, dz, id, ddm, npos);
				}
			}
		break;
		case 4:
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 5://i=+1
			dx = x + 1;
			for (let j = 0; j < 2; j++) {
				dy = y + j;
				for (let k = -1; k < 2; k++) {
					dz = z + k;
					rpos=[dx, dy, dz];
					if (existsLoginArray(rpos, blocks.log)) continue;
					if (Level.getTile(dx, dy, dz) !== id) continue;
					if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
					npos = 2 + j * 9 + (k + 1) * 3;
					searchLog(dx, dy, dz, id, ddm, npos);
				}
			}
		break;
		case 6:
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i > 1 && k < 1) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = i + 1 + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 7://k=+1
			dz = z + 1;
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					rpos=[dx, dy, dz];
					if (existsLoginArray(rpos, blocks.log)) continue;
					if (Level.getTile(dx, dy, dz) !== id) continue;
					if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
					npos = i + j * 9 + 7;
					searchLog(dx, dy, dz, id, ddm, npos);
				}
			}
		break;
		case 8:
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i < 1 && k < 1) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 9:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i > 1 && k > 1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 10:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (k > -1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 11:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i < 1 && k > 1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 12:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i > -1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 13://j=+1
			dy = y + 1;
			for (let i = -1; i < 2; i++) {
				dx = x + i;
				for (let k = -1; k < 2; k++) {
					dz = z + k;
					rpos=[dx, dy, dz];
					if (existsLoginArray(rpos, blocks.log)) continue;
					if (Level.getTile(dx, dy, dz) !== id) continue;
					if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
					npos = i + 10 + (k + 1) * 3;
					searchLog(dx, dy, dz, id, ddm, npos);
				}
			}
		break;
		case 14:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i < 1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 15:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i > 1 && k < 1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
		case 16:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (k < 1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
			break;
		case 17:
			for (let i = -1; i < 2; i++) {
				dx = x + i
				for (let j = 0; j < 2; j++) {
					dy = y + j;
					for (let k = -1; k < 2; k++) {
						if (i < 1 && k < 1 && j === 0) continue;
						dz = z + k;
						rpos=[dx, dy, dz];
						if (existsLoginArray(rpos, blocks.log)) continue;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						npos = (i + 1) + j * 9 + (k + 1) * 3;
						searchLog(dx, dy, dz, id, ddm, npos);
					}
				}
			}
		break;
	}
}

function showGUI(Popup, Gravity, x, y) {
	try {
		ctx().runOnUiThread(
			function () {
				Popup.showAtLocation(GUIConst.DecorView, Gravity, x, y);
			}
		);
	} catch (e) {
		print("[An error has been detected]\n" + e);
	}
}

function addChilds(View, Childs,layoutParams) {
	try {
		let key = Object.keys(Childs);
		for (let i = 0; i < key.length; i++) {
			layoutParams==undefined? View.addView(Childs[key[i]].View): View.addView(Childs[key[i]].View,layoutParams);
		}
	} catch (e) {
		print("[An error has been detected]\n" + e);
	}
}

function defineViewID(View, ID) {
	ViewIDs.push({
		"View": View,
		"ID": ID
	});
}

function findViewByID(ID) {
	for (let i=0;i<ViewIDs.length;i++){
		let obj = ViewIDs[i];
		if (obj.ID === ID) return obj.View;
	}
	return null;
}

let GUI = new function () {
	this.ToggleButton = new function () {
		this.Popup = null;
		this.View = new ToggleButton(ctx());
		defineViewID(this.View,"ToggleButton");
		this.View.setText("C");
		this.View.setTextOn("C");
		this.View.setTextOff("C");
		this.show = () => {
			this.Popup = new PopupWindow(this.View, GUIConst.density*50, GUIConst.WRAP_CONTENT);
			showGUI(this.Popup, 5 | 80, 0, 0);
		};
		this.dismiss = () => {
			if (this.Popup == null) return;
			this.Popup.dismiss();
			this.Popup = null;
		};
		this.View.setOnClickListener(
			function (v) {
				v.isChecked() ? (
					clientMessage("CutAll ON"),
					v.setChecked(true),
					v.setTextColor(Color.GREEN)
				) : (
					clientMessage("CutAll OFF"),
					v.setChecked(false),
					v.setTextColor(Color.WHITE)
				);
			}
		);
		this.View.setOnLongClickListener(
			function (v) {
				GUI.ToggleButton.dismiss();
				GUI.Menu.show();
				return true;
			}
		);
	};
	
	this.Menu = new function () {
		this.Popup = null;
		this.View = new LinearLayout(ctx());
		this.View.setOrientation(1);
		this.show = () => {
			if (this.Popup != null) return;
			this.Popup = new PopupWindow(this.View, (GUIConst.Width / 4)|0, GUIConst.WRAP_CONTENT);
			showGUI(this.Popup, 3 | 48, 0, 0);
		};
		this.dismiss = () => {
			if (this.Popup == null) return;
			this.Popup.dismiss();
			this.Popup = null;
		};
		this.Child = new function () {
			this.header = new function () {
				this.View = new LinearLayout(ctx());
				this.View.setOrientation(0);
				this.View.setBackgroundDrawable(new ColorDrawable(Color.argb(180, 20, 20, 20)));
				this.Child = new function () {
					this.ExitButton = new function () {
						this.View = new Button(ctx());
						this.View.setText("✖");
						this.View.setTextColor(Color.RED);
						this.View.setOnClickListener(
							function (v) {
								GUI.Menu.dismiss();
								GUI.ToggleButton.show();
							}
						);
					};
				};
				addChilds(this.View, this.Child,LayoutParams(GUIConst.density*40,GUIConst.density*40));
			};
			
			this.Scroll = new function () {
				this.View = new ScrollView(ctx());
				this.Child = new function () {
					this.Layout = new function () {
						this.View = new LinearLayout(ctx());
						this.View.setOrientation(1);
						this.View.setBackgroundDrawable(new ColorDrawable(Color.argb(100, 20, 20, 20)));
						this.Child = new function () {
							this.LogMax = new function () {
								this.View = new LinearLayout(ctx());
								this.View.setOrientation(1);
								this.Child = new function () {
									this.Title = new function () {
										this.View = new TextView(ctx());
										this.View.setText("原木の破壊最大量");
									};
									this.TextView = new function () {
										this.View = new TextView(ctx());
										this.View.setText(String(Constants.logMax));
										defineViewID(this.View,"LogMaxText")
									};
									this.SeekBar = new function () {
										this.View = new SeekBar(ctx());
										this.View.setMax(512);
										this.View.setProgress(Constants.logMax);
										this.View.setOnSeekBarChangeListener(new OnSeekBarChangeListener({
											onProgressChanged: function (view, progress, fromUser) {
												try{
													findViewByID("LogMaxText").setText(String(progress));
													Constants.logMax = progress;
												}catch(e){
													print(e);
												}
											}
										}));
									};
								};
								addChilds(this.View, this.Child);
							};
							this.LeaveMax = new function () {
								this.View = new LinearLayout(ctx());
								this.View.setOrientation(1);
								this.Child = new function () {
									this.Title = new function () {
										this.View = new TextView(ctx());
										this.View.setText("葉ブロックの破壊最大量");
									};
									this.TextView = new function () {
										this.View = new TextView(ctx());
										this.View.setText(String(Constants.leaveMax));
										defineViewID(this.View,"LeaveMaxText")
									};
									this.SeekBar = new function () {
										this.View = new SeekBar(ctx());
										this.View.setMax(1024);
										this.View.setProgress(Constants.leaveMax);
										this.View.setOnSeekBarChangeListener(new OnSeekBarChangeListener({
											onProgressChanged: function (view, progress, fromUser) {
												try{
													findViewByID("LeaveMaxText").setText(String(progress));
													Constants.leaveMax = progress;
												}catch(e){
													print(e);
												}
											}
										}));
									};
								};
								addChilds(this.View, this.Child);
							};
						};
						addChilds(this.View, this.Child);
					}
				};
				addChilds(this.View, this.Child);
			};
		};
		addChilds(this.View, this.Child);
	};
};
