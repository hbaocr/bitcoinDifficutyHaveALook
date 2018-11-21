var fs = require('fs');
var request = require("request-promise");
var BTCDifficultyDiscover = require('./BTCDifficultyDiscover');
const btcDiff = new BTCDifficultyDiscover();


function promiseTimeout(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(time); }, time);
    });
};

function parse_block(block_obj) {
    // fs.appendFileSync(fname,"height,fee,numberTXs,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash");
    let nbit = block_obj.bits;
    let bnTarget = btcDiff.nbits_to_bnTarget(nbit);
    let nDiff = btcDiff.calculate_nDifficulty(bnTarget);
    let number_calcs = btcDiff.average_calculation_to_get_bnTarget(bnTarget);
    let targetStr = btcDiff.convert_bnTarget256Str(bnTarget);
    let utc_stamp = block_obj.timestamp * 1000;
    let theDate = new Date(utc_stamp);
    let dateString = theDate.toGMTString().replace(",", "");

    let fee = block_obj.reward_fees;
    let number_of_tx = block_obj.tx_count;

    let info = '';
    info = info + block_obj.height + ',';
    info = info + fee + ',';
    info = info + number_of_tx + ',';
    info = info + block_obj.timestamp + ',';
    info = info + dateString + ',';
    info = info + block_obj.nonce + ',';
    info = info + nbit + ',';
    info = info + nDiff + ',';
    info = info + number_calcs + ',';
    info = info + block_obj.hash + ',';
    info = info + targetStr + ',';
    info = info + block_obj.size + ',';
    return info;
}

//https://chain.api.btc.com/v3/block/4,5,6,7,8
var getBCHBlockInfo = function (start, step, numblocks) {
    var api_endpoint = "https://chain.api.btc.com/v3/block/";
    let info = "";
    if (numblocks > 50) {
        numblocks = 50;
    }
    for (let i = 0; i < numblocks; i++) {
        // api_endpoint= api_endpoint +
        if (i >= (numblocks - 1)) {
            info = info + (start + step * i);
        } else {
            info = info + (start + step * i) + ',';
        }
    }
    api_endpoint = api_endpoint + info;

    //console.log("----link--->", api_endpoint);

    return new Promise(function (resolve, reject) {
        request(api_endpoint, { json: true }, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });


}

//getBCHBlockInfo(10,10,10)
async function InvestigateBTCAsync(start_height, end_height, step_jump = 1) {

    let fname = 'BCH_' + start_height + '_' + end_height + '.csv';

    if (fs.existsSync(fname)) {
        fs.unlinkSync(fname);
    }

    let headline = "height,fee,numberTXs,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash,size" + "\n";

    fs.appendFileSync(fname, headline);
    let dly = 100;
    let idx = start_height;
    while (idx < end_height) {
        try {
            await promiseTimeout(dly);
            let res = await getBCHBlockInfo(idx, step_jump, 50);
            dly = 1000;
            if (res.data) {
                idx = idx + (res.data.length) * step_jump;
                for (let i = 0; i < res.data.length; i++) {
                    let inf = parse_block(res.data[i]);
                    fs.appendFileSync(fname, inf + "\n");
                }
                console.log("--remain-->",(end_height-idx))
            } else {
                dly = 2000;
            }
        } catch (err) {
            dly = 2000;//if err ==> delay more
            console.log("err");
        }
    }
}

async function ContinueInvestigateBCHAsync(start_height, end_height, step_jump = 1,check_point=0) {

    let fname = 'BCH_' + start_height + '_' + end_height + '.csv';

    if (fs.existsSync(fname)) {
        if(check_point==0){
            fs.unlinkSync(fname);
        }else{
            start_height=check_point;
        }
       
    }

    let headline = "height,fee,numberTXs,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash,size" + "\n";

    fs.appendFileSync(fname, headline);
    let dly = 100;
    let idx = start_height;
    while (idx < end_height) {
        try {
            await promiseTimeout(dly);
            let res = await getBCHBlockInfo(idx, step_jump, 50);
            dly = 1000;
            if (res.data) {
                idx = idx + (res.data.length) * step_jump;
                for (let i = 0; i < res.data.length; i++) {
                    let inf = parse_block(res.data[i]);
                    fs.appendFileSync(fname, inf + "\n");
                }
                console.log("--remain-->",(end_height-idx))
            } else {
                dly = 2000;
            }
        } catch (err) {
            dly = 2000;//if err ==> delay more
            console.log("err");
        }
    }
}
let ee = 557555;
let ss = ee- 3000;
let step =1;
InvestigateBTCAsync(ss, ee, step);