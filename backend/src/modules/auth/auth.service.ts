import type { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../../shared/auth/token.js';
import type { Config } from '../../shared/config.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import type { UserRepository } from './user.repository.js';

const BCRYPT_COST = 10;

export type PublicUser = Omit<User, 'passwordHash'>;

export type AuthResult = {
  user: PublicUser;
  token: string;
};

// Picks fields explicitly, so a sensitive column added later is not exposed by default.
function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly config: Config,
  ) {}

  /** Creates a USER account (never an admin) and signs the user in. */
  async register(input: RegisterInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    if (await this.users.findByEmail(email)) {
      throw new ConflictError('Email already registered', 'EMAIL_TAKEN');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const user = await this.users.create({ email, passwordHash, name: input.name });
    return this.signIn(user);
  }

  /**
   * Checks credentials. An unknown email and a wrong password give the same error,
   * so the response never reveals which emails are registered.
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(normalizeEmail(input.email));
    const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }
    return this.signIn(user);
  }

  private signIn(user: User): AuthResult {
    const token = signToken({ sub: user.id, role: user.role }, this.config);
    return { user: toPublicUser(user), token };
  }
}
