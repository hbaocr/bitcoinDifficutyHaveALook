const BigNumber = require('bignumber.js');
//console.log(nbitsToBnTargetHash(486604799));
// var d = new BigNumber('2.87467423441594e12'); // Current Difficulty 2874674234415.94
// var cTarget = hTarget.dividedToIntegerBy(d);

// // Output Current Target in Hex
// console.log(cTarget.toString(16));  

// // Current Target in compact format
// mantissa = cTarget.toString(16).slice(0,6); // Most Significant three bytes
// exponent = (cTarget.toString(16).length / 2).toString(16) // Exponent

// var cTargetCompact = exponent + mantissa;
// console.log(cTargetCompact);
//console.log('hash target ', hTarget.toString(16));

function leftPadding(org_str, ch, final_len) {
    let result = org_str;
    if (!ch) {
        pad_str = " ";
    }
    while (result.length < final_len) {
        result = ch + result;
    }
    return result;
}

function nbits_to_bnTarget(nbits) {
    let str = nbits.toString(16);
    //var hTargetCompact = '1d00ffff';
    var hTargetCompact = leftPadding(str, "0", 8);
    var base = new BigNumber(256);// moi byte la 2^8 =256 ===>base la 256

    var e = hTargetCompact.slice(0, 2); //First Byte 
    var exponent = new BigNumber(e, 16); // MSB 1d maximum bytes of target hash
    
    exponent = exponent.minus(3); // chua cho cho 3byte  00 ff ff
    if(exponent.isNegative()) {
        exponent = new BigNumber(0);
    }
    var m = hTargetCompact.slice(2); //Three Significant Bytes
    var mantissa = new BigNumber(m, 16);
    var hTarget = mantissa.multipliedBy(base.exponentiatedBy(exponent));
    return hTarget;
}

/*
nbits = 0x12345678  : 0x12 (1 byte) : exp : total number of htarget bytes ( include 3 byte mantissa)
                    : 0x345678 (3 byte ) : mantissa
                     exp = exp<3 ? 3 : exp;              
==> hTarget  mantissa * (2**(exp-3))

the total number of hash256 is 2**256
the valid  hash  constraint is "result < hTarget"
==> the number of valid result is hTarget
==> the probability to get the valid hash result is p = hTarget/(2**256)
==> the needed average number of doing calculation is : nCal= 1/p = (2**256)/htarget;
    nCal is usually is too big ==> scale down by 2**32 ==>nDifficulty
*/
function calculate_nDifficulty(hTarget){
    let max = BigNumber(2).exponentiatedBy(255);//avoid to overflow;
    let nCal = max.dividedToIntegerBy(hTarget);
    nCal = nCal.multipliedBy(2);
    let scale = BigNumber(2).exponentiatedBy(32);
    let nDifficulty =nCal.dividedToIntegerBy(scale);
    if( nDifficulty.isZero()){
        nDifficulty = BigNumber(1);
    }
    return nDifficulty.toString(10);
}

function average_calculation_to_get_bnTarget(hTarget){
    let max = BigNumber(2).exponentiatedBy(255);//avoid to overflow;
    let nCal = max.dividedToIntegerBy(hTarget);
    nCal = nCal.multipliedBy(2);
    // let scale = BigNumber(2).exponentiatedBy(32);
    // let nDifficulty =nCal.dividedToIntegerBy(scale);
    // if( nDifficulty.isZero()){
    //     nDifficulty = BigNumber(1);
    // }
    return nCal.toString(10);
}

let bnTarget =nbits_to_bnTarget(403093919);
let nC = average_calculation_to_get_bnTarget(bnTarget);
let nDiff = calculate_nDifficulty(bnTarget);
console.log(nC);
console.log(nDiff);



