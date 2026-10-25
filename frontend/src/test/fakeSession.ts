function base64url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** An unsigned JWT-shaped token; only the exp claim matters to the frontend. */
export function makeToken(expSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ sub: 'user-1', exp: expSeconds }));
  return `${header}.${payload}.signature`;
}

export function secondsFromNow(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds;
}

export function makeSession(role: 'USER' | 'ADMIN' = 'USER') {
  return {
    token: makeToken(secondsFromNow(3600)),
    user: {
      id: role === 'ADMIN' ? 'admin-1' : 'user-1',
      email: role === 'ADMIN' ? 'admin@marque.test' : 'driver@marque.test',
      name: role === 'ADMIN' ? 'Ada Admin' : 'Dana Driver',
      role,
    },
  };
}
