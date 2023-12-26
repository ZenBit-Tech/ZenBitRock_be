import { Injectable, NotFoundException } from '@nestjs/common';
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

  

async createRoom(createRoomDto: CreateRoomDto, userId: string) : Promise<{ room: Room }>{
    try {
      const room = this.roomRepository.create({
        title: createRoomDto.title,
        owner: { id: userId },
      });
      await this.roomRepository.save(room);
      return { room }; 
    } catch (error) {
      throw error; 
    }
  }

s
}