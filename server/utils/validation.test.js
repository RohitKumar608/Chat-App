const expect=require('expect');

var {isRealString}=require('./validation.js');

describe('isRealString',()=>{
	it('Should reject non-string value',()=>{
		var result=isRealString(12345);
			expect(result).toBe(false);
	});
	it('Should reject string with only space',()=>{
		var result=isRealString("    ");
			expect(result).toBe(false);
	});
	it('Should allow string with non-space character',()=>{
		var result=isRealString("ughjaxv");
			expect(result).toBe(true);
	});
});