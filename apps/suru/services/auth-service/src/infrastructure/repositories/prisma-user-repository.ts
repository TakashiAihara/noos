/**
 * Prisma User Repository Implementation
 */

import { PrismaClient } from '@noos/suru-db';
import { ValidationError } from '@noos/suru-types';
import { User } from '../../domain/entities/user';
import type { UserFilters, UserRepository } from '../../domain/repositories/user-repository';
import { Email } from '../../domain/value-objects/email';
import { UserId } from '../../domain/value-objects/user-id';

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const exists = await this.exists(UserId.create(user.id));

    const data = {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      version: user.version,
    };

    if (exists) {
      try {
        await this.prisma.user.update({
          where: {
            id: data.id,
          },
          data: {
            email: data.email,
            displayName: data.email, // Using email as display name for now
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        throw new ValidationError('User update failed');
      }
    } else {
      await this.prisma.user.create({
        data: {
          id: data.id,
          email: data.email,
          displayName: data.email,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      });
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });

    if (!userData) {
      return null;
    }

    return User.reconstitute({
      id: userData.id,
      email: userData.email,
      passwordHash: '$2b$10$placeholder', // Placeholder since we don't store passwords in User table
      isActive: true,
      isEmailVerified: true,
      createdAt: userData.createdAt,
      updatedAt: userData.lastLoginAt,
      version: 1,
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.toString() },
    });

    if (!userData) {
      return null;
    }

    return User.reconstitute({
      id: userData.id,
      email: userData.email,
      passwordHash: '$2b$10$placeholder',
      isActive: true,
      isEmailVerified: true,
      createdAt: userData.createdAt,
      updatedAt: userData.lastLoginAt,
      version: 1,
    });
  }

  async findMany(filters: UserFilters): Promise<{
    users: User[];
    totalCount: number;
  }> {
    const where = {};

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: filters.offset,
        take: filters.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) =>
        User.reconstitute({
          id: u.id,
          email: u.email,
          passwordHash: '$2b$10$placeholder',
          isActive: true,
          isEmailVerified: true,
          createdAt: u.createdAt,
          updatedAt: u.lastLoginAt,
          version: 1,
        }),
      ),
      totalCount,
    };
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.toString() },
    });
  }

  async exists(id: UserId): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: id.toString() },
    });
    return count > 0;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toString() },
    });
    return count > 0;
  }
}
