import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Transactions } from 'src/transactions/transaction.entity';
import { PaymentService } from './payments.service';
import { Debt } from 'src/debt/debt.entity';
import { PaymentsController } from './payments.controller';
import { PaymentGateway } from 'src/websockets/payment.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Debt, Transactions]),
     ConfigModule, // ConfigService uchun
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [PaymentService,PaymentGateway],
  controllers: [PaymentsController,],
  exports: [PaymentService],
})
export class PaymentsModule {}