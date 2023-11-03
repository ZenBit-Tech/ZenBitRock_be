import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/services/users/dto/create-user.dto';
import { UsersService } from 'src/services/users/users.service';

@Injectable()
export class UsersControllerService {
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  getUserById(id: string) {
    return this.usersService.getUserById(id);
  }
}
