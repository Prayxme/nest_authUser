import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGuard } from "./user/user.guard";
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstant } from "./user/constants";
import { RolesGuard } from "./guards/roles/roles.guard";
import { ConfigModule } from '@nestjs/config'


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(`${process.env.MONGODB_URL}`), UserModule,
    JwtModule.register({
      secret: jwtConstant.secret,
      signOptions: { expiresIn: '1h' },
    }),
    ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: UserGuard
    },
    
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard
    }
    

  ],
})
export class AppModule {}
