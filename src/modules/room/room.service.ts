import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/common/entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async getRooms(): Promise<Room[] | []> {
    try {
      const rooms = await this.roomRepository.find({
        order: { createdAt: 'DESC' },
      });

      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async getRoom(id: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findOneBy({ id });

      if (!room) {
        throw new NotFoundException(` not found`);
      }
      return room;
    } catch (error) {}
  }

  async createRoom(
    createRoomDto: CreateRoomDto,
    userId: string,
    memberIds: string[],
  ): Promise<{ room: Room }> {
    try {
      const room = this.roomRepository.create({
        title: createRoomDto.title,
        owner: { id: userId },
        members: memberIds.map((memberId) => ({ id: memberId })),
      });
      await this.roomRepository.save(room);
      return { room };
    } catch (error) {
      throw error;
    }
  }

  async deleteRoom(id: string, userId: string): Promise<void> {
    try {
      const deleteRoom = await this.roomRepository.delete({
        id,
        owner: { id: userId },
      });
      if (!deleteRoom.affected) {
        throw new NotFoundException(`not found`);
      }
      throw new HttpException('Room deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }
}
