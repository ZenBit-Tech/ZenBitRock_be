import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
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

  @Get('/')
  @ApiOperation({ summary: 'Getting all rooms' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getRooms(): Promise<Room[]> {
    return this.roomService.getRooms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Getting room by id' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getRoom(@Param('id') id: string): Promise<Room> {
    try {
      return await this.roomService.getRoom(id);
    } catch (error) {
      throw error;
    }
  }

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
  const memberIds: string[] = createRoomDto.memberIds || [];
  return this.roomService.createRoom(createRoomDto, req.user.id, memberIds);
}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  deleteRoom(@Param('id') id: string, @Request() req): Promise<void> {
    return this.roomService.deleteRoom(id, req.user.id);
  }
}
