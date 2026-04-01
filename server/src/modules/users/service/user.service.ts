import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository, UserWithoutPassword } from '../repository/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PeranPengguna } from '../../../generated/prisma';
import * as bcrypt from 'bcrypt';
import { UserMessages } from '../../../common/messages';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepository.findByEmailWithPassword(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException(UserMessages.EMAIL_EXISTS);
    }

    // [P2-D] Enforce: 1 KEPALA_OPD and 1 KOORDINATOR_TIM_PENYUSUN per OPD
    if (
      createUserDto.peran === PeranPengguna.KEPALA_OPD ||
      createUserDto.peran === PeranPengguna.KOORDINATOR_TIM_PENYUSUN
    ) {
      if (!createUserDto.opdId) {
        throw new BadRequestException(UserMessages.OPD_REQUIRED);
      }
      const existing = await this.userRepository.findActiveRoleInOpd(
        createUserDto.peran,
        createUserDto.opdId,
      );
      if (existing) {
        throw new ConflictException(
          `OPD ini sudah memiliki ${createUserDto.peran} aktif`,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.kataSandi, 10);

    return this.userRepository.create({
      ...createUserDto,
      kataSandi: hashedPassword,
    });
  }

  async findAll(page: number, limit: number): Promise<{
    data: UserWithoutPassword[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userRepository.findAll(skip, limit),
      this.userRepository.count(),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    if (updateUserDto.email) {
      const emailExists = await this.userRepository.findByEmailWithPassword(
        updateUserDto.email,
      );
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException(UserMessages.EMAIL_ALREADY_REGISTERED);
      }
    }

    if (updateUserDto.kataSandi) {
      updateUserDto.kataSandi = await bcrypt.hash(updateUserDto.kataSandi, 10);
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    // [P1-G] Block soft-delete if user still has active team memberships
    const hasActiveMembership = await this.userRepository.hasActiveMembership(id);
    if (hasActiveMembership) {
      throw new ConflictException(
        'Pengguna tidak dapat dihapus karena masih terdaftar sebagai anggota tim aktif',
      );
    }

    await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.kataSandi);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      nama: user.nama,
      peran: user.peran,
      opdId: user.opdId,
      nip: user.nip,
      jabatan: user.jabatan,
      pangkat: user.pangkat,
      nohp: user.nohp,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }
}
