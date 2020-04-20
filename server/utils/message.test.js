const expect=require('expect');

var {generateMessage}=require('./message')

describe('generateMessage',()=>{
	it('Should generate correct message',()=>{
		var message=generateMessage('rohit@gmail.com','its a test message');
		expect(typeof message.text).toBe('string');
		expect(typeof message.createdAt).toBe('number');
	});
});

describe('generateGeoLocation',()=>{
	it('Should get the correct latitude and longitude',()=>{

	});
});