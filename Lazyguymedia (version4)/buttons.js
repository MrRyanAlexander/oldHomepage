function modify_qty(val) {
    var qty = document.getElementById('qty').value;
    var new_qty = parseInt(qty,10) + val;
    
    if (new_qty < 0) {
        new_qty = 0;
    }
    
    document.getElementById('qty').value = new_qty;
    return new_qty;
}
function modify_qty2(val2) {
    var qty2 = document.getElementById('qty2').value;
    var new_qty2 = parseInt(qty2,10) + val2;
    
    if (new_qty2 < 0) {
        new_qty2 = 0;
    }
    
    document.getElementById('qty2').value = new_qty2;
    return new_qty2;
}