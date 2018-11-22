var bch = require("./bch_trezor_info");
var bsv = require("./bchsv_info");
let ss = 557030;
let ee = 557250;
let step =1;
bch.InvestigateBCHAsync(ss,ee,step);
bsv.InvestigateBCH_SV_Async(ss,ee,step);
