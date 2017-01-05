var Thread=java.lang.Thread;
function useItem(x,y,z,iI,bI,s,iD,bD){
	new Thread(
		function(){
			try{
				for(let i=20;i--;){
					for(let j=0;j<64;j+=2){
						for(let k=20;k--;){
							Level.setTile(x+i,y+j,z+k,1,1);
							Thread.sleep(2);
						}
					}
				}
			}catch(e){
				print(e);
			}
		}
	).start();
}