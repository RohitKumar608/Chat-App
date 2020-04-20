const moment=require('moment');
	var generateMessage=(from,text,to_user,from_user_name)=>{
		return{
			from,
			text,
			to_user,
			createdAt:moment().valueOf(),
			from_user_name:from_user_name
		}
	};
	module.exports={generateMessage};