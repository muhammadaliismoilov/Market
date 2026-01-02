import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // TO'G'RILANDI: ConfigService import qilindi
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { BranchsModule } from './branchs/branchs.module';
import { ScheduleModule } from '@nestjs/schedule'; 
import { UserModule } from './users/users.module';
import { TransactionModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './peyments/payments.module';
import { DebtModule } from './debt/debt.module';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    // TO'G'RILANDI: TypeORM konfiguratsiyasida ConfigService inject qilindi (best practice)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        // TO'G'RILANDI: Productionda synchronize: false bo'lishi kerak (xavfsizlik uchun)
        // Developmentda true, productionda false qiling
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Productionda false, developmentda true
      }),
      inject: [ConfigService],
    }),
     ScheduleModule.forRoot(),
    AuthModule,
    BranchsModule,
    UserModule,
    ProductsModule,
    TransactionModule,
    PaymentsModule,
    DebtModule,
    ReportsModule,
  ],
})
export class AppModule {}
