import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from 'src/common/entities/room.entity';

@Controller('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a room', description: 'Create a new room' })
  @ApiBody({
    type: CreateRoomDto,
    description: 'Room data to create a new room',
  })
  @ApiResponse({
    status: 201,
    description: 'The room has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createRoom(
    @Body() createRoomDto: CreateRoomDto,
    @Request() req,
  ): Promise<{ room: Room }> {
    return this.roomService.createRoom(createRoomDto, req.user.id);
  }
}
