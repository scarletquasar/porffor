import './prefs.js';

export const TYPE_FLAGS = {
  parity:    0b10000000,
  length:    0b01000000,
};

export const TYPES = {
  empty: 0x00,
  number: 0x01,
  boolean: 0x02,
  string: 0x03 | TYPE_FLAGS.length,
  bigint: 0x04,
  symbol: 0x05,
  function: 0x06,
  object: 0x07,

  undefined: 0x00 | TYPE_FLAGS.parity,
};

export const TYPE_NAMES = {
  [TYPES.empty]: 'empty',
  [TYPES.number]: 'Number',
  [TYPES.boolean]: 'Boolean',
  [TYPES.string]: 'String',
  [TYPES.undefined]: 'undefined',
  [TYPES.object]: 'Object',
  [TYPES.function]: 'Function',
  [TYPES.symbol]: 'Symbol',
  [TYPES.bigint]: 'BigInt'
};

export const typeHasFlag = (type, flag) => (type & flag) !== 0;

export const INTERNAL_TYPE_BASE = 0x10;
let internalTypeIndex = INTERNAL_TYPE_BASE;
const registerInternalType = (name, flags = [], overrideType = undefined) => {
  let n = overrideType ?? internalTypeIndex++;

  if (!overrideType) for (const x of flags) {
    if (TYPE_FLAGS[x]) n |= TYPE_FLAGS[x];
  }

  TYPES[name.toLowerCase()] = n;
  TYPE_NAMES[n] = name;
};

// note: when adding a new internal type, please also add a deserializer to wrap.js
registerInternalType('ByteString', ['iterable', 'length'], TYPES.string | TYPE_FLAGS.parity);

registerInternalType('Array', ['iterable', 'length']);
registerInternalType('RegExp');
registerInternalType('Date');

registerInternalType('Set', ['iterable']);
registerInternalType('Map');

registerInternalType('ArrayBuffer');
registerInternalType('SharedArrayBuffer');
registerInternalType('DataView');

for (const x of [ 'Uint8', 'Int8', 'Uint8Clamped', 'Uint16', 'Int16', 'Uint32', 'Int32', 'Float32', 'Float64' ])
  registerInternalType(`${x}Array`, ['iterable', 'length']);

registerInternalType('WeakRef');
registerInternalType('WeakSet');
registerInternalType('WeakMap');

registerInternalType('Promise');

registerInternalType('BooleanObject');
registerInternalType('NumberObject');
registerInternalType('StringObject');

for (const x of [ '', 'Aggregate', 'Type', 'Reference', 'Syntax', 'Range', 'Eval', 'URI', 'Test262', 'Todo' ])
  registerInternalType(`${x}Error`);

registerInternalType('__Porffor_Generator');
registerInternalType('__Porffor_AsyncGenerator');

if (Prefs.largestTypes) {
  const typeKeys = Object.keys(TYPES);
  const typeVals = Object.values(TYPES);

  const largestType = (vals, keys) => {
    const val = Math.max(...vals);
    const key = keys[vals.indexOf(val)];
    return [ val, key ];
  };

  const unflag = val => val & 0b00111111;

  const logType = (label, val, key) => console.log(`${label}    ${key} - ${val} (0x${val.toString(16)}, 0b${val.toString(2).padStart(8, '0')})`);

  logType(`largest type:         `, ...largestType(typeVals.map(unflag), typeKeys));
  logType(`largest type w/ flags:`, ...largestType(typeVals, typeKeys));
  console.log();
}