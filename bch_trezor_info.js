//https://bch-bitcore2.trezor.io/api/block/1

var fs = require('fs');
var request = require("request-promise");
var BTCDifficultyDiscover = require('./BTCDifficultyDiscover');

const btcDiff = new BTCDifficultyDiscover();

function getblockbyheight(block_height, promise_progress_cb = {}) {
    let api_get_block_by_height = 'https://bch-bitcore2.trezor.io/api/block/'+block_height;
    return new Promise(function (resolve, reject) {
        request(api_get_block_by_height, { json: true }, (err, res, body) => {
           
            if (err) {
                // console.log(err);
                reject(err);
            } else {
                if (promise_progress_cb) {
                    promise_progress_cb(); //use
                }
                resolve(body);
            }
        });
    });
}
var progress_cnt = 0;
var jstep = 1;
var init_progres_cb = function (init_cnt, step) {
    progress_cnt = init_cnt;
    jstep = step
}
var progress_cb = function () {
    progress_cnt -= jstep;
    if (progress_cnt == 0) progress_cnt = 0;
    console.log('----> remain records ', progress_cnt);
}

function parse_block(block_obj) {
    // fs.appendFileSync(fname,"height,fee,numberTXs,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash");
    let nbit = block_obj.bits;
    let bnTarget = btcDiff.nbits_to_bnTarget(nbit);
    let nDiff = btcDiff.calculate_nDifficulty(bnTarget);
    let number_calcs = btcDiff.average_calculation_to_get_bnTarget(bnTarget);
    let targetStr = btcDiff.convert_bnTarget256Str(bnTarget);
    let utc_stamp = block_obj.time * 1000;
    let theDate = new Date(utc_stamp);
    let dateString = theDate.toGMTString().replace(",", "");

    let fee = -1;
    let number_of_tx = block_obj.TxCount;

    let info = '';
    info = info + block_obj.height + ',';
    info = info + fee + ',';
    info = info + number_of_tx + ',';
    info = info + block_obj.time + ',';
    info = info + dateString + ',';
    info = info + block_obj.nonce + ',';
    info = info + nbit + ',';
    info = info + nDiff + ',';
    info = info + number_calcs + ',';
    info = info + block_obj.hash + ',';
    info = info + targetStr;
    return info;
}

// function InvestigateBTC(start_height, end_height) {
//     // let start_height=0;
//     // let end_height=10;
//     let fname = 'investigate_' + start_height + '_' + end_height + '.csv';
//     if (fs.existsSync(fname)) {
//         fs.unlinkSync(fname);
//     }

//     let headline = "height,nTime,nonce,nDifficulty,average_hash_calcualtions,targetHash" + "\n";
//     fs.appendFileSync(fname, headline);

//     var promiseArr = [];
//     progress_cnt = end_height - start_height;
//     for (let i = start_height; i < end_height; i++) {
//         let pm = getblockbyheight(i, progress_cb);
//         promiseArr.push(pm);
//     }
//     Promise.all(promiseArr).then(function (blocks) {
//         let nres = blocks.length;
//         for (let i = 0; i < nres; i++) {
//             let obj_block = blocks[i].blocks[0];
//             // console.log(obj_block.height);
//             // fs.appendFileSync(fname,"height,nTime,nonce,nDifficulty,average_hash_calcualtions");
//             let inf = parse_block(obj_block);
//             fs.appendFileSync(fname, inf + "\n");
//         }

//     }).catch(console.error);

// }
function promiseTimeout(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(time); }, time);
    });
};

async function InvestigateBCHAsync(start_height, end_height, step_jump = 1,check_point=0) {

    let fname = 'BCH_trezor' + start_height + '_' + end_height + '.csv';
    if (fs.existsSync(fname)) {
        if(check_point==0){
            fs.unlinkSync(fname);
        }else{
            start_height=check_point;
        }
       
    }

    let init_cnt = end_height - start_height;
    init_progres_cb(init_cnt, step_jump);

    // let headline = "height,nTime,nonce,nDifficulty,average_hash_calcualtions,targetHash" + "\n";
    // let headline="height,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash"+"\n";
    let headline = "height,fee,numberTXs,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash" + "\n";

    fs.appendFileSync(fname, headline);
    let dly=100;
    for (let i = start_height; i < end_height;) {
        try {
            await promiseTimeout(dly);
            var block_obj = await getblockbyheight(i, progress_cb);
            //var block_info = block_obj.blocks[0];
            let inf = parse_block(block_obj);
            fs.appendFileSync(fname, inf + "\n");
            dly=100;
            i += step_jump;
        } catch (err) {
            dly=1000;//if err ==> delay more
            console.log("err");
        }

    }
}
InvestigateBCHAsync(470000, 500000, 200);
//InvestigateBTC(0,5000);