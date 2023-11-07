import fs from 'fs';
import path from 'path';

import { Injectable, Logger } from '@nestjs/common';

import { validateSync, ValidationError } from 'class-validator';
import dotenv from 'dotenv';

import { ConfigDto } from './dto/config.dto';

const ROOT_PATH = process.cwd();
const ENV_FILE = path.resolve(ROOT_PATH, '.env');

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  private readonly configuration: ConfigDto;

  constructor() {
    const configuration = new ConfigDto();

    Object.assign(configuration, {
      ...ConfigService.getDotenvConfiguration(),
      ...process.env,
    });

    const validationResult = validateSync(configuration, {
      whitelist: true,
      forbidUnknownValues: true,
    });

    if (validationResult && validationResult.length > 0) {
      this.logger.error('Configurations invalid', `Validation errors:\n${ConfigService.extractValidationErrorMessages(validationResult)}`);
      throw new Error(`Configurations invalid \n${validationResult.toString()}`);
    }

    this.configuration = configuration;
  }

  public static getDotenvConfiguration(): Record<string, string | number> {
    let configuration = {};
    if (fs.existsSync(ENV_FILE)) {
      configuration = dotenv.parse(fs.readFileSync(ENV_FILE));
      dotenv.config();
    }
    return configuration;
  }

  public static extractValidationErrorMessages(validationErrors: ValidationError[]): string {
    return validationErrors
      .map(
        (validationError) =>
          `${Object.values(validationError.constraints)
            .map((constraint) => `* ${constraint}.`)
            .join('\n')}`,
      )
      .join('.\n');
  }

  public get<K extends keyof ConfigDto>(key: K): ConfigDto[K] {
    if (!this.configuration[key] || this.configuration[key] === 'null') {
      return;
    }
    return this.configuration[key];
  }
}
