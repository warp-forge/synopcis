import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BlockCatalogEntryDto } from './update-manifest.dto';

@ValidatorConstraint({ name: 'isManifestBlocksRecord', async: false })
export class IsManifestBlocksRecord implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const item = value[key];

        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          return false;
        }

        const instance = plainToInstance(BlockCatalogEntryDto, item);
        const errors = validateSync(instance);
        if (errors.length > 0) {
          return false;
        }
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'One or more entries in the blocks record are invalid.';
  }
}
