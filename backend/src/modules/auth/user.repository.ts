import type { PrismaClient, User } from '@prisma/client';

export type CreateUserData = {
  email: string;
  passwordHash: string;
  name?: string | null;
};

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserData) {
    return this.prisma.user.create({ data });
  }
}
