export function getTLVforValue(tagNum, tagValue) {
  const tagBuf = Buffer.from([tagNum]);

  const tagValueLenBuf = Buffer.alloc(1);
  tagValueLenBuf.writeUInt8(tagValue.length);

  const tagValueBuf = Buffer.from(tagValue, 'utf8');

  const bufsArray = [tagBuf, tagValueLenBuf, tagValueBuf];

  return Buffer.concat(bufsArray);
}
