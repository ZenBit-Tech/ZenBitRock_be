import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { UsersControllerService } from './users.controller.service';
import { CreateUserDto } from 'src/services/users/dto/create-user.dto';
import { ResponseUserDto } from 'src/services/users/dto/response-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersControllerService: UsersControllerService,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.usersControllerService.createUser(createUserDto);
  }

  @Get()
  getAllUsers(): Promise<ResponseUserDto[]> {
    return this.usersControllerService.getAllUsers();
  }

  @Get(':id')
  getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUserDto> {
    return this.usersControllerService.getUserById(id);
  }
}
