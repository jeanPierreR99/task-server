import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto, LoginUser, UpdateUserDto } from 'src/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Category } from 'src/entities/category.entity';
import { UnauthorizedException } from '@nestjs/common';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const saltOrRounds = 10;
        const passwordHash = await bcrypt.hash(createUserDto.passwordHash, saltOrRounds);

        const user = this.userRepo.create({
            ...createUserDto,
            passwordHash,
        });

        const savedUser = await this.userRepo.save(user);

        return savedUser;
    }

    findProjectAll(projectId: string): Promise<User[]> {
        return this.userRepo.find({ relations: ['role', 'project'], where: { project: { id: projectId } } });
    }

    findAll(): Promise<User[]> {
        return this.userRepo.find({ relations: ['role', 'project'] });
    }

    findById(userId: string): Promise<User> {
        return this.userRepo.findOne({ where: { id: userId } });
    }


    async validateUser(loginUser: LoginUser): Promise<User | null> {
        const user = await this.userRepo.findOne({ where: { email: loginUser.email }, relations: ['role', 'project'] });
        if (!user) return null;

        const isMatch = await bcrypt.compare(loginUser.passwordHash, user.passwordHash);
        return isMatch ? user : null;
    }

    async login(loginUser: LoginUser): Promise<User> {
        const user = await this.validateUser(loginUser);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.active) {
            throw new UnauthorizedException('Account is inactive');
        }

        return user;
    }


    async searchByName(query: string): Promise<User[]> {
        return await this.userRepo.find({
            where: {
                name: ILike(`%${query}%`)
            }
        });
    }

    async changeRole(userId: string, roleId: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        user.roleId = roleId;
        return await this.userRepo.save(user);
    }

    async changeActiveStatus(userId: string, isActive: boolean): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        user.active = isActive;
        return await this.userRepo.save(user);
    }

    async update(userId: string, updateData: UpdateUserDto): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (updateData.passwordHash) {
            const saltOrRounds = 10;
            updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, saltOrRounds);
        }

        Object.assign(user, updateData);

        return await this.userRepo.save(user);
    }

}
