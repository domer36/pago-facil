import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ProspectEmailConflictError,
  ProspectNotFoundError,
  ProspectService,
} from '../application/prospect.service.js';
import { ProspectValidationError } from '../domain/prospect.js';
import type { Prospect } from '../domain/prospect.js';

@Controller('customers')
export class ProspectController {
  constructor(private readonly prospectService: ProspectService) {}

  @Get()
  findActive(@Query('search') search?: string): Promise<Prospect[]> {
    return this.prospectService.findActive(search);
  }

  @Get(':id')
  async findActiveById(@Param('id') id: string): Promise<Prospect> {
    try {
      return await this.prospectService.findActiveById(id);
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  @Post()
  async create(@Body() body: unknown): Promise<Prospect> {
    try {
      return await this.prospectService.create(body);
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<Prospect> {
    try {
      return await this.prospectService.update(id, body);
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.prospectService.deactivate(id);
      return { message: 'El prospecto se dio de baja correctamente.' };
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  private throwHttpError(error: unknown): never {
    if (error instanceof ProspectValidationError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof ProspectEmailConflictError) {
      throw new ConflictException(error.message);
    }
    if (error instanceof ProspectNotFoundError) {
      throw new NotFoundException(error.message);
    }
    throw error;
  }
}
