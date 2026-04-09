import { Test, TestingModule } from '@nestjs/testing';
import { ManifestController } from './manifest.controller';
import { PhenomenonStorageService } from '@synop/domains';
import { Request } from 'express';
import { UpdateManifestDto } from '../dto/update-manifest.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ManifestController', () => {
  let controller: ManifestController;
  let mockPhenomenonStorageService: jest.Mocked<PhenomenonStorageService>;

  beforeEach(async () => {
    mockPhenomenonStorageService = {
      updateFullManifest: jest.fn(),
    } as unknown as jest.Mocked<PhenomenonStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManifestController],
      providers: [
        {
          provide: PhenomenonStorageService,
          useValue: mockPhenomenonStorageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ManifestController>(ManifestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateManifest', () => {
    it('should throw UnauthorizedException if no user', async () => {
      const dto: UpdateManifestDto = {
        article_slug: 'test',
        title: 'Test',
        last_updated: '2023-01-01',
        default_lang: 'en',
        structure: [],
        blocks: {},
      };

      const req = {
        user: undefined,
      } as unknown as Request;

      await expect(controller.updateManifest('test-id', dto, req)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPhenomenonStorageService.updateFullManifest).not.toHaveBeenCalled();
    });

    it('should call phenomenonStorageService.updateFullManifest with user author if user exists', async () => {
      const dto: UpdateManifestDto = {
        article_slug: 'test',
        title: 'Test',
        last_updated: '2023-01-01',
        default_lang: 'en',
        structure: [],
        blocks: {},
      };

      const req = {
        user: { email: 'test@example.com' },
      } as unknown as Request;

      mockPhenomenonStorageService.updateFullManifest.mockResolvedValueOnce({ success: true } as any);

      const result = await controller.updateManifest('test-id', dto, req);

      expect(mockPhenomenonStorageService.updateFullManifest).toHaveBeenCalledWith(
        'test-id',
        dto,
        { name: 'test@example.com', email: 'test@example.com' },
      );
      expect(result).toEqual({ success: true });
    });
  });
});
