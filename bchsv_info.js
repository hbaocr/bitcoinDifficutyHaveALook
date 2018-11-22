//https://bch-bitcore2.trezor.io/api/block/1

var fs = require('fs');
var request = require("request-promise");
var BTCDifficultyDiscover = require('./BTCDifficultyDiscover');

const btcDiff = new BTCDifficultyDiscover();

function getblockbyheight(block_height, promise_progress_cb = {}) {
    let api_get_block_by_height = 'http://bchsv-explorer.com/api/blocks/'+block_height;
    return new Promise(function (resolve, reject) {
        request(api_get_block_by_height, { json: true }, (err, res, body) => {
           
            if (err) {
                // console.log(err);
                reject(err);
            } else {
                // if (promise_progress_cb) {
                //     promise_progress_cb(); //use
                // }
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
    console.log('BSV----> remain records ', progress_cnt);
}

function parse_block(block_obj) {
    // fs.appendFileSync(fname,"height,fee,numberTXs,nTime,date_str,nonce,nbits,nDifficulty,average_hash_calcualtions,blockhash,targetHash");
    let nbit = block_obj.bits;
    let bnTarget = btcDiff.nbits_to_bnTarget(nbit);
    let nDiff = btcDiff.calculate_nDifficulty(bnTarget);
    let number_calcs = btcDiff.average_calculation_to_get_bnTarget(bnTarget);
    let targetStr = btcDiff.convert_bnTarget256Str(bnTarget);
    let utc_stamp = Math.round(new Date(block_obj.time).getTime()) ; 
    let theDate = new Date(utc_stamp);
    let dateString = theDate.toGMTString().replace(",", "");

    let fee = -1;
    let number_of_tx = block_obj.tx.length;

    let info = '';
    info = info + block_obj.height + ',';
    info = info + fee + ',';
    info = info + number_of_tx + ',';
    info = info + utc_stamp + ',';
    info = info + dateString + ',';
    info = info + block_obj.nonce + ',';
    info = info + nbit + ',';
    info = info + nDiff + ',';
    info = info + number_calcs + ',';
    info = info + block_obj.hash + ',';
    info = info + targetStr;
    return info;
}

function promiseTimeout(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(time); }, time);
    });
};

async function InvestigateBCH_SV_Async(start_height, end_height, step_jump = 1,check_point=0) {

    let fname = 'BSV_' + start_height + '_' + end_height + '.csv';
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
            var block_obj = await getblockbyheight(i);
            //var block_info = block_obj.blocks[0];
            if(block_obj.block){
                let inf = parse_block(block_obj.block);
                fs.appendFileSync(fname, inf + "\n");
                progress_cb();
                dly=100;
                i += step_jump;
            }
           
        } catch (err) {
            dly += 1000;//if err ==> delay more
            console.log("err");
        }

    }
}

// let ee = 557588;
// let ss = ee - 900;
// let step =1;
// InvestigateBCH_SV_Async(ss, ee, step);

module.exports.InvestigateBCH_SV_Async=InvestigateBCH_SV_Async;
//InvestigateBTC(0,5000);