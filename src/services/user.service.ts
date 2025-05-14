import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ILike, In, Repository } from 'typeorm';
import { CreateUserDto, LoginUser, UpdateUserDto } from 'src/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { Project } from 'src/entities';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const saltOrRounds = 10;
        const passwordHash = await bcrypt.hash(createUserDto.passwordHash, saltOrRounds);

        const user = this.userRepo.create({
            ...createUserDto,
            passwordHash,
            projects: createUserDto.project.map(p => ({ id: p.id })),
        });


        const savedUser = await this.userRepo.save(user);

        return savedUser;
    }

    findProjectAll(projectId: string): Promise<User[]> {
        return this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('user.projects', 'project')
            .where('project.id = :projectId', { projectId })
            .getMany();
    }


    findAll(): Promise<User[]> {
        return this.userRepo.find({ relations: ['role', 'projects'] });
    }

    findById(userId: string): Promise<User> {
        return this.userRepo.findOne({ where: { id: userId }, relations: ['projects'] });
    }


    async validateUser(loginUser: LoginUser): Promise<User | null> {
        const user = await this.userRepo.findOne({ where: { email: loginUser.email }, relations: ['role', 'projects'] });
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

    async searchByName(query: string, projectId: string): Promise<User[]> {
        return await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.projects', 'project')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.name LIKE :query', { query: `%${query}%` })
            .andWhere('project.id = :projectId', { projectId })
            .getMany();
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

    // users.service.ts
    async updateUserProjects(userId: string, projectIds: string[]): Promise<any> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['projects'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const projects = await this.projectRepo.find({
            where: { id: In(projectIds) },
        });

        if (projects.length !== projectIds.length) {
            throw new BadRequestException('Algunos proyectos no existen');
        }

        user.projects = projects;

        return await this.userRepo.save(user);
    }


}
