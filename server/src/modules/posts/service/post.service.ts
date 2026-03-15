import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository, PostWithAuthor } from '../repository/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private postRepository: PostRepository) {}

  async create(createPostDto: CreatePostDto): Promise<PostWithAuthor> {
    return this.postRepository.create(createPostDto);
  }

  async findAll(page: number, limit: number): Promise<{
    data: PostWithAuthor[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepository.findAll(skip, limit),
      this.postRepository.count(),
    ]);

    return { data, total };
  }

  async findPublished(page: number, limit: number): Promise<{
    data: PostWithAuthor[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepository.findPublished(skip, limit),
      this.postRepository.count(),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<PostWithAuthor> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findByAuthor(
    authorId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: PostWithAuthor[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postRepository.findByAuthor(authorId, skip, limit),
      this.postRepository.count(),
    ]);

    return { data, total };
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostWithAuthor> {
    const existingPost = await this.postRepository.findById(id);

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    return this.postRepository.update(id, updatePostDto);
  }

  async delete(id: string): Promise<void> {
    const existingPost = await this.postRepository.findById(id);

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.delete(id);
  }
}
