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
    it('should throw BadRequestException if file is missing', async () => {
      await expect(controller.getHistory('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call getHistory on service with default repository', async () => {
      await controller.getHistory('some-file');
      expect(service.getHistory).toHaveBeenCalledWith(
        'phenomenon',
        'some-file',
      );
    });

    it('should call getHistory on service with specified repository', async () => {
      await controller.getHistory('some-file', 'custom-repo');
      expect(service.getHistory).toHaveBeenCalledWith(
        'custom-repo',
        'some-file',
      );
    });
  });

  describe('getDiff', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        controller.getDiff('', 'commit1', 'commit2'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if commit1 is missing', async () => {
      await expect(
        controller.getDiff('some-file', '', 'commit2'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if commit2 is missing', async () => {
      await expect(
        controller.getDiff('some-file', 'commit1', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call getDiff on service with default repository', async () => {
      await controller.getDiff('some-file', 'commit1', 'commit2');
      expect(service.getDiff).toHaveBeenCalledWith(
        'phenomenon',
        'some-file',
        'commit1',
        'commit2',
      );
    });

    it('should call getDiff on service with specified repository', async () => {
      await controller.getDiff(
        'some-file',
        'commit1',
        'commit2',
        'custom-repo',
      );
      expect(service.getDiff).toHaveBeenCalledWith(
        'custom-repo',
        'some-file',
        'commit1',
        'commit2',
      );
    });
  });
});
