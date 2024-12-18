import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { sign } from 'jsonwebtoken';
import { UserGuard } from './user.guard';
import { Public } from "src/decorator";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserGuard)
  @Get('/get/:id')
  findOne(@Param('id') id: string){
    return this.userService.findOne(id);
  }


  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const userExists = await this.userService.findOneByEmail(createUserDto.email);
    if (userExists) {
      throw new Error('User already exists');
    }
    const user = await this.userService.create(createUserDto);
    return { message: 'User created successfully', user };
  }

  @Public()
  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { email: user.email, username: user.username, sub: user.id };
    // const token = sign(payload, 'secretKey', { expiresIn: '1h' });
    const token = await this.userService.jwtService.signAsync(payload)
    return { token, user: { email: user.email, username: user.username } };
  }
}
