import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserDomainService } from '@synop/domains';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUserDomainService = {
    findByNickname: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UserDomainService, useValue: mockUserDomainService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      const user = { id: '1', nickname: 'test', email: 'test@test.com', password: 'hashedpassword' };
      mockUserDomainService.findByNickname.mockResolvedValue(user);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await controller.login({ nickname: 'test', password: 'password' });

      expect(result).toEqual({ access_token: 'test-token' });
      expect(mockUserDomainService.findByNickname).toHaveBeenCalledWith('test');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ nickname: 'test', sub: '1' });
    });

    it('should throw UnauthorizedException for an invalid user', async () => {
      mockUserDomainService.findByNickname.mockResolvedValue(null);

      await expect(controller.login({ nickname: 'invalid', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for an invalid password', async () => {
      const user = { id: '1', nickname: 'test', email: 'test@test.com', password: 'hashedpassword' };
      mockUserDomainService.findByNickname.mockResolvedValue(user);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(controller.login({ nickname: 'test', password: 'wrongpassword' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const user = { nickname: 'newuser', email: 'new@test.com', password: 'password' };
      mockUserDomainService.create.mockResolvedValue({ id: '2', ...user });
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashedpassword');

      const result = await controller.register(user);

      expect(result).toBeDefined();
      expect(mockUserDomainService.create).toHaveBeenCalledWith(expect.objectContaining({
        nickname: 'newuser',
        email: 'new@test.com',
        password: 'hashedpassword',
      }));
    });
  });
});
