import { authHeaders, getAuthToken, setAuthToken } from '../auth-token.function';

describe('auth token', () => {
  afterEach(() => setAuthToken(null));

  it('holds no token by default', () => {
    expect(getAuthToken()).toBeNull();
    expect(authHeaders()).toEqual({});
  });

  it('builds a bearer header once a token is set', () => {
    setAuthToken('abc.def.ghi');
    expect(authHeaders()).toEqual({ Authorization: 'Bearer abc.def.ghi' });
  });

  it('clears on logout', () => {
    setAuthToken('abc');
    setAuthToken(null);
    expect(authHeaders()).toEqual({});
  });

  // The web admin never sets a token and must stay on its session cookie; an
  // empty object here is what keeps that path unchanged.
  it.each([[undefined], [null], ['']])(
    'sends no header for %s',
    (value) => {
      setAuthToken(value as never);
      expect(authHeaders()).toEqual({});
    }
  );
});
