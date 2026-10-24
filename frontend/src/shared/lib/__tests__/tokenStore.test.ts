import { clearToken, getToken, setToken } from '../tokenStore';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('tokenStore', () => {
  it('stores, reads and clears the token', () => {
    setToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');

    clearToken();
    expect(getToken()).toBeNull();
  });

  it('returns null when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(getToken()).toBeNull();
  });
});
