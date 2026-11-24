import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
} from 'node:crypto';
import { DataSource, QueryFailedError } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import type { AuthTokenResponse } from '../../types/auth.type';

const ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60;
const REFRESH_TOKEN_LIFETIME_DAYS = 30;
const SCRYPT_KEY_LENGTH = 64;

function hashPassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, SCRYPT_KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

function signAccessToken(user: User, secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsignedToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    sub: user.id,
    roleId: user.roleId,
    roleCode: user.role.code,
    iat: now,
    exp: now + ACCESS_TOKEN_LIFETIME_SECONDS,
  })}`;
  const signature = createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64url');

  return `${unsignedToken}.${signature}`;
}

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource) {}

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

    if (!accessTokenSecret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET is not configured',
      );
    }

    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);
    const email = dto.email.toLowerCase();
    const existingUser = await userRepository.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const customerRoleCode = 'customer' as Role['code'];
    await roleRepository.upsert(
      {
        name: 'Customer',
        code: customerRoleCode,
        description: 'Customer account access.',
      },
      { conflictPaths: ['code'], skipUpdateIfNoValuesChanged: true },
    );
    const customerRole = await roleRepository.findOneByOrFail({
      code: customerRoleCode,
    });

    const salt = randomBytes(16).toString('hex');
    const passwordHash = await hashPassword(dto.password, salt);
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_LIFETIME_DAYS);

    try {
      const user = userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        name: `${dto.firstName} ${dto.lastName}`.trim(),
        email,
        password: `scrypt$${salt}$${passwordHash.toString('hex')}`,
        phone: dto.phone ?? null,
        roleId: customerRole.id,
        role: customerRole,
        lastLoginAt: new Date(),
        avatar: null,
        saltPass: null,
      });

      const savedUser = await this.dataSource.transaction(async (manager) => {
        const saved = await manager.getRepository(User).save(user);
        await manager.getRepository(RefreshToken).save({
          userId: saved.id,
          user: saved,
          tokenHash: refreshTokenHash,
          expiresAt,
          revokedAt: null,
          deviceInfo: null,
        });
        return saved;
      });

      return {
        accessToken: signAccessToken(savedUser, accessTokenSecret),
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      throw error;
    }
  }
}
