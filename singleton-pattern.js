
/***
 * NodeJS module that implements the single pattern.
 * http://en.wikipedia.org/wiki/Singleton_pattern
 * 
 * The goals is to create the object: instance only one time
 *  thus the instance is shared in the source code. 
 * 
 * You must be aware that there is a risk to break
 *  the isolation principles.
 */
if(!global.instance)
{
 var instance = {};
 instance.state = false;
 instance.func1 = function(state){
   instance.state = state;
 };
 global.instance = instance;
}
 
exports.instance = global.instance;
