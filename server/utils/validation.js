var isRealString=function(string) {
	//console.log(typeof string);
	return (typeof string==='string' && string.trim().length>1)
}

module.exports={isRealString};