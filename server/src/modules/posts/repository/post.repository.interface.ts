import { Post } from '../../../generated/prisma';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

export interface IPostRepository {
  findAll(skip?: number, take?: number): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: CreatePostDto): Promise<any>;
  update(id: string, data: UpdatePostDto): Promise<any>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  findByAuthor(authorId: string, skip?: number, take?: number): Promise<any[]>;
  findPublished(skip?: number, take?: number): Promise<any[]>;
}
