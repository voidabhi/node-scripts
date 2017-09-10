var btree = function(arr){
  var tree = {
        val : arr[0],
        name: "Base"
        l   : {},
        r   : {}
        };
  var add_node = function (node, leaf, name){
    if (node.val === undefined){ 
      node.l = {};
      node.r = {}; 
      node.val = leaf;
      node.name = name;
      return node;
    } else { 
      if (node.val < leaf){
        return add_node(node.r, leaf, (node.name + "-r"));
      } else {
        return add_node(node.l, leaf, (node.name + "-l"));
      }
    } 
  } 
  for(var i = 1; i < arr.length; i++){
    add_node(tree, arr[i]);  
  }
  return tree;
}
