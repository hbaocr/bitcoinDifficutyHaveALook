
var fs = require('fs');
var sleep = require('system-sleep');
var request = require("request-promise");
var BTCDifficultyDiscover = require('./BTCDifficultyDiscover');

const btcDiff = new BTCDifficultyDiscover();

function getblockbyheight(block_height, promise_progress_cb = {}) {
    let api_get_block_by_height = 'https://blockchain.info/block-height/' + block_height + '?format=json';
    return new Promise(function (resolve, reject) {
        request(api_get_block_by_height, { json: true }, (err, res, body) => {
            if (promise_progress_cb) {
                promise_progress_cb(); //use
            }
            if (err) {
               // console.log(err);
                reject(err);
            } else {
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
    // fs.appendFileSync(fname,"height,nTime,nonce,nDifficulty,average_hash_calcualtions,targetHash");
    let nbit = block_obj.bits;
    let bnTarget = btcDiff.nbits_to_bnTarget(nbit);
    let nDiff = btcDiff.calculate_nDifficulty(bnTarget);
    let number_calcs = btcDiff.average_calculation_to_get_bnTarget(bnTarget);
    let targetStr = btcDiff.convert_bnTarget256Str(bnTarget);

    let info = '';
    info = info + block_obj.height + ',';
    info = info + block_obj.time + ',';
    info = info + block_obj.nonce + ',';
    info = info + nDiff + ',';
    info = info + number_calcs + ',';
    info = info + targetStr;
    return info;
}
function InvestigateBTC(start_height, end_height) {
    // let start_height=0;
    // let end_height=10;
    let fname = 'investigate_' + start_height + '_' + end_height + '.csv';
    if (fs.existsSync(fname)) {
        fs.unlinkSync(fname);
    }

    let headline = "height,nTime,nonce,nDifficulty,average_hash_calcualtions,targetHash" + "\n";
    fs.appendFileSync(fname, headline);

    var promiseArr = [];
    progress_cnt = end_height - start_height;
    for (let i = start_height; i < end_height; i++) {
        let pm = getblockbyheight(i, progress_cb);
        promiseArr.push(pm);
    }
    Promise.all(promiseArr).then(function (blocks) {
        let nres = blocks.length;
        for (let i = 0; i < nres; i++) {
            let obj_block = blocks[i].blocks[0];
            // console.log(obj_block.height);
            // fs.appendFileSync(fname,"height,nTime,nonce,nDifficulty,average_hash_calcualtions");
            let inf = parse_block(obj_block);
            fs.appendFileSync(fname, inf + "\n");
        }

    }).catch(console.error);

}
function promiseTimeout(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(time); }, time);
    });
};

async function InvestigateBtcAsync(start_height, end_height, step_jump = 1) {

    let fname = 'investigate_' + start_height + '_' + end_height + '.csv';
    if (fs.existsSync(fname)) {
        fs.unlinkSync(fname);
    }

    let init_cnt = end_height - start_height;
    init_progres_cb(init_cnt, step_jump);

    let headline = "height,nTime,nonce,nDifficulty,average_hash_calcualtions,targetHash" + "\n";
    fs.appendFileSync(fname, headline);

    for (let i = start_height; i < end_height; i += step_jump) {
        try {
            //await Promise.reject('bad');
            var block_obj = await getblockbyheight(i, progress_cb);
            await promiseTimeout(500);
            var block_info = block_obj.blocks[0];
            let inf = parse_block(block_info);
            fs.appendFileSync(fname, inf + "\n");
        } catch (err) {
            console.log("err");
        }

    }
}
InvestigateBtcAsync(0, 100000, 100);
//InvestigateBTC(0,5000);