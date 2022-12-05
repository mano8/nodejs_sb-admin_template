const chai = require('chai');
const assert = chai.assert;
const Utils = require('../utils/utils.js');
let utils = new Utils();

const testArrayValues = (values, assertName, testName, assertCallback, testCallback) =>{
  values.forEach((val, index) => {
    assertCallback(testCallback(val), `${val} failled ${assertName} on ${testName} test.`);
  });
}
suite('Utils Unit Tests', function () {
  suite('Basic Assertions', function () {
    test('isObject', function () {
      const true_values = [{}, {g: 1}]
      const false_values = [
        'azerty', ['azerty'], 1, undefined, null, true, false
      ]
      testArrayValues(true_values, 'isTrue', 'isObject', assert.isTrue, utils.isObject)
      testArrayValues(false_values, 'isNotTrue', 'isObject', assert.isNotTrue, utils.isObject)
    });

    test('isArray', function () {
      const true_values = [[1, 2], [{a: 1}, "a"], []]
      const false_values = [
        'azerty', {g: 1}, 1, undefined, null, true, false
      ]
      testArrayValues(true_values, 'isTrue', 'isArray', assert.isTrue, utils.isArray)
      testArrayValues(false_values, 'isNotTrue', 'isArray', assert.isNotTrue, utils.isArray)
    });

    test('isNumber', function () {
      const true_values = [12, 0.256, 0, -15]
      const false_values = [
        'azerty', {g: 1}, [1, 2], undefined, null
      ]
      testArrayValues(true_values, 'isTrue', 'isNumber', assert.isTrue, utils.isNumber)
      testArrayValues(false_values, 'isNotTrue', 'isNumber', assert.isNotTrue, utils.isNumber)
    });

    test('round', function () {
      assert.strictEqual(utils.round(0.021987321, 2), 0.02, 'Rounded number not success');
      assert.strictEqual(utils.round(0.025987321, 2), 0.03, 'Rounded number not success');
      assert.strictEqual(utils.round(1, 2), 1, 'Rounded number not success');
      assert.isUndefined(utils.round(0.025987321, 'azerty'), 'Bad params do not return undefined');
      assert.isUndefined(utils.round(0.025987321, ['2', 'a']), 'Bad params do not return undefined');
    });

    test('isStr', function () {
      const true_values = ['1s2', new String('1s2'), '', " "]
      const false_values = [
        1, 1.0234, {g: 1}, [1, 2], undefined, null, true, false
      ]
      testArrayValues(true_values, 'isTrue', 'isStr', assert.isTrue, utils.isStr)
      testArrayValues(false_values, 'isNotTrue', 'isStr', assert.isNotTrue, utils.isStr)
    });

    test('iskey', function () {
      const true_values = ['az_12_dfgdfAF1', 'azF1']
      const false_values = [
        '_azF1', 'azF1_', 'azF1_@sdf', 'ba(zF1', 'ba<zF1', 'ba>zF1', 'ba"zF1', "ba'zF1",
        'ba)zF1', 'ba{zF1', 'ba}zF1', 'ba[zF1', "ba]zF1", "ba$zF1", "ba*zF1", "ba%zF1",
        1.0234, {g: 1}, [1, 2]
      ]
      testArrayValues(true_values, 'isTrue', 'iskey', assert.isTrue, utils.iskey)
      testArrayValues(false_values, 'isNotTrue', 'iskey', assert.isNotTrue, utils.iskey)
    });

    test('isEmailChars', function () {
      const true_values = ['az_12@dfgdfA.F1', '.azF1@']
      const false_values = [
        '.az', '.az"F1@', '.az<F1@', '.az>F1@', ".az'F1@", '.az#F1@', 'ba$zF1', 'ba*zF1', "ba=zF1",
        'ba)zF1', 'ba{zF1', 'ba}zF1', 'ba[zF1', "ba]zF1", "ba$zF1", "ba*zF1", "ba%zF1",
        1.0234, {g: 1}, [1, 2]
      ]
      testArrayValues(true_values, 'isTrue', 'isEmailChars', assert.isTrue, utils.isEmailChars)
      testArrayValues(false_values, 'isNotTrue', 'isEmailChars', assert.isNotTrue, utils.isEmailChars)
    });

    test('isPasswordChars', function () {
      const true_values = ['az_12@#d-@#$%+=f.AF1', '12345678']
      const false_values = [
        '12345678"F1@', '12345678<F1@', '12345678>F1@', "12345678'F1@", "12345678(F1@",
        'ba)zF1', 'ba{zF1', 'ba}zF1', 'ba[zF1', "ba]zF1", "ba*zF1", "ba/zF1",
        1.0234, {g: 1}, [1, 2]
      ]
      testArrayValues(true_values, 'isTrue', 'isPasswordChars', assert.isTrue, utils.isPasswordChars)
      testArrayValues(false_values, 'isNotTrue', 'isPasswordChars', assert.isNotTrue, utils.isPasswordChars)
    });

    test('emailSanitizer', function () {
      assert.strictEqual(utils.emailSanitizer('az_12_dfgdfAF1'), 'az_12_dfgdfAF1', 'az_12_dfgdfAF1 sanitized with same result.');
      assert.strictEqual(utils.emailSanitizer('az_12@dfgdfA.F1'), 'az_12@dfgdfA.F1', 'az_12@dfgdfA.F1  sanitized with same result.');
    
    });
  })
})