import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { jwtConstant } from "./constants";
import { IS_PUBLIC_KEY } from "../decorator";
import { Reflector } from "@nestjs/core";


@Injectable()
export class UserGuard implements CanActivate {

  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  extractTokenFromHeader(request: Request): string | undefined
  {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), 
      context.getClass()
    ]);

    if (isPublic) return true

    
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException();
    }

    try{
      const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstant.secret });

      request['user'] = payload;

    } catch (error){
      throw new UnauthorizedException();
    }

    return true;
  }
}