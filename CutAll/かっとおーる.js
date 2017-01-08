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
const ScrollView = android.widget.ScrollView;
const SeekBar = android.widget.SeekBar;
const Switch = android.widget.Switch;
const TextView = android.widget.TextView;
const Thread = java.lang.Thread;
const ToggleButton = android.widget.ToggleButton;
const OnSeekBarChangeListener = android.widget.SeekBar.OnSeekBarChangeListener;

const values={
	"en_US":{
		"CutAllOn":"CutAll ON",
		"CutAllOff":"CutAll OFF",
		"LogLimit":"Amount limit of log",
		"LeafLimit":"Amount limit of leaf",
		"CutAllLimitter":"Too many logs or leaves to destroy collectively",
		"NotEnoughDurability":"More tool durability has been required for collective destroying"
	},
	"ja_JP":{
		"CutAllOn":"CutAll ON",
		"CutAllOff":"CutAll OFF",
		"LogLimit":"原木の破壊最大量",
		"LeafLimit":"原木の破壊最大量",
		"CutAllLimitter":"木か葉の量が上限値を超えています",
		"NotEnoughDurability":"耐久値不足のため一括破壊しませんでした"
	}
}

const GUIConst = {
	"Height": ctx().getWindowManager().getDefaultDisplay().getHeight(),
	"Width": ctx().getWindowManager().getDefaultDisplay().getWidth(),
	"density": ctx().getResources().getDisplayMetrics().density,
	"DecorView": ctx().getWindow().getDecorView(),
	"WRAP_CONTENT": android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT,
	"MATCH_PARENT": android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
};

let blocks = {
	"searched": [],
	"log": []
};

let Constants = {
	"logMax": 256,
	"leaveMax": 256,
	"axeid": [258, 271, 275, 279, 286],
	"logid": [17, 162],
	"fortune": {
		"normal": [1/20,1/16,1/12,1/10],
		"jungle": [1/40,1/36,1/32,1/24],
		"apple": [1/200,1/180,1/160,1/140]
	},
	"rand": []
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
	ctx().runOnUiThread(
		function(){
			GUI.ToggleButton.dismiss();
			GUI.Menu.dismiss();
		}
	);
}

function destroyBlock(x, y, z, s) {
	//let st = new Date();
	if(!findViewById("ToggleButton").isChecked()) return;
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
		let cnt = lgt < Constants.logMax ? lgt : (clientMessage(getString("CutAllLimitter")), Constants.logMax);
		if (iddm < cnt) {
			clientMessage(getString("NotEnoughDurability"));
			return;
		}
		preventDefault();
		//clientMessage(lgt);
		Level.dropItem(x + 0.5, y, z + 0.5, 0.75, bid, cnt, bdm);
		for (let i = cnt; i--;) {
			let pos = blocks.log[i];
			Level.setTile(pos[0], pos[1], pos[2], 0, 0);
		}
		blocks.log.length = 0;
		setDefaultEnchantItem(ssid, iid, idm + cnt);
	}
	//let et = new Date();
	//clientMessage("Time(ms): " + (et - st));
}

function getString(key){
	let lang=ModPE.getLanguage();
	lang=values[lang]===undefined?"en_US":lang;
	return values[lang][key]===undefined?null:values[lang][key];
}

function searchTypicalLeaf(logs,id,dmm){
	let max=[null,0,null];
	let leaves=[];
	for(let i=logs.length;i--;){
		let arr=logs[i];
		if(arr[1]>max[1])max=arr;
	}
	let dx,dy,dz;
	for(let i=-2;i<3;i++){
		dx=max[0]+i;
		for(let j=-2;j<2;j++){
			dy=max[1]+j;
			for(let k=-2;k<3;k++){
				dz=max[2]+k;
				if(i===0&&j===0&&k===0) continue;
				if(Level.getTile(dx,dy,dz)!==id) continue;
				if(Level.getData(dx,dy,dz)%4!==dmm) continue;
				leaves.push([dx,dy,dz]);
			}
		}
	}
	return leaves;
}



function searchLeaf(x,y,z,id,ddm,type){
	let lgt=blocks.log.length;
	if(lgt===0) return;
	let arr=cloneArray(blocks.log);
	new Thread(
		function(){
			try{
				switch(type){
					case 0://oak
						if(lgt<7){
							
						}else{
							
						}
					break;
					
					case 1://spruce
						if(lgt<9){
							
						}else{
							
						}
					break;
					case 2://birch
						
					break;
					case 3://jungle
						if(lgt<13){
							
						}else{
							
						}
					break;
					case 4://accasia
						
					break;
					case 5://bigoak
						
					break;
					default:
					
					break;
				}
				destroyLeave(leaves);
			}catch(e){
				print(e);
			}
		}
	).start();
}

function destroyLeaf(leaves){
	let lgt=leaves.length;
	if(lgt===0) return;
	new Thread(
		function(){
			try{
				while(lgt>0){
					let ctt=leaves[0];
					Level.setTile(ctt[0],ctt[1],ctt[2],0,0);
					leaves.shift();
				}
			}catch(e){
				print(e);
			}
		}
	).start();
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
		Constants.rand.shift();
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

let getAbs=(int)=>{
	return int<0?-int:int;
}

function checkArray(ctt, arr) {
	for (let i = arr.length; i--;) {
		if (arr[i] === ctt) return false;
	}
	return true;
}

function cloneArray(arr){
	let ret=[];
	for(let i=arr.length;i--;){
		let ctt=arr[i];
		Array.isArray(ctt)?ret.unshift(cloneArray(ctt)):ret.unshift(ctt);
	}
	return ret
}

function searchLog(x, y, z, id, ddm, pos) {
	blocks.log.push([x,y,z]);
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

function findViewById(ID) {
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
					clientMessage(getString("CutAllOn")),
					v.setChecked(true),
					v.setTextColor(Color.GREEN)
				) : (
					clientMessage(getString("CutAllOff")),
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
										this.View.setText(getString("LogLimit"));
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
													findViewById("LogMaxText").setText(String(progress));
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
										this.View.setText(getString("LeafLimit"));
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
													findViewById("LeaveMaxText").setText(String(progress));
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
