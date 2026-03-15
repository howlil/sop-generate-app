import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { IPostRepository } from './post.repository.interface';

export type PostWithAuthor = Awaited<ReturnType<PrismaService['post']['findMany']>>[number];

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 10): Promise<PostWithAuthor[]> {
    return this.prisma.post.findMany({
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<PostWithAuthor | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: CreatePostDto): Promise<PostWithAuthor> {
    return this.prisma.post.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdatePostDto): Promise<PostWithAuthor> {
    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return this.prisma.post.count();
  }

  async findByAuthor(authorId: string, skip = 0, take = 10): Promise<PostWithAuthor[]> {
    return this.prisma.post.findMany({
      where: { authorId },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findPublished(skip = 0, take = 10): Promise<PostWithAuthor[]> {
    return this.prisma.post.findMany({
      where: { published: true },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
