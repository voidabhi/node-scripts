//import the packages
var RuleEngine = require('node-rules');
var console = require('demo-console');

//define the rules
var rules = [{
    "condition": function(R) {
        R.when(this && (this.Milestone == "Ready To Issue" || this.Milestone == "Zoning Fee" || this.Milestone == "Final Data Check" ));
    },
    "consequence": function(R) {
        this.result = false;
        R.stop();
    }
}];
/*as you can see above we removed the priority 
and on properties for this example as they are optional.*/ 

//sample fact to run the rules on   
var factShouldBeNotVisible = {
    "Milestone": "Ready To Issue"
};

var factShouldBeVisible = {
    "Milestone": "Any Other Milestone"
};

//initialize the rule engine
var R = new RuleEngine(rules);

//Now pass the fact on to the rule engine for results
R.execute(factShouldBeNotVisible,function(result){ 

    if(result.result) 
        console.log("\n-----Fact 1 Visible----\n"); 
    else 
        console.log("\n-----Fact 1 Not Visible----\n");

});

//Now pass the fact on to the rule engine for results
R.execute(factShouldBeVisible,function(result){ 

    if(result.result) 
        console.log("\n-----Fact 2 Visible----\n"); 
    else 
        console.log("\n-----Fact 2 Not Visible----\n");

});
