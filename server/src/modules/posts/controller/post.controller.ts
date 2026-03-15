import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostService } from '../service/post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination' })
  @ApiResponse({ status: 200, description: 'Return all posts' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponseDto<any>> {
    return this.postService.findAll(page, limit).then(({ data, total }) => {
      return new PaginatedResponseDto(data, total, page, limit);
    });
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published posts' })
  @ApiResponse({ status: 200, description: 'Return published posts' })
  findPublished(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponseDto<any>> {
    return this.postService.findPublished(page, limit).then(({ data, total }) => {
      return new PaginatedResponseDto(data, total, page, limit, 'Published posts retrieved');
    });
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: 'Get posts by author' })
  @ApiResponse({ status: 200, description: 'Return author posts' })
  findByAuthor(
    @Param('authorId') authorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponseDto<any>> {
    return this.postService.findByAuthor(authorId, page, limit).then(({ data, total }) => {
      return new PaginatedResponseDto(data, total, page, limit);
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Return post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.postService.delete(id);
  }
}
