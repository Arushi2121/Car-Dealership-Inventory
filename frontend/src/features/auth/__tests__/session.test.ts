import { makeSession, makeToken, secondsFromNow } from '../../../test/fakeSession';
import { clearSession, loadSession, saveSession } from '../session';

afterEach(() => localStorage.clear());

describe('session', () => {
  it('loads the session that was saved', () => {
    const session = makeSession();

    saveSession(session);

    expect(loadSession()).toEqual(session);
  });

  it('returns null after the session is cleared', () => {
    saveSession(makeSession());

    clearSession();

    expect(loadSession()).toBeNull();
  });

  it('returns null when the token has expired', () => {
    saveSession({ ...makeSession(), token: makeToken(secondsFromNow(-60)) });

    expect(loadSession()).toBeNull();
  });

  it('returns null when the stored user is not valid JSON', () => {
    saveSession(makeSession());
    localStorage.setItem('marque_user', '{not json');

    expect(loadSession()).toBeNull();
  });
});
