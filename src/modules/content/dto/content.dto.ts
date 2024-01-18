import { IsArray, ValidateNested } from 'class-validator';

export class UpdateContentDto {
  @IsArray()
  @ValidateNested({ each: true })
  contents: Array<{
    title: string;
    link: string;
    screenshot?: string;
    type: string;
  }>;
}
