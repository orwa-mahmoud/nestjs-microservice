import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
@Module({
  imports: [CommonModule, AuthModule, ProductsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
