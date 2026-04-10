import { Test, TestingModule } from '@nestjs/testing';
import { GitController } from './git.controller';
import { GitService } from './git.service';
import { BadRequestException } from '@nestjs/common';

describe('GitController', () => {
  let controller: GitController;
  let service: GitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitController],
      providers: [
        {
          provide: GitService,
          useValue: {
            getHistory: jest.fn(),
            getDiff: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GitController>(GitController);
    service = module.get<GitService>(GitService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHistory', () => {
    it('should throw BadRequestException if repository is missing', async () => {
      await expect(controller.getHistory('file', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(controller.getHistory('', 'repo')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call getHistory on service', async () => {
      await controller.getHistory('some-file', 'repo', '10');
      expect(service.getHistory).toHaveBeenCalledWith('repo', 'some-file', 10);
    });
  });

  describe('getDiff', () => {
    it('should throw BadRequestException if repository is missing', async () => {
      await expect(controller.getDiff('file', 'c1', 'c2', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        controller.getDiff('', 'commit1', 'commit2', 'repo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if commit1 is missing', async () => {
      await expect(
        controller.getDiff('some-file', '', 'commit2', 'repo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if commit2 is missing', async () => {
      await expect(
        controller.getDiff('some-file', 'commit1', '', 'repo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call getDiff on service', async () => {
      await controller.getDiff('some-file', 'commit1', 'commit2', 'repo');
      expect(service.getDiff).toHaveBeenCalledWith(
        'repo',
        'some-file',
        'commit1',
        'commit2',
      );
    });
  });
});
