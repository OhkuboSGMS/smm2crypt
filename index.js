/*! smm2crypt (C) SwitchJS */
const smm2crypt = (function() {
  // const crypto = require("crypto");
  const _aesjs = typeof aesjs !== "undefined" ? aesjs : require("aes-js");

  const course_key_table = Uint32Array.from([
    0x7AB1C9D2, 0xCA750936, 0x3003E59C, 0xF261014B,
    0x2E25160A, 0xED614811, 0xF1AC6240, 0xD59272CD,
    0xF38549BF, 0x6CF5B327, 0xDA4DB82A, 0x820C435A,
    0xC95609BA, 0x19BE08B0, 0x738E2B81, 0xED3C349A,
    0x045275D1, 0xE0A73635, 0x1DEBF4DA, 0x9924B0DE,
    0x6A1FC367, 0x71970467, 0xFC55ABEB, 0x368D7489,
    0x0CC97D1D, 0x17CC441E, 0x3528D152, 0xD0129B53,
    0xE12A69E9, 0x13D1BDB7, 0x32EAA9ED, 0x42F41D1B,
    0xAEA5F51F, 0x42C5D23C, 0x7CC742ED, 0x723BA5F9,
    0xDE5B99E3, 0x2C0055A4, 0xC38807B4, 0x4C099B61,
    0xC4E4568E, 0x8C29C901, 0xE13B34AC, 0xE7C3F212,
    0xB67EF941, 0x08038965, 0x8AFD1E6A, 0x8E5341A3,
    0xA4C61107, 0xFBAF1418, 0x9B05EF64, 0x3C91734E,
    0x82EC6646, 0xFB19F33E, 0x3BDE6FE2, 0x17A84CCA,
    0xCCDF0CE9, 0x50E4135C, 0xFF2658B2, 0x3780F156,
    0x7D8F5D68, 0x517CBED1, 0x1FCDDF0D, 0x77A58C94
  ]);

  const rand_init = ([x, y, z, w]) => ((x|y|z|w) ? [x,y,z,w] : [1, 0x6C078967, 0x714ACB41, 0x48077044]);

  const rand_gen = (rand_state) => {
    let n = (rand_state[0] ^ rand_state[0] << 11)>>>0;
    n ^= (n >>> 8) ^ rand_state[3] ^ (rand_state[3] >>> 19);

    rand_state[0] = rand_state[1]>>>0;
    rand_state[1] = rand_state[2]>>>0;
    rand_state[2] = rand_state[3]>>>0;
    rand_state[3] = n>>>0;
    return n >>> 0;
  };

  const gen_key = (key_table, rand_state) => {
    const out_key = Uint32Array.from([0, 0, 0, 0]);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out_key[i] <<= 8;
        out_key[i] |= (key_table[rand_gen(rand_state) >>> 26] >> ((rand_gen(rand_state) >>> 27) & 24)) & 0xFF;
      }
    }
    return out_key;
  };

  const UInt32Val = (a, idx) => ( a[4*idx] | (a[4*idx+1]<<8) | (a[4*idx+2]<<16) | (a[4*idx+3]<<24) ) >>> 0;

  const decrypt_course = (data) => {
    const end = data.slice(-0x30);
    const iv = end.slice(0, 16);
    const rand_state = rand_init([4, 5, 6, 7].map(x => UInt32Val(end, x)));
    const key = new Uint8Array(new Uint32Array( gen_key(course_key_table, rand_state) ).buffer);

    // using aesjs
    var aesCbc = new _aesjs.ModeOfOperation.cbc(key, iv);
    var decryptedBytes = aesCbc.decrypt(data.slice(0x10));
    return decryptedBytes.slice(0, -0x30);

    // using node crypto
    // var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    // return decipher.update(data.slice(0x10)).slice(0, -0x20);
  };

  return {
    decrypt_course
  };
})();

if(typeof module !== "undefined") module.exports = smm2crypt;
