
var nbits = 486604799;

function nbitsToMaxTargetHashString(nbits) {
    var numbe_byte_of_target_hash = (nbits >> 24) & 0xFF;
    var prefix_of_target_hash = (nbits) & 0x00FFFFFF;
    var n1 = ((prefix_of_target_hash >> 16) && (0x00FF));
    var n2 = ((prefix_of_target_hash >> 8) && (0x00FF));
    var n3 = ((prefix_of_target_hash >> 0) && (0x00FF));

    var buf = Buffer.alloc(32);
    buf[32 - numbe_byte_of_target_hash + 0] = n1;
    buf[32 - numbe_byte_of_target_hash + 1] = n2;
    buf[32 - numbe_byte_of_target_hash + 2] = n3;
    return buf;
}
function log2hexStr(buff){
    var str = maxhashbuffer.toString('hex');
    console.log(str);
}

var maxhashbuffer = nbitsToMaxTargetHashString(nbits);
log2hexStr(maxhashbuffer);