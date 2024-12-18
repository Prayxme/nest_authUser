import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {


  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    public readonly jwtService: JwtService
  ) {}

  // Método para crear un usuario con validación y manejo de errores
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await newUser.save();
    } catch (error) {
      throw new HttpException(
        'Los datos suministrados no se ajustan al UserDTO',
        HttpStatus.NOT_ACCEPTABLE
      );
    }
  }

  // Método para manejar el inicio de sesión
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Contraseña inválida', HttpStatus.UNAUTHORIZED);
    }

    // Crear el payload para el token
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.role
    };

    // Generar y retornar el token
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Buscar un usuario por su correo
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Buscar un usuario por su nombre de usuario
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  // Validar usuario con email y contraseña
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  findOne(id: string) {
    return `Este evento retorna el id: ${id} del usuario`
  }
}
