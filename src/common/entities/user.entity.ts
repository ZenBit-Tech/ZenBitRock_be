import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

import { Chat } from 'common/entities/chat.entity';
import { ChatMessageReader } from 'common/entities/chatMessageReader.entity';
import { CoreEntity } from 'common/entities/core.entity';
import { Message } from 'common/entities/message.entity';

@Entity()
export class User extends CoreEntity {
  @Column({ type: 'varchar', name: 'email', default: '' })
  email: string;

  @Column({ type: 'varchar', name: 'password', default: '' })
  password: string;

  @Column({ type: 'boolean', name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', name: 'veritication_code', default: '' })
  verificationCode: string;

  @Column({ type: 'varchar', name: 'firstName', default: null })
  firstName: string;

  @Column({ type: 'varchar', name: 'lastName', default: null })
  lastName: string;

  @Column({ type: 'varchar', name: 'role', default: null })
  role: string;

  @Column({ type: 'varchar', name: 'gender', default: null })
  gender: string;

  @Column({ type: 'varchar', name: 'dateOfBirth', default: null })
  dateOfBirth: string;

  @Column({ type: 'varchar', name: 'nationality', default: null })
  nationality: string;

  @Column({ type: 'varchar', name: 'identity', default: null })
  identity: string;

  @Column({ type: 'varchar', name: 'status', default: null })
  status: string;

  @Column({ type: 'varchar', name: 'street', default: null })
  street: string;

  @Column({ type: 'varchar', name: 'city', default: null })
  city: string;

  @Column({ type: 'varchar', name: 'state', default: null })
  state: string;

  @Column({ type: 'varchar', name: 'zip', default: null })
  zip: string;

  @Column({ type: 'varchar', name: 'country', default: null })
  country: string;

  @Column({ type: 'varchar', name: 'phone', default: null })
  phone: string;

  @Column({ type: 'varchar', name: 'userDocumentUrl', default: null })
  userDocumentUrl: string;

  @Column({ type: 'varchar', name: 'userDocumentPublicId', default: null })
  userDocumentPublicId: string;

  @Column({ type: 'varchar', name: 'avatarUrl', default: null })
  avatarUrl: string;

  @Column({ type: 'varchar', name: 'avatarPublicId', default: null })
  avatarPublicId: string;

  @Column({ type: 'varchar', name: 'qobrixContactId', default: null })
  qobrixContactId: string;

  @Column({ type: 'varchar', name: 'qobrixAgentId', default: null })
  qobrixAgentId: string;

  @Column({ type: 'varchar', name: 'agencyName', default: null })
  agencyName: string;

  @Column({ type: 'text', name: 'description', default: null })
  description: string;

  @OneToMany(() => Message, (message) => message.owner, { onDelete: 'CASCADE' })
  messages: Message[];

  @OneToMany(() => Chat, (chat) => chat.owner, { onDelete: 'CASCADE' })
  chats: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.members, { onDelete: 'CASCADE' })
  joinedChats: Chat[];

  @OneToMany(() => ChatMessageReader, (reader) => reader.user)
  readMessages: ChatMessageReader[];
}
