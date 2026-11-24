import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { DataSource, IsNull, QueryFailedError } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import type { AuthTokenResponse } from '../../types/auth.type';
import type { AuthenticatedUser } from '../../types/authenticated-user/authenticated-user';

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

  async getCurrentUser(accessToken: string): Promise<AuthenticatedUser> {
    const payload = this.verifyAccessToken(accessToken);
    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      roleCode: user.role.code,
      permissions: user.role.permissions?.map((permission) => permission.code),
      name: user.name,
      avatar: user.avatar,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.dataSource.getRepository(RefreshToken).update(
      { tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

    if (!accessTokenSecret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET is not configured',
      );
    }

    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .where('LOWER(user.email) = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user || !(await this.verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_LIFETIME_DAYS);

    await this.dataSource.transaction(async (manager) => {
      user.lastLoginAt = new Date();
      await manager.getRepository(User).save(user);
      await manager.getRepository(RefreshToken).save({
        userId: user.id,
        user,
        tokenHash: refreshTokenHash,
        expiresAt,
        revokedAt: null,
        deviceInfo: null,
      });
    });

    return {
      accessToken: signAccessToken(user, accessTokenSecret),
      refreshToken,
    };
  }

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

  private async verifyPassword(
    password: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [algorithm, salt, storedHash] = storedPassword.split('$');

    if (algorithm !== 'scrypt' || !salt || !storedHash) {
      return false;
    }

    const expected = Buffer.from(storedHash, 'hex');

    if (expected.length !== SCRYPT_KEY_LENGTH) {
      return false;
    }

    const actual = await hashPassword(password, salt);
    return timingSafeEqual(actual, expected);
  }

  private verifyAccessToken(token: string): { sub: string } {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET is not configured',
      );
    }

    const [encodedHeader, encodedPayload, encodedSignature, ...extraParts] =
      token.split('.');

    if (
      !encodedHeader ||
      !encodedPayload ||
      !encodedSignature ||
      extraParts.length > 0
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    try {
      const header = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString('utf8'),
      ) as { alg?: string };
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as { sub?: string; exp?: number };
      const expectedSignature = createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest();
      const suppliedSignature = Buffer.from(encodedSignature, 'base64url');

      if (
        header.alg !== 'HS256' ||
        suppliedSignature.length !== expectedSignature.length ||
        !timingSafeEqual(suppliedSignature, expectedSignature) ||
        typeof payload.sub !== 'string' ||
        typeof payload.exp !== 'number' ||
        payload.exp <= Math.floor(Date.now() / 1000)
      ) {
        throw new UnauthorizedException('Invalid or expired access token');
      }

      return { sub: payload.sub };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid access token');
    }
  }
}
