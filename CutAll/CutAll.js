"use strict";
//-- + Constants + --//

const Constants = {
	LOGMAX: 256,
	LEAFMAX: 256,
	AXEID: [258, 271, 275, 279, 286],
	LOGID: [17, 162],
	Probability: {
		NORMAL: [1/20, 1/16, 1/12, 1/10],
		JUNGLE: [1/40, 1/36, 1/32, 1/24],
		APPLE: [1/200, 1/180, 1/160, 1/120]
	}
};

const values={
	en_US:{
		CutAllOn:"ON",
		CutAllOff:"OFF",
		NotEnoughDurability:"More tool durability has been required",
		LogLimit:"Amount limit of log",
		LeafLimit:"Amount limit of leaf"
	},
	ja_JP:{
		CutAllOn:"ON",
		CutAllOff:"OFF",
		NotEnoughDurability:"耐久値不足のため一括破壊しませんでした",
		LogLimit:"原木の破壊最大量",
		LeafLimit:"葉の破壊最大量"
	}
};

const ctx = ()=>com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

const Button = android.widget.Button;
const CheckBox = android.widget.CheckBox;
const Color = android.graphics.Color;
const ColorDrawable = android.graphics.drawable.ColorDrawable;
const EditText = android.widget.EditText;
const Gravity=android.view.Gravity;
const LayoutParams = android.view.ViewGroup.LayoutParams;
const LinearLayout = android.widget.LinearLayout;
const OnClickListener = android.view.View.OnClickListener;
const OnLongClickListener = android.view.View.OnLongClickListener;
const OnSeekBarChangeListener = android.widget.SeekBar.OnSeekBarChangeListener;
const PopupWindow = android.widget.PopupWindow;
const Runnable=java.lang.Runnable;
const ScrollView = android.widget.ScrollView;
const SeekBar = android.widget.SeekBar;
const Switch = android.widget.Switch;
const TextView = android.widget.TextView;
const Thread = java.lang.Thread;
const ToggleButton = android.widget.ToggleButton;

const GUIConst = {
	Height: ctx().getWindowManager().getDefaultDisplay().getHeight(),
	Width: ctx().getWindowManager().getDefaultDisplay().getWidth(),
	density: ctx().getResources().getDisplayMetrics().density,
	DecorView: ctx().getWindow().getDecorView()
};

//-- + Parameters + --//

let Params={
	RAND:[],
	BLOCKS:[],
	NED:{
		FLAG:false,
		COUNT:0
	}
};

//-- + Original Hook Functions + --//

function modTick(){
	shiftCountOnModTick();
}

function newLevel(hL) {
	GUI.ToggleButton.show();
}

function leaveGame() {
	GUI.ToggleButton.dismiss();
	GUI.Menu.dismiss();
}

function destroyBlock(x, y, z, s){
	if(!findViewById("ToggleButton").isChecked()) return;
	const iI=Player.getCarriedItem();
	const iD=Player.getCarriedItemData();
	const iMD=Item.getMaxDamage(iI);
	const iS=Player.getSelectedSlotId();
	const iE=Player.getEnchantments(iS);
	const bI=Level.getTile(x, y, z);
	const bD=Level.getData(x, y, z);
	
	if(checkArray(bI, Constants.LOGID)) return;
	if(checkArray(iI, Constants.AXEID)) return;
	
	let logs=searchLog([new createPos(x, y, z, hasUpper({"x":x, "y":y, "z":z}, bI, bD%4))], [new createTgt(x, y, z, 4)], bI, bD%4, Constants.LOGMAX);
	
	if(checkDurability(iD, iMD, logs.length)) return;
	
	preventDefault();
	destroyLog(x, y, z, bI, bD%4, logs);
	let dur=mathDurability(iE, logs.length);
	setEnchantItem(iS, iE, iI, iD + dur);
	clientMessage("Amount: " + String(logs.length) + "\n:Dur: "+String(dur));
}

//-- + My Functions + --//

function existsLogInArray(x, y, z, arr) {
	for (let i = arr.length; i--;) {
		let pos=arr[i];
		if(y!==pos["y"]) continue;
		if(x!==pos["x"]) continue;
		if(z!==pos["z"]) continue;
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

function cloneObject(obj){
	let newObj;
	if(Array.isArray(obj)){
		newObj=[];
		for(let i=0;i<obj.length;i++) newObj[i]=cloneObject(obj[i]);
	}else if(Object.isObject(obj)){
		newObj={};
		let keys=Object.keys(obj);
		for(let i=0;i<keys;i++){
			let key=keys[i];
			newObj[key]=cloneObject(obj[key]);
		}
	}else{
		newObj=obj;
	}
	return newObj;
}

function getString(key){
	let lang=ModPE.getLanguage(),str=null;
	lang=values[lang]===undefined?"en_US":lang;
	str=values[lang][key];
	return str===undefined?null:str;
}

function checkEnchant(type) {
	let enc = Player.getEnchantments(Player.getSelectedSlotId());
	for (let i = enc.length; i--;) {
		if (enc[i]["type"] === type) return enc[i]["level"]+0;
	}
	return 0;
}

function setEnchantItem(ssid, enc, id, dm) {
	Player.setInventorySlot(ssid, id, 1, dm);
	if (enc.length == 0) return;
	for (let i in enc) {
		let e=enc[i];
		Player.enchant(ssid, e["type"], e["level"]);
	}
}

function isEnoughDurability(dm, max, count){
	if((max-dm)>count) return true;
	return false;
}

function mathDurability(enc, amount){
	let RD=0, UBLevel=0, Rprob=0, Nprob=0;
	for(let i in enc) if(enc[i]["type"]==Enchantment.UNBREAKING) UBLevel=enc[i]["level"];
	Nprob=1/(1 + UBLevel);
	while(amount--){
		Rprob=Params.RAND.shift();
		if(Rprob<Nprob) RD++;
	}
	return RD;
}

function shiftCountOnModTick(){
	let ned=Params.NED;
	if(!ned.FLAG) return;
	if(ned.COUNT<=0){
		ned.FLAG=false;
		return;
	}
	ned.COUNT--;
}

function checkDurability(iD,iMD,lgt){
	if(!isEnoughDurability(iD, iMD, lgt)){
		if(!Params.NED.FLAG){
			Params.NED.FLAG=true;
			if(Params.NED.COUNT===0){
				Params.NED.COUNT=450;
				clientMessage("[CutAll]" + getString("NotEnoughDurability"));
			}
		}
		return true;
	}
	return false;
}

function createTgt(x, y, z, pos){
	this.x=x;
	this.y=y;
	this.z=z;
	this.pos=pos;
}

function createPos(x, y, z, hasUpperLog){
	this.x=x;
	this.y=y;
	this.z=z;
	this.hasUpperLog=hasUpperLog;
}

function hasUpper(pos, id, ddm){
	let bid=Level.getTile(pos["x"], pos["y"] + 1, pos["z"]);
	let bddm=Level.getData(pos["x"], pos["y"] + 1, pos["z"])%4;
	if(id===bid&&ddm===bddm) return true;
	return false;
}

function mathSaplingAndApple(cnt,fortuneLevel,isOak,isJungle){
	if(fortuneLevel>3) fortuneLevel=3;
	let prob=isJungle? Constants.Probability.JUNGLE[fortuneLevel] : Constants.Probability.NORMAL[fortuneLevel];
	let damount={"sapling":0, "apple":0};
	let rand=0;
	let Aprob=Constants.Probability.APPLE[fortuneLevel];
	for(let i=cnt;i--;){
		rand=Params.RAND.shift();
		if(rand<prob) damount["sapling"]++;
		if(isOak){
			if(rand<Aprob) damount["apple"]++;
		}
	}
	return damount;
}

function destroyLog(x, y, z, id, ddm, logs){
	let log;
	Level.dropItem(x + 0.5, y, z + 0.5, 0.75, id, logs.length, ddm);
	for(let i=logs.length;i--;){
		log=logs[i];
		Level.setTile(log["x"], log["y"], log["z"], 0, 0);
	}
}

function destroyLeaves(leaves){
	let leaf;
	for(let i=leaves.length;i--;){
		Thread.sleep(2);
		leaf=leaves[i];
		Level.setTile(leaf["x"], leaf["y"], leaf["z"], 0, 0);
	}
}

function searchTypicalLeaf(logs,id,ddm){
	
}

function searchAndDestroyLeaves(x,y,z,id,ddm,logs,enc){
	new Thread(new Runnable({
		run: function(){
			let isJungle=false, isOak=false, sapling=0, leaves, drops;
			switch(id){
				case 17:
					sapling=ddm;
					switch(ddm){
						case 0://oak
							isOak=true;
							if(lgt<7){
								leaves=searchTypicalLeaf(logs,18,dmm);
							}else{
								
							}
						break;
						case 1://spruce
							if(lgt<9){
								
							}else{
								
							}
						break;
						case 2://birch
							leaves=searchTypicalLeaf(logs,18,dmm);
						break;
						case 3://jungle
							isJungle=true;
							if(lgt<13){
								leaves=searchTypicalLeaf(logs,18,ddm);
							}else{
								
							}
						break;
					}
				break;
				case 162:
					sapling=ddm+4;
					switch(ddm){
						case 0://accasia
							
						break;
						case 1://bigoak
							isOak=true;
						break;
					}
				break;
			}
			destroyLeaves(leaves);
			drops=mathSaplingAndApple(leaves.length, checkEnchant(Enchantment.FORTUNE), isOak,isJungle);
			if(drops["sapling"]!==0) Level.dropItem(x+0.5, y, z+0.5, 0.75, 6, drops["sapling"], sapling);
			if(drops["apple"]!==0) Level.dropItem(x+0.5, y , z+0.5, 0.75, 260, drops["apple"], 0);
		}
	})).start();
}

function searchLog(nArray, next, id, ddm, max){
	let tgt=[];
	let dx, dy, dz, npos, pos, n;
	for(let i=next.length;i--;){
		n=next[i];
		switch(n["pos"]){
			case 0:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i >= 0 && k >= 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 1://k=-1
				dz = n["z"] - 1;
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						if (existsLogInArray(dx, dy, dz, nArray)) continue;
						npos = i + (j * 9) + 1;
						pos=new createTgt(dx, dy, dz, npos);
						nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
						tgt.push(pos);
					}
				}
			break;
			case 2:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i <= 0 && k >= 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 3://i=-1
				dx = n["x"] - 1;
				for (let j = 0; j < 2; j++) {
					dy = n["y"] + j;
					for (let k = -1; k < 2; k++) {
						dz = n["z"] + k;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						if (existsLogInArray(dx, dy, dz, nArray)) continue;
						npos = (j * 9) + (k * 3) + 3;
						pos=new createTgt(dx, dy, dz, npos);
						nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
						tgt.push(pos);
					}
				}
			break;
			case 4:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							dz = n["z"] + k;
							if(i===0&&j===0&&k===0) continue;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 5://i= + 1
				dx = n["x"] + 1;
				for (let j = 0; j < 2; j++) {
					dy = n["y"] + j;
					for (let k = -1; k < 2; k++) {
						dz = n["z"] + k;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						if (existsLogInArray(dx, dy, dz, nArray)) continue;
						npos = (j * 9) + (k * 3) + 5;
						pos=new createTgt(dx, dy, dz, npos);
						nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
						tgt.push(pos);
					}
				}
			break;
			case 6:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i >= 0 && k <= 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 7:
				dz = n["z"] + 1;
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						if (existsLogInArray(dx, dy, dz, nArray)) continue;
						npos = i + (j * 9) + 7;
						pos=new createTgt(dx, dy, dz, npos);
						nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
						tgt.push(pos);
					}
				}
			break;
			case 8:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i <= 0 && k <= 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 9:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i >= 0 && k >= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 10:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (k >= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 11:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i <= 0 && k >= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 12:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i >= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 13:
				dy = n["y"] + 1;
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let k = -1; k < 2; k++) {
						dz = n["z"] + k;
						if (Level.getTile(dx, dy, dz) !== id) continue;
						if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
						if (existsLogInArray(dx, dy, dz, nArray)) continue;
						npos = i + (k * 3) + 13;
						pos=new createTgt(dx, dy, dz, npos);
						nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
						tgt.push(pos);
					}
				}
			break;
			case 14:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i <= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 15:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i >= 0 && k <= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 16:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (k <= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
			case 17:
				for (let i = -1; i < 2; i++) {
					dx = n["x"] + i;
					for (let j = 0; j < 2; j++) {
						dy = n["y"] + j;
						for (let k = -1; k < 2; k++) {
							if (i <= 0 && k <= 0 && j === 0) continue;
							dz = n["z"] + k;
							if (Level.getTile(dx, dy, dz) !== id) continue;
							if (Level.getData(dx, dy, dz) % 4 !== ddm) continue;
							if (existsLogInArray(dx, dy, dz, nArray)) continue;
							npos = i + (j * 9) + (k * 3) + 4;
							pos=new createTgt(dx, dy, dz, npos);
							nArray.push(new createPos(dx, dy, dz, hasUpper(pos, id, ddm)));
							tgt.push(pos);
						}
					}
				}
			break;
		}
	}
	if(nArray.length>max){
		nArray.length=max;
		return nArray;
	}
	if(tgt.length===0) return nArray;
	return searchLog(nArray, tgt, id, ddm, max);
}

const MCPETool=new (function(){
	
	this.CutAll=new (function(){
		
	})();
	
	this.DigAll=new (function(){
		
	})();
	
	this.MineAll=new (function(){
		
	})();
	
	this.Common=new (function(){
		
	})();
	
})();

//-- + GUI Functions + --//

function showGUI(Popup, Gravity, x, y) {
	try {
		ctx().runOnUiThread(new Runnable({
			run:function(){
				Popup.showAtLocation(GUIConst.DecorView, Gravity, x, y);
			}
		}));
	} catch (e) {
		print("[An error has been detected]\n" + e);
	}
}

function dismissGUI(Popup){
	try{
		ctx().runOnUiThread(new Runnable({
			run:function(){
				Popup.dismiss();
			}
		}));
	}catch(e){
		print("[An error has been detected]\n" + e);
	}
}

function addChilds(obj){
	try{
		for(let i in obj){
			if(obj[i].Child===undefined) continue;
			let keys=Object.keys(obj[i].Child);
			let View=obj[i].View;
			for(let j=0;j<keys.length;j++){
				let Child=obj[i].Child[keys[j]];
				if(Child.layoutParam===undefined){
					View.addView(Child.View);
				}else{
					View.addView(Child.View, Child.layoutParam);
				}
			}
			addChilds(obj[i].Child);
		}
	}catch(e){
		print("[An error has been detected]\n" + e);
	}
}

function defineViewId(View, ID) {
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

//-- + GUI Layouts + --//

let ViewIDs = [];

let GUI = new function () {
	this.ToggleButton = new function () {
		this.Popup = null;
		this.View = new ToggleButton(ctx());
		defineViewId(this.View, "ToggleButton");
		this.View.setText("C");
		this.View.setTextOn("C");
		this.View.setTextOff("C");
		this.show = () => {
			this.Popup = new PopupWindow(this.View, GUIConst.density*50, LayoutParams.WRAP_CONTENT);
			showGUI(this.Popup, Gravity.BOTTOM | Gravity.LEFT, 0, 0);
		};
		this.dismiss = () => {
			if (this.Popup == null) return;
			dismissGUI(this.Popup);
			this.Popup = null;
		};
		this.View.setOnClickListener(new OnClickListener({
			onClick:function (v) {
				v.isChecked() ? (
					clientMessage("[CutAll]" + getString("CutAllOn")),
					v.setChecked(true),
					v.setTextColor(Color.GREEN)
				) : (
					clientMessage("[CutAll]" + getString("CutAllOff")),
					v.setChecked(false),
					v.setTextColor(Color.WHITE)
				);
			}
		}));
		this.View.setOnLongClickListener(new OnLongClickListener({
			onLongClick:function (v) {
				GUI.ToggleButton.dismiss();
				GUI.Menu.show();
				return true;
			}
		}));
	};
	
	this.Menu = new function () {
		this.Popup = null;
		this.View = new LinearLayout(ctx());
		this.View.setOrientation(1);
		this.show = () => {
			if (this.Popup != null) return;
			this.Popup = new PopupWindow(this.View, (GUIConst.Width / 3)|0, LayoutParams.WRAP_CONTENT);
			showGUI(this.Popup, Gravity.TOP | Gravity.LEFT, 0, 0);
		};
		this.dismiss = () => {
			if (this.Popup == null) return;
			dismissGUI(this.Popup);
			this.Popup = null;
		};
		this.Child = new function () {
			this.header = new function () {
				this.View = new LinearLayout(ctx());
				this.View.setOrientation(0);
				this.View.setBackgroundDrawable(new ColorDrawable(Color.argb(180, 20, 20, 20)));
				this.Child = new function () {
					this.ExitButton = new function () {
						this.layoutParam=LayoutParams(GUIConst.density*40, GUIConst.density*40);
						this.View = new Button(ctx());
						this.View.setText("✖");
						this.View.setTextColor(Color.RED);
						this.View.setOnClickListener(new OnClickListener({
							onClick:function (v) {
								GUI.Menu.dismiss();
								GUI.ToggleButton.show();
							}
						}));
					};
				};
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
										this.View.setText(String(Constants.LOGMAX));
										defineViewId(this.View, "LogMaxText");
									};
									this.SeekBar = new function () {
										this.View = new SeekBar(ctx());
										this.View.setMax(512);
										this.View.setProgress(Constants.LOGMAX);
										this.View.setOnSeekBarChangeListener(new OnSeekBarChangeListener({
											onProgressChanged: function (view, progress, fromUser) {
												try{
													findViewById("LogMaxText").setText(String(progress));
													Constants.LOGMAX = progress + 0;
												}catch(e){
													print(e);
												}
											},
											onStopTrackingTouch: function(view){
												try{
													
												}catch(e){
													print(e);
												}
											}
										}));
									};
								};
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
										this.View.setText(String(Constants.LEAVEMAX));
										defineViewId(this.View, "LeafMaxText");
									};
									this.SeekBar = new function () {
										this.View = new SeekBar(ctx());
										this.View.setMax(1024);
										this.View.setProgress(Constants.LEAFMAX);
										this.View.setOnSeekBarChangeListener(new OnSeekBarChangeListener({
											onProgressChanged: function(view, progress, fromUser) {
												try{
													findViewById("LeafMaxText").setText(String(progress));
													Constants.LEAFMAX = progress + 0;
												}catch(e){
													print(e);
												}
											},
											onStopTrackingTouch: function(view){
												try{
													
												}catch(e){
													print(e);
												}
											}
										}));
									};
								};
							};
						};
					}
				};
			};
		};
	};
};
addChilds(GUI);

//-- + Background Programs + --//

new Thread(new java.lang.Runnable({
	run:function(){
		while(true){
			Thread.sleep(1);
			if(Params.RAND.length>Constants.LOGMAX*4) continue;
			Params.RAND.push(Math.random());
		}
	}
})).start();
