import { PartialType } from '@nestjs/mapped-types';
import { CreateFooDto } from './CreateFooDto';

export class UpdateFooDto extends PartialType(CreateFooDto) { }
