const { pinyin } = require('../');
const expect = require('chai').expect;

describe('multiple', () => {
  it('[multiple]非单字', () => {
    const result = pinyin('汉语拼音', { multiple: true });
    expect(result).to.be.equal('hàn yǔ pīn yīn');
  });

  it('[multiple]单字', () => {
    const result = pinyin('好', { multiple: true });
    expect(result).to.be.equal('hǎo hào');
  });

  it('[multiple]去 tone 同音', () => {
    const result = pinyin('好', { multiple: true, toneType: 'none' });
    expect(result).to.be.equal('hao');
  });

  it('[multiple]非单字数组', () => {
    const result = pinyin('汉语拼音', { multiple: true, type: 'array' });
    expect(result).to.deep.equal(['hàn', 'yǔ', 'pīn', 'yīn']);
  });

  it('[multiple]单字数组', () => {
    const result = pinyin('好', { multiple: true, type: 'array' });
    expect(result).to.deep.equal(['hǎo', 'hào']);
  });

  it('[multiple]非字符串', () => {
    const result = pinyin('a', { multiple: true, type: 'array' });
    expect(result).to.deep.equal(['a']);
  });

  it('[multiple]multiple+surname同时使用', () => {
    const result = pinyin('能', { mode: 'surname', multiple: true });
    expect(result).to.be.equal('nài néng');
  });

  it('[multiple]base', () => {
    const result = pinyin('好', { multiple: true });
    expect(result).to.be.equal('hǎo hào');
  });
});
