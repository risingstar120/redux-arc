import {
  globalPolicies,
  register,
  reset,
  getActionPolicies,
} from '../src/policies';

beforeEach(() => {
  reset();
});

describe('reset', () => {
  it('should reset the globalPolicies', () => {
    const police = store => done => (action, error, response) => done(action, error, response);
    police.applyPoint = 'beforeRequest';
    register('mypolice', police);

    expect(globalPolicies.mypolice).not.toBe(undefined);
    reset();
    expect(globalPolicies.mypolice).toBe(undefined);
  });
})

describe('register', () => {
  it('should register a police into global policies', () => {
    const police = store => done => (action, error, response) => done(action, error, response);
    police.applyPoint = 'beforeRequest';
    register('mypolice', police);

    expect(globalPolicies.mypolice).toBe(police);
  });

  it('should throw when try to register a police more than once', () => {
    const police = store => done => (action, error, response) => done(action, error, response);
    police.applyPoint = 'beforeRequest';
    register('mypolice', police);

    expect(() => register('mypolice', police)).toThrow();
  });

  it('should validate a police', () => {
    // police without applyPoint
    const police = store => done => (action, error, response) => done(action, error, response);
    expect(() => register('mypolice', police)).toThrow();
    reset();
    //invalid applyPoing
    police.applyPoint = 'beforeReques';
    expect(() => register('mypolice', police)).toThrow();
  });
});

describe('getActionPolicies', () => {
  const SINGULAR_VALUE = 'SINGULAR_VALUE';
  test('should get the police runner for the given police array', (done) => {
    const police = store => next => (action, error, response) => {
      return next({ ...action, myPoliceWasHere: true }, error, response);
    };
    police.applyPoint = 'beforeRequest';
    register('mypolice', police);

    const myAction = { type: 'REQUEST' };
    const runner = getActionPolicies(['mypolice']);
    const callback = (action) => {
      expect(action.myPoliceWasHere).toBe(true);

      done();
      return SINGULAR_VALUE;
    };
    const result = runner('beforeRequest')({})(callback)(myAction, null, null);
    expect(result).toBe(SINGULAR_VALUE);
  });

  test('should run even without policies registered', (done) => {
    const myAction = { type: 'REQUEST' }
    const runner = getActionPolicies(undefined);
    const callback = (action) => {
      expect(action).toBe(myAction);
      done();
      return SINGULAR_VALUE;
    };
    const result = runner('beforeRequest')({})(callback)(myAction, null, null);
    expect(result).toBe(SINGULAR_VALUE);
  });
});






